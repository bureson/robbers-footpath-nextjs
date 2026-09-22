export type GpxPoint = { lat: number; lon: number; ele: number | null };

export const parseGpx = (text: string): GpxPoint[] => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, 'application/xml');
  const trkpts = xml.getElementsByTagName('trkpt');
  const rtepts = xml.getElementsByTagName('rtept');
  const nodes = trkpts.length > 0 ? trkpts : rtepts;
  const points: GpxPoint[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const lat = parseFloat(nodes[i].getAttribute('lat') || '');
    const lon = parseFloat(nodes[i].getAttribute('lon') || '');
    if (Number.isNaN(lat) || Number.isNaN(lon)) continue;
    const eleNode = nodes[i].getElementsByTagName('ele')[0];
    const ele = eleNode ? parseFloat(eleNode.textContent || '') : NaN;
    points.push({ lat, lon, ele: Number.isNaN(ele) ? null : ele });
  }
  return points;
};

export const fetchGpx = async (url: string): Promise<GpxPoint[]> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to load GPX file');
  const points = parseGpx(await response.text());
  if (points.length === 0) throw new Error('No route points found in GPX file');
  return points;
};

const EARTH_RADIUS_M = 6371000;
const toRad = (deg: number) => deg * Math.PI / 180;

export const haversineM = (a: GpxPoint, b: GpxPoint) => {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
};

export const distanceKm = (points: GpxPoint[]) => {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += haversineM(points[i - 1], points[i]);
  return total / 1000;
};

// Elevations smoothed with a small moving average so GPS noise does not inflate the climb.
export const smoothedElevations = (points: GpxPoint[], window = 5): number[] => {
  const raw = points.map(point => point.ele).filter((ele): ele is number => ele != null);
  if (raw.length === 0) return [];
  const half = Math.floor(window / 2);
  return raw.map((_, i) => {
    const from = Math.max(0, i - half);
    const to = Math.min(raw.length - 1, i + half);
    let sum = 0;
    for (let j = from; j <= to; j++) sum += raw[j];
    return sum / (to - from + 1);
  });
};

export const climbM = (points: GpxPoint[]) => {
  const eles = smoothedElevations(points);
  let climb = 0;
  for (let i = 1; i < eles.length; i++) {
    const delta = eles[i] - eles[i - 1];
    if (delta > 0) climb += delta;
  }
  return climb;
};

export const elevationRange = (points: GpxPoint[]) => {
  const eles = smoothedElevations(points);
  if (eles.length === 0) return null;
  return { min: Math.min(...eles), max: Math.max(...eles) };
};

export const hasElevation = (points: GpxPoint[]) => points.some(point => point.ele != null);

export type ElevationSample = { km: number; ele: number };

// Smoothed elevation against cumulative distance, one sample per point that carries an elevation.
export const elevationSeries = (points: GpxPoint[]): ElevationSample[] => {
  const eles = smoothedElevations(points);
  if (eles.length === 0) return [];
  const series: ElevationSample[] = [];
  let cumulative = 0;
  let eleIndex = 0;
  for (let i = 0; i < points.length; i++) {
    if (i > 0) cumulative += haversineM(points[i - 1], points[i]);
    if (points[i].ele == null) continue;
    series.push({ km: cumulative / 1000, ele: eles[eleIndex] });
    eleIndex += 1;
  }
  return series;
};

// Index of the sample closest to the given distance (binary search on the sorted series).
export const nearestSampleIndex = (series: ElevationSample[], km: number) => {
  if (series.length === 0) return -1;
  let low = 0;
  let high = series.length - 1;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (series[mid].km < km) low = mid + 1;
    else high = mid;
  }
  if (low > 0 && Math.abs(series[low - 1].km - km) < Math.abs(series[low].km - km)) return low - 1;
  return low;
};

// Polyline points for an SVG elevation profile filled down to the baseline.
export const elevationPolyline = (points: GpxPoint[], width: number, height: number, padding = 2) => {
  const eles = smoothedElevations(points);
  if (eles.length < 2) return '';
  const min = Math.min(...eles);
  const max = Math.max(...eles);
  const span = Math.max(max - min, 1);
  const inner = height - padding * 2;
  const coords = eles.map((ele, i) => {
    const x = i / (eles.length - 1) * width;
    const y = padding + inner - (ele - min) / span * inner;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return [`0,${height}`, ...coords, `${width},${height}`].join(' ');
};

// Polyline points for a small top-down route preview, aspect-corrected for latitude.
export const routePolyline = (points: GpxPoint[], width: number, height: number, padding = 8) => {
  if (points.length < 2) return '';
  const lats = points.map(point => point.lat);
  const lons = points.map(point => point.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const cosLat = Math.cos(toRad((minLat + maxLat) / 2));
  const spanX = Math.max((maxLon - minLon) * cosLat, 1e-9);
  const spanY = Math.max(maxLat - minLat, 1e-9);
  const scale = Math.min((width - padding * 2) / spanX, (height - padding * 2) / spanY);
  const offsetX = (width - spanX * scale) / 2;
  const offsetY = (height - spanY * scale) / 2;
  return points.map(point => {
    const x = offsetX + (point.lon - minLon) * cosLat * scale;
    const y = offsetY + (maxLat - point.lat) * scale;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
};
