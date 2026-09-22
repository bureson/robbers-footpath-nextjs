'use client';

import { Fragment, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import ConfirmDialog from '../../../components/confirmDialog';
import { useAdmin } from '../../adminContext';
import { Trail, Year, blazeAt, formatDistance, formatNumber, formatWeekday, sortTrails, sumParticipants } from '../../format';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import DirectionsBike from '@mui/icons-material/DirectionsBike';
import EditOutlined from '@mui/icons-material/EditOutlined';
import Hiking from '@mui/icons-material/Hiking';

import { BlazeMark, Eyebrow, IconPill, Pill } from '../../ui';
import YearDialog, { YearDialogHandle } from '../../yearDialog';
import TrailDialog, { TrailDialogHandle } from './trailDialog';


export default function YearPage () {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { yearList, trailsForYear, loading, mergeYear, mergeTrail, deleteYear } = useAdmin();
  const yearDialogRef = useRef<YearDialogHandle>(null);
  const trailDialogRef = useRef<TrailDialogHandle>(null);

  const year = yearList.find(candidate => String(candidate.year) === String(slug));

  if (!year) {
    return (
      <div className='text-[14px] font-semibold text-sage'>
        {loading ? 'Loading…' : <Fragment>Nothing found for {slug}. <Link href='/admin' className='text-ink'>Back to all years</Link></Fragment>}
      </div>
    );
  }

  const allTrails = sortTrails(trailsForYear(year.id));
  const hiking = allTrails.filter(trail => trail.type === 'hiking');
  const cycling = allTrails.filter(trail => trail.type === 'cycling');
  const people = sumParticipants(allTrails);
  const slugText = String(year.year);

  const onEditYear = () => yearDialogRef.current?.openEdit(year);
  const onDeleteYear = async () => {
    await deleteYear(year.id);
    router.push('/admin');
  };
  const onAddTrail = () => trailDialogRef.current?.open();
  const onSaveYear = (saved: Year) => mergeYear(saved);
  const onSaveTrail = (saved: Trail) => mergeTrail(saved);
  const blazeFor = (trail: Trail | null) => blazeAt(trail ? Math.max(0, allTrails.findIndex(candidate => candidate.id === trail.id)) : allTrails.length);

  return (
    <div>
      <div className='flex flex-col gap-5 md:flex-row md:items-end md:justify-between'>
        <div>
          <Eyebrow>{slugText}</Eyebrow>
          <h1 className='m-0 mt-[6px] text-[40px] leading-[.95] font-extrabold tracking-[-.04em] md:text-[56px]'>{formatWeekday(year.eventDate) || 'Date to be set'}</h1>
        </div>
        <div className='flex flex-wrap gap-2'>
          <IconPill label='Edit year' onClick={onEditYear}><EditOutlined fontSize='small' /></IconPill>
          <ConfirmDialog
            onConfirm={onDeleteYear}
            title={`Delete ${slugText}?`}
            message={`This removes the year ${slugText}${allTrails.length > 0 ? ` and its ${allTrails.length} ${allTrails.length === 1 ? 'trail' : 'trails'}` : ''}. This cannot be undone.`}
            renderTrigger={open => <IconPill label='Delete year' variant='danger' onClick={open}><DeleteOutlined fontSize='small' /></IconPill>}
          />
          <Pill variant='primary' onClick={onAddTrail}>+ Add trail</Pill>
        </div>
      </div>

      <div className='mt-6 flex flex-wrap items-center justify-between gap-2'>
        <span className='text-[13px] font-bold text-sage'>{allTrails.length === 0 ? 'No trails yet. Add the first one, GPX first and it fills distance and climb.' : `${allTrails.length} ${allTrails.length === 1 ? 'trail' : 'trails'}`}</span>
        <span className='text-[13px] font-bold text-sage'>{people > 0 ? `${formatNumber(people)} people total` : 'No participants yet'}</span>
      </div>

      <div className='mt-4 grid grid-cols-1 gap-6 xl:grid-cols-2'>
        {([['hiking', 'Hiking', hiking], ['cycling', 'Cycling', cycling]] as Array<[string, string, Trail[]]>).map(([key, label, list]) => (
          <section key={key}>
            <div className='mb-3 flex items-center gap-[10px] px-1'>
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moss text-ink' aria-hidden='true'>
                {key === 'cycling' ? <DirectionsBike fontSize='small' /> : <Hiking fontSize='small' />}
              </span>
              <h2 className='m-0 text-[18px] font-extrabold tracking-[-.02em]'>{label}</h2>
              <span className='rounded-full bg-moss px-[10px] py-[3px] text-[12px] font-bold text-sage'>{list.length}</span>
            </div>
            <div className='flex flex-col gap-[10px]'>
              {list.length === 0 && (
                <div className='rounded-[20px] bg-sand px-[18px] py-6 text-[14px] font-semibold text-sage'>No {key} trails this year.</div>
              )}
              {list.map(trail => {
                const blaze = blazeFor(trail);
                return (
                  <Link key={trail.id} href={`/admin/year/${slugText}/trail/${trail.id}`} className='grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-x-5 rounded-[20px] bg-sand py-3 pl-3 pr-[18px] text-ink no-underline transition-colors hover:bg-moss'>
                    <div className='flex min-w-0 items-center gap-3'>
                      <BlazeMark color={blaze.hex} width={38} height={54} radius={8} border='1.5px solid #14261b' />
                      <span className='whitespace-nowrap text-[30px] leading-none font-extrabold tracking-[-.04em]'>{trail.title}</span>
                    </div>
                    <div className='text-right'>
                      <div className='text-[20px] leading-none font-extrabold tracking-[-.02em]'>{formatDistance(trail.distance)}</div>
                      <div className='mt-1 text-[11px] font-semibold text-sage'>km</div>
                    </div>
                    <div className='text-right'>
                      <div className='text-[20px] leading-none font-extrabold tracking-[-.02em]'>{formatNumber(trail.elevation)}</div>
                      <div className='mt-1 text-[11px] font-semibold text-sage'>m ↑</div>
                    </div>
                    <div className='min-w-[64px] rounded-[14px] bg-sun px-3 py-2 text-right'>
                      <div className='text-[22px] leading-none font-extrabold'>{trail.participant_count == null ? <span className='opacity-50'>–</span> : formatNumber(trail.participant_count)}</div>
                      <div className='mt-1 text-[11px] font-bold opacity-70'>people</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <YearDialog ref={yearDialogRef} onSaved={onSaveYear} existingYears={yearList} />
      <TrailDialog ref={trailDialogRef} yearId={year.id} yearLabel={slugText} onSaved={onSaveTrail} blazeFor={blazeFor} />
    </div>
  );
}
