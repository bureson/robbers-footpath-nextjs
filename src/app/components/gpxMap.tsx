import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { fetchGpx } from '../lib/gpx';

interface GPXMapProps {
  gpxUrl: string;
  color?: string;
}

const TILE_URL = 'https://api.mapy.cz/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=keauScA4B5LMSBSWdUf_og2zqpGJRPmh5JTmobrqxh8';

// Leaflet is driven imperatively so that every (re)mount, including Fast Refresh, tears the old map down first.
const GPXMap: React.FC<GPXMapProps> = ({ gpxUrl, color = '#d21f1f' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [track, setTrack] = useState<{ url: string; points: [number, number][] } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchGpx(gpxUrl)
      .then(points => {
        if (cancelled) return;
        setTrack({ url: gpxUrl, points: points.map(point => [point.lat, point.lon] as [number, number]) });
      })
      .catch(err => {
        if (cancelled) return;
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to load GPX file');
      });
    return () => { cancelled = true; };
  }, [gpxUrl]);

  const points = track?.url === gpxUrl ? track.points : null;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !points) return;

    const map = L.map(container, { zoomControl: true, attributionControl: false });
    L.tileLayer(TILE_URL, { maxZoom: 19 }).addTo(map);
    const line = L.polyline(points, { color, weight: 4 }).addTo(map);
    map.fitBounds(line.getBounds(), { padding: [24, 24] });

    // The container can be sized by a grid or flex parent that settles after the first paint.
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => map.invalidateSize()) : null;
    observer?.observe(container);

    return () => {
      observer?.disconnect();
      map.remove();
    };
  }, [points, color]);

  if (error) {
    return <div className='flex h-full items-center justify-center p-4 text-center text-[13px] font-semibold text-sage'>{error}</div>;
  }

  return (
    <div className='relative h-full w-full'>
      {!points && <div className='absolute inset-0 flex items-center justify-center font-mono text-[12px] tracking-[.08em] text-sage'>LOADING ROUTE…</div>}
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default GPXMap;
