'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { GpxPoint, elevationPolyline, elevationSeries, fetchGpx, nearestSampleIndex, routePolyline } from '../lib/gpx';

type GpxState = { url: string; points: GpxPoint[] | null; error: string };

export const useGpx = (url?: string | null) => {
  const [state, setState] = useState<GpxState | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    fetchGpx(url)
      .then(points => { if (!cancelled) setState({ url, points, error: '' }); })
      .catch(err => { if (!cancelled) setState({ url, points: null, error: err instanceof Error ? err.message : 'Failed to load GPX file' }); });
    return () => { cancelled = true; };
  }, [url]);

  // Results are keyed by URL, so a stale track never shows for a new one.
  const current = url && state?.url === url ? state : null;
  return { points: current?.points ?? null, error: current?.error ?? '' };
};

type ElevationChartProps = {
  points: GpxPoint[];
  stroke: string;
  fill: string;
  height?: number;
  strokeWidth?: number;
  className?: string;
  // Stretch to the parent's height instead of a fixed pixel height.
  stretch?: boolean;
};

export function ElevationChart (props: ElevationChartProps) {
  const { points, stroke, fill, height = 80, strokeWidth = 3, className, stretch } = props;
  const width = 1000;
  const viewHeight = stretch ? 100 : height;
  const polyline = elevationPolyline(points, width, viewHeight);
  if (!polyline) return null;
  const style = stretch ? { width: '100%', height: '100%', display: 'block' } : { width: '100%', height, display: 'block' };
  return (
    <svg viewBox={`0 0 ${width} ${viewHeight}`} preserveAspectRatio='none' className={className} style={style} aria-hidden='true'>
      <polyline fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin='round' vectorEffect='non-scaling-stroke' points={polyline} />
    </svg>
  );
}

const formatKm = (km: number) => (Math.round(km * 10) / 10).toString();

// Whole-km ticks giving about four intervals, ending at the real total.
const distanceTicks = (totalKm: number) => {
  if (!(totalKm > 0)) return [];
  const step = [1, 2, 5, 10, 20, 50].find(candidate => totalKm / candidate <= 5) ?? 100;
  const ticks: Array<{ km: number; label: string }> = [{ km: 0, label: '0 km' }];
  for (let km = step; km < totalKm - step * 0.35; km += step) ticks.push({ km, label: String(km) });
  ticks.push({ km: totalKm, label: `${formatKm(totalKm)} km` });
  return ticks;
};

type ElevationProfileProps = {
  points: GpxPoint[];
  stroke: string;
  fill: string;
  className?: string;
};

const VIEW_W = 1000;
const VIEW_H = 100;
const PAD_PCT = 4; // vertical padding inside the plot, in percent of its height

