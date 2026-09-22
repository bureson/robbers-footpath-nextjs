'use client';

import dynamic from 'next/dynamic';
import { Dialog } from '@mui/material';

import { Blaze, Trail, formatDistance } from '../admin/format';
import { BlazeMark } from '../admin/ui';
import { elevationRange, hasElevation } from '../lib/gpx';
import { formatCsNumber, participantsLabel } from '../lib/cs';
import { ElevationProfile, useGpx } from './gpxCharts';

const GpxMap = dynamic(() => import('./gpxMap'), { ssr: false });

type TrailOverlayProps = {
  trail: Trail | null;
  blaze: Blaze;
  year: string;
  showParticipants: boolean;
  onClose: () => void;
};

export default function TrailOverlay (props: TrailOverlayProps) {
  const { trail, blaze, year, showParticipants, onClose } = props;
  const { points, error: gpxError } = useGpx(trail?.gpxFileUrl);
  const range = points ? elevationRange(points) : null;
  const hasProfile = Boolean(points && hasElevation(points));
  const participants = trail?.participant_count;

  return (
    <Dialog
      open={Boolean(trail)}
      onClose={onClose}
      className='font-brico'
      slotProps={{
        paper: {
          sx: {
            width: 'min(1040px, 100%)', maxWidth: '100%', margin: '24px', borderRadius: '28px', padding: 'clamp(18px, 3vw, 32px)',
            boxShadow: '0 30px 80px -20px rgba(0,0,0,.5)', color: '#14261b', fontFamily: 'inherit',
          },
        },
        backdrop: { sx: { backgroundColor: 'rgba(20,38,27,.6)', backdropFilter: 'blur(3px)' } },
      }}
    >
      {trail && (
        <div>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <BlazeMark color={blaze.hex} width={44} height={64} radius={10} border='2px solid #14261b' />
              <div>
                <div className='text-[13px] font-bold text-sage'>{year} · {trail.type === 'cycling' ? 'Cyklo trasa' : 'Pěší trasa'}</div>
                <h2 className='m-0 mt-1 whitespace-nowrap text-[44px] leading-[.9] font-extrabold tracking-[-.05em] sm:text-[56px]'>{trail.title}</h2>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              {trail.gpxFileUrl && (
                <a href={`${trail.gpxFileUrl}?download=1`} className='whitespace-nowrap rounded-full bg-ink px-5 py-3 text-[14px] font-bold text-white no-underline transition-colors hover:bg-[#1f3a29]'>↓ Stáhnout GPX</a>
              )}
              <button type='button' onClick={onClose} aria-label='Zavřít' className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-moss text-[20px] text-ink transition-colors hover:bg-mist'>×</button>
            </div>
          </div>

          <div className='mt-6 grid grid-cols-1 gap-5 md:grid-cols-2'>
            <div className='flex flex-col gap-[14px]'>
              <p className='m-0 text-[15px] leading-[1.45] font-medium text-bark text-pretty whitespace-pre-line'>{trail.description}</p>
              <div className='grid grid-cols-3 gap-[10px]'>
                <div className='rounded-[16px] bg-moss px-4 py-[14px]'><div className='text-[12px] font-bold text-sage'>Délka</div><div className='mt-[6px] text-[26px] leading-none font-extrabold tracking-[-.03em] whitespace-nowrap'>{formatDistance(trail.distance)} km</div></div>
                <div className='rounded-[16px] bg-moss px-4 py-[14px]'><div className='text-[12px] font-bold text-sage'>Převýšení</div><div className='mt-[6px] text-[26px] leading-none font-extrabold tracking-[-.03em] whitespace-nowrap'>{formatCsNumber(trail.elevation ?? 0)} m</div></div>
                {showParticipants && participants != null
                  ? <div className='rounded-[16px] bg-sun px-4 py-[14px]'><div className='text-[12px] font-bold opacity-70'>Účast</div><div className='mt-[6px] text-[26px] leading-none font-extrabold tracking-[-.03em] whitespace-nowrap'>{formatCsNumber(participants)}</div></div>
                  : <div className='rounded-[16px] bg-sun px-4 py-[14px]'><div className='text-[12px] font-bold opacity-70'>Start</div><div className='mt-[6px] text-[26px] leading-none font-extrabold tracking-[-.03em] whitespace-nowrap'>7 – 9 h</div></div>}
              </div>
              {showParticipants && participants != null && <div className='text-[13px] font-semibold text-sage'>Trasu absolvovalo {participantsLabel(participants)}.</div>}
              <div className='rounded-[16px] bg-sand px-5 py-4'>
                <div className='flex justify-between text-[13px] font-bold text-sage'>
                  <span>Profil trasy</span>
                  <span>{range ? `${Math.round(range.min)} → ${Math.round(range.max)} m` : gpxError ? 'GPX není k dispozici' : trail.gpxFileUrl ? (points ? 'bez výškových dat' : 'načítám…') : 'bez GPX'}</span>
                </div>
                <div className='mt-2 h-[140px]'>
                  {hasProfile && points
                    ? <ElevationProfile points={points} stroke={blaze.hex} fill={blaze.soft} />
                    : <div className='h-full rounded-[10px] bg-mist/60' />}
                </div>
              </div>
            </div>
            <div className='min-h-[380px] overflow-hidden rounded-[20px]' style={{ background: 'repeating-linear-gradient(135deg, #dce6d6 0 5px, #e8efe3 5px 10px)' }}>
              {trail.gpxFileUrl
                ? <GpxMap gpxUrl={trail.gpxFileUrl} />
                : <div className='flex h-full items-center justify-center font-mono text-[12px] tracking-[.08em] text-sage'>MAPA NENÍ K DISPOZICI</div>}
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
