'use client';

import { Fragment, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ArrowBack from '@mui/icons-material/ArrowBack';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';

import ConfirmDialog from '../../../../../components/confirmDialog';
import { ElevationProfile, useGpx } from '../../../../../components/gpxCharts';
import { elevationRange, hasElevation } from '../../../../../lib/gpx';
import { useAdmin } from '../../../../adminContext';
import { Trail, blazeAt, formatDistance, formatNumber, sortTrails, typeLabel } from '../../../../format';
import { BlazeMark, Eyebrow, IconPill, Pill, StatCard } from '../../../../ui';
import TrailDialog, { TrailDialogHandle } from '../../trailDialog';

const GpxMap = dynamic(() => import('../../../../../components/gpxMap'), { ssr: false });

export default function TrailPage () {
  const { slug, trailId } = useParams<{ slug: string; trailId: string }>();
  const router = useRouter();
  const { yearList, trailsForYear, loading, mergeTrail, deleteTrail } = useAdmin();
  const trailDialogRef = useRef<TrailDialogHandle>(null);

  const year = yearList.find(candidate => String(candidate.year) === String(slug));
  const allTrails = year ? sortTrails(trailsForYear(year.id)) : [];
  const index = allTrails.findIndex(candidate => candidate.id === Number(trailId));
  const trail = index >= 0 ? allTrails[index] : null;
  const { points, error: gpxError } = useGpx(trail?.gpxFileUrl);

  if (!year || !trail) {
    return (
      <div className='text-[14px] font-semibold text-sage'>
        {loading ? 'Loading…' : <Fragment>Nothing found for that trail. <Link href={year ? `/admin/year/${slug}` : '/admin'} className='text-ink'>Back to {year ? String(year.year) : 'all years'}</Link></Fragment>}
      </div>
    );
  }

  const blaze = blazeAt(index);
  const slugText = String(year.year);
  const range = points ? elevationRange(points) : null;
  const hasProfile = Boolean(points && hasElevation(points));
  const onEdit = () => trailDialogRef.current?.openEdit(trail);
  const onSaveTrail = (saved: Trail) => mergeTrail(saved);
  const onDelete = async () => {
    await deleteTrail(trail.id);
    router.push(`/admin/year/${slugText}`);
  };
  const blazeFor = (candidate: Trail | null) => blazeAt(candidate ? Math.max(0, allTrails.findIndex(item => item.id === candidate.id)) : allTrails.length);

  return (
    <div className='flex flex-col gap-5 lg:grid lg:h-[calc(100vh-84px)] lg:grid-rows-[auto_minmax(0,1fr)]'>
      <div className='flex flex-col gap-5 md:flex-row md:items-start md:justify-between'>
        <div className='flex items-center gap-4'>
          <Link
            href={`/admin/year/${slugText}`}
            title={`Back to ${slugText}`}
            aria-label={`Back to ${slugText}`}
            className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moss text-ink no-underline transition-colors hover:bg-ink hover:text-white'
          >
            <ArrowBack fontSize='small' />
          </Link>
          <BlazeMark color={blaze.hex} width={52} height={74} radius={10} border='2px solid #14261b' />
          <div>
            <Eyebrow>{slugText} · {typeLabel(trail.type)} · {blaze.key} blaze</Eyebrow>
            <h1 className='m-0 mt-1 whitespace-nowrap text-[48px] leading-[.9] font-extrabold tracking-[-.05em] md:text-[60px]'>{trail.title}</h1>
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          <IconPill label='Edit trail' onClick={onEdit}><EditOutlined fontSize='small' /></IconPill>
          <ConfirmDialog
            onConfirm={onDelete}
            title={`Delete ${trail.title}?`}
            message={`This removes the ${trail.title} ${trail.type} trail from ${slugText}. This cannot be undone.`}
            renderTrigger={open => <IconPill label='Delete trail' variant='danger' onClick={open}><DeleteOutlined fontSize='small' /></IconPill>}
          />
          {trail.gpxFileUrl && <Pill variant='primary' href={`${trail.gpxFileUrl}?download=1`}>↓ Download GPX</Pill>}
        </div>
      </div>

      <div className='grid grid-cols-1 gap-5 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]'>
        <div className='flex flex-col gap-[14px] lg:min-h-0'>
          <p className='m-0 text-[16px] leading-[1.7] font-medium text-bark text-pretty whitespace-pre-line'>
            {trail.description || <span className='text-ash'>No route description yet.</span>}
          </p>

          <div className='grid grid-cols-3 gap-[10px] lg:mt-auto'>
            <StatCard size='sm' label='Distance' value={`${formatDistance(trail.distance)} km`} />
            <StatCard size='sm' label='Climb' value={`${formatNumber(trail.elevation)} m`} />
            <StatCard size='sm' tone='sun' label='People' value={trail.participant_count == null ? '–' : formatNumber(trail.participant_count)} />
          </div>

          <div className='flex flex-1 flex-col rounded-[16px] bg-sand px-5 py-4 lg:min-h-0 lg:max-h-[50%]'>
            <div className='flex justify-between text-[13px] font-bold text-sage'>
              <span>Elevation profile</span>
              <span>{range ? `${Math.round(range.min)} → ${Math.round(range.max)} m` : gpxError ? 'GPX unavailable' : trail.gpxFileUrl ? (points ? 'no elevation data' : 'loading…') : 'no GPX file'}</span>
            </div>
            <div className='mt-2 min-h-[140px] flex-1 lg:min-h-0'>
              {hasProfile && points
                ? <ElevationProfile points={points} stroke={blaze.hex} fill={blaze.soft} />
                : <div className='h-full min-h-[140px] rounded-[10px] bg-mist/60' />}
            </div>
          </div>
        </div>

        <div className='h-[340px] overflow-hidden rounded-[20px] lg:h-auto lg:min-h-0' style={{ background: 'repeating-linear-gradient(135deg, #dce6d6 0 5px, #e8efe3 5px 10px)' }}>
          {trail.gpxFileUrl
            ? <GpxMap gpxUrl={trail.gpxFileUrl} />
            : <div className='flex h-full items-center justify-center font-mono text-[12px] tracking-[.08em] text-sage'>NO GPX FILE YET</div>}
        </div>
      </div>

      <TrailDialog ref={trailDialogRef} yearId={year.id} yearLabel={slugText} onSaved={onSaveTrail} blazeFor={blazeFor} />
    </div>
  );
}