// Interactive profile: altitude axis on the left, distance axis below, hover crosshair with the altitude at the cursor.
export function ElevationProfile (props: ElevationProfileProps) {
  const { points, stroke, fill, className } = props;
  const plotRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const series = useMemo(() => elevationSeries(points), [points]);
  const stats = useMemo(() => {
    if (series.length < 2) return null;
    const eles = series.map(sample => sample.ele);
    const min = Math.min(...eles);
    const max = Math.max(...eles);
    const totalKm = series[series.length - 1].km;
    return { min, max, span: Math.max(max - min, 1), totalKm: Math.max(totalKm, 1e-6) };
  }, [series]);

  const polyline = useMemo(() => {
    if (!stats) return '';
    const inner = VIEW_H * (1 - PAD_PCT * 2 / 100);
    const top = VIEW_H * PAD_PCT / 100;
    const coords = series.map(sample => {
      const x = sample.km / stats.totalKm * VIEW_W;
      const y = top + inner - (sample.ele - stats.min) / stats.span * inner;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return [`0,${VIEW_H}`, ...coords, `${VIEW_W},${VIEW_H}`].join(' ');
  }, [series, stats]);

  if (!stats) return null;

  const xPct = (km: number) => km / stats.totalKm * 100;
  const yPct = (ele: number) => PAD_PCT + (1 - (ele - stats.min) / stats.span) * (100 - PAD_PCT * 2);
  const gridLevels = [stats.max, (stats.max + stats.min) / 2, stats.min];
  const ticks = distanceTicks(stats.totalKm);
  const hover = hoverIndex != null ? series[hoverIndex] : null;
  const hoverOnRight = hover ? xPct(hover.km) > 70 : false;

  const locate = (clientX: number) => {
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setHoverIndex(nearestSampleIndex(series, fraction * stats.totalKm));
  };
  const onMouseMove = (ev: React.MouseEvent) => locate(ev.clientX);
  const onTouchMove = (ev: React.TouchEvent) => { if (ev.touches[0]) locate(ev.touches[0].clientX); };
  const onLeave = () => setHoverIndex(null);

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
      <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: 8 }}>
        <div style={{ position: 'relative', width: 44, flex: 'none' }} aria-hidden='true'>
          {gridLevels.map((level, i) => (
            <span
              key={i}
              className='text-[11px] font-semibold text-sage'
              style={{ position: 'absolute', right: 0, top: `${yPct(level)}%`, transform: 'translateY(-50%)', whiteSpace: 'nowrap' }}
            >
              {Math.round(level)} m
            </span>
          ))}
        </div>
        <div
          ref={plotRef}
          style={{ position: 'relative', flex: 1, minHeight: 0, cursor: 'crosshair', touchAction: 'pan-y' }}
          onMouseMove={onMouseMove}
          onMouseLeave={onLeave}
          onTouchStart={onTouchMove}
          onTouchMove={onTouchMove}
          onTouchEnd={onLeave}
        >
          {gridLevels.map((level, i) => (
            <div key={i} aria-hidden='true' style={{ position: 'absolute', left: 0, right: 0, top: `${yPct(level)}%`, borderTop: '1px dashed rgba(91,109,96,.3)' }} />
          ))}
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio='none' style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} aria-hidden='true'>
            <polyline fill={fill} stroke={stroke} strokeWidth={3} strokeLinejoin='round' vectorEffect='non-scaling-stroke' points={polyline} />
          </svg>
          {hover && (
            <div aria-hidden='true' style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${xPct(hover.km)}%`, borderLeft: '1.5px solid #14261b' }} />
              <div style={{ position: 'absolute', left: `${xPct(hover.km)}%`, top: `${yPct(hover.ele)}%`, width: 10, height: 10, borderRadius: '50%', background: stroke, border: '2px solid #fff', boxShadow: '0 0 0 1.5px #14261b', transform: 'translate(-50%, -50%)' }} />
              <div
                className='text-[12px] font-bold'
                style={{
                  position: 'absolute', top: 4, left: `${xPct(hover.km)}%`, transform: hoverOnRight ? 'translateX(calc(-100% - 8px))' : 'translateX(8px)',
                  background: '#14261b', color: '#fff', padding: '4px 8px', borderRadius: 8, whiteSpace: 'nowrap',
                }}
              >
                {Math.round(hover.ele)} m <span style={{ opacity: .6, fontWeight: 600 }}>· {formatKm(hover.km)} km</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }} aria-hidden='true'>
        <div style={{ width: 44, flex: 'none' }} />
        <div className='text-[11px] font-semibold text-sage' style={{ position: 'relative', flex: 1, height: 16 }}>
          {ticks.map((tick, i) => {
            const last = i === ticks.length - 1;
            return (
              <span key={tick.km} style={{ position: 'absolute', top: 0, left: `${xPct(tick.km)}%`, whiteSpace: 'nowrap', transform: last ? 'translateX(-100%)' : i === 0 ? 'none' : 'translateX(-50%)' }}>
                {tick.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type RoutePreviewProps = {
  points: GpxPoint[];
  stroke: string;
  height?: number;
  className?: string;
};

export function RoutePreview (props: RoutePreviewProps) {
  const { points, stroke, height = 150, className } = props;
  const width = 320;
  const polyline = routePolyline(points, width, height);
  if (!polyline) return null;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio='xMidYMid meet' className={className} style={{ width: '100%', height, display: 'block' }} aria-hidden='true'>
      <polyline fill='none' stroke={stroke} strokeWidth={2.5} strokeLinejoin='round' strokeLinecap='round' points={polyline} />
    </svg>
  );
}
