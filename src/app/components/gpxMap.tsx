import { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import Fullscreen from '@mui/icons-material/Fullscreen';
import FullscreenExit from '@mui/icons-material/FullscreenExit';
import 'leaflet/dist/leaflet.css';

import { fetchGpx } from '../lib/gpx';

interface GPXMapProps {
  gpxUrl: string;
  color?: string;
  allowFullscreen?: boolean;
}

const TILE_URL = 'https://api.mapy.cz/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=keauScA4B5LMSBSWdUf_og2zqpGJRPmh5JTmobrqxh8';

// Leaflet is driven imperatively so that every (re)mount, including Fast Refresh, tears the old map down first.
const GPXMap: React.FC<GPXMapProps> = ({ gpxUrl, color = '#d21f1f', allowFullscreen = true }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<(() => void) | null>(null);
  const [track, setTrack] = useState<{ url: string; points: [number, number][] } | null>(null);
  const [error, setError] = useState('');
  // 'native' uses the Fullscreen API; 'fallback' pins the map over the page where the API is missing (e.g. iPhone Safari).
  const [fullscreen, setFullscreen] = useState<'off' | 'native' | 'fallback'>('off');

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
    const fit = () => map.fitBounds(line.getBounds(), { padding: [24, 24] });
    fit();
    fitRef.current = fit;

    // The container can be sized by a grid or flex parent that settles after the first paint, and it resizes on fullscreen.
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => map.invalidateSize()) : null;
    observer?.observe(container);

    return () => {
      observer?.disconnect();
      fitRef.current = null;
      map.remove();
    };
  }, [points, color]);

  // Refit the route once the map has taken its new size after entering or leaving fullscreen.
  useEffect(() => {
    const timer = setTimeout(() => fitRef.current?.(), 250);
    return () => clearTimeout(timer);
  }, [fullscreen]);

  // Keep state in sync when the user leaves native fullscreen via the browser itself.
  useEffect(() => {
    const onChange = () => { if (!document.fullscreenElement) setFullscreen(current => current === 'native' ? 'off' : current); };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // While fullscreen, swallow Escape before any enclosing dialog sees it, so only the map closes.
  useEffect(() => {
    if (fullscreen === 'off') return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key !== 'Escape') return;
      ev.stopPropagation();
      if (fullscreen === 'fallback') setFullscreen('off');
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [fullscreen]);

  const toggleFullscreen = useCallback(async () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (fullscreen === 'native') {
      await document.exitFullscreen?.().catch(() => undefined);
      setFullscreen('off');
      return;
    }
    if (fullscreen === 'fallback') {
      setFullscreen('off');
      return;
    }
    if (wrapper.requestFullscreen) {
      try {
        await wrapper.requestFullscreen();
        setFullscreen('native');
        return;
      } catch {
        // fall through to the CSS fallback
      }
    }
    setFullscreen('fallback');
  }, [fullscreen]);

  if (error) {
    return <div className='flex h-full items-center justify-center p-4 text-center text-[13px] font-semibold text-sage'>{error}</div>;
  }

  const active = fullscreen !== 'off';
  const wrapperClass = fullscreen === 'fallback'
    ? 'fixed inset-0 z-[2000] bg-white'
    : 'relative h-full w-full bg-white';

  return (
    <div ref={wrapperRef} className={wrapperClass}>
      {!points && <div className='absolute inset-0 flex items-center justify-center font-mono text-[12px] tracking-[.08em] text-sage'>LOADING ROUTE…</div>}
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      {allowFullscreen && points && (
        <button
          type='button'
          onClick={toggleFullscreen}
          aria-label={active ? 'Exit full screen' : 'Full screen'}
          title={active ? 'Exit full screen' : 'Full screen'}
          className='absolute right-3 top-3 z-[1001] flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-ink shadow-[0_2px_10px_rgba(0,0,0,.25)] transition-colors hover:bg-moss'
        >
          {active ? <FullscreenExit fontSize='small' /> : <Fullscreen fontSize='small' />}
        </button>
      )}
    </div>
  );
};

export default GPXMap;
