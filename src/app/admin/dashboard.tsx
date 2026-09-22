'use client';

import { Fragment, useRef } from 'react';
import Link from 'next/link';
import { Tooltip } from '@mui/material';

import { useAdmin } from './adminContext';
import { Year, formatLong, formatNumber, formatWeekdayShort, parseDate, stampAt, sumParticipants, toIsoDate } from './format';
import { Label, Pill, StatCard } from './ui';
import YearDialog, { YearDialogHandle } from './yearDialog';

const pluralize = (count: number, singular: string, plural: string) => `${count} ${count === 1 ? singular : plural}`;

export default function Dashboard () {
  const { yearList, trailsForYear, loading, mergeYear } = useAdmin();
  const yearDialogRef = useRef<YearDialogHandle>(null);

  const rows = yearList.map(year => {
    const trails = trailsForYear(year.id);
    return { year, trails: trails.length, participants: sumParticipants(trails) };
  });
  const maxParticipants = Math.max(1, ...rows.map(row => row.participants));
  const allTime = rows.reduce((sum, row) => sum + row.participants, 0);
  const best = rows.reduce<typeof rows[number] | null>((top, row) => row.participants > (top?.participants ?? 0) ? row : top, null);
  const today = toIsoDate(new Date());
  const upcoming = [...rows].reverse().find(row => (row.year.eventDate ?? '') >= today) ?? rows[0] ?? null;
  const upcomingDate = upcoming ? parseDate(upcoming.year.eventDate) : null;
  const upcomingPast = upcomingDate ? (upcoming?.year.eventDate ?? '') < today : false;

  const onAddYear = () => yearDialogRef.current?.open();
  const onSaveYear = (savedYear: Year) => mergeYear(savedYear);

  return (
    <div>
      <div className='flex flex-col gap-5 md:flex-row md:items-end md:justify-between'>
        <h1 className='m-0 max-w-[860px] text-[36px] leading-[.95] font-extrabold tracking-[-.04em] text-balance md:text-[48px]'>
          Every May since 1972, one Saturday on foot and on bikes.
        </h1>
        <Pill variant='primary' onClick={onAddYear}>+ Add year</Pill>
      </div>

      <div className='mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]'>
        <StatCard
          tone='sun'
          label={upcomingPast ? 'Latest' : 'Next up'}
          value={upcoming ? formatWeekdayShort(upcoming.year.eventDate) || String(upcoming.year.year) : '–'}
          sub={upcoming ? `${pluralize(upcoming.trails, 'trail', 'trails')}${upcoming.participants > 0 ? ` · ${formatNumber(upcoming.participants)} ${upcomingPast ? 'took part' : 'signed up'}` : ''}` : 'Add the first year to get going'}
        />
        <StatCard label='All-time participants' value={formatNumber(allTime)} />
        <StatCard
          label='Best year'
          value={best && best.participants > 0 ? <Fragment>{String(best.year.year)} <span className='text-[16px] font-semibold text-sage'>{formatNumber(best.participants)}</span></Fragment> : '–'}
        />
      </div>

      <div className='hidden gap-[14px] px-[18px] pb-2 pt-[26px] md:grid md:grid-cols-[110px_150px_70px_110px_1fr]'>
        <Label>Year</Label><Label>Date</Label><Label>Trails</Label><Label>Participants</Label>
        <Label className='flex items-center gap-[6px]'>
          Benchmark
          <Tooltip
            arrow
            placement='top'
            title={`Each bar shows that year's participants as a share of the best year so far${best && best.participants > 0 ? ` (${String(best.year.year)}, ${formatNumber(best.participants)} people)` : ''}. A full bar is the record, a half bar is half the record.`}
            slotProps={{ tooltip: { sx: { bgcolor: '#14261b', color: '#fff', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, lineHeight: 1.45, maxWidth: 280, px: 1.5, py: 1, borderRadius: '10px' } }, arrow: { sx: { color: '#14261b' } } }}
          >
            <span aria-label='What is the benchmark?' className='flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-mist text-[10px] font-bold normal-case tracking-normal text-sage'>?</span>
          </Tooltip>
        </Label>
      </div>

      <div className='mt-6 flex flex-col gap-2 md:mt-0'>
        {loading && rows.length === 0 && <div className='rounded-[18px] bg-sand px-[18px] py-6 text-[14px] font-semibold text-sage'>Loading years…</div>}
        {!loading && rows.length === 0 && <div className='rounded-[18px] bg-sand px-[18px] py-6 text-[14px] font-semibold text-sage'>No years yet. Add the first one.</div>}
        {rows.map((row, index) => {
          const slug = String(row.year.year);
          const pct = Math.round(row.participants / maxParticipants * 100);
          return (
            <Link key={row.year.id} href={`/admin/year/${slug}`} className='grid grid-cols-[auto_1fr] items-center gap-x-[14px] gap-y-2 rounded-[18px] bg-sand px-[18px] py-[14px] text-ink no-underline transition-colors hover:bg-moss md:grid-cols-[110px_150px_70px_110px_1fr]'>
              <span className='text-[30px] leading-none font-extrabold tracking-[-.04em]'>{slug}</span>
              <span className='text-[14px] font-semibold'>{formatLong(row.year.eventDate) || '–'}<span className='text-sage md:hidden'> · {pluralize(row.trails, 'trail', 'trails')}</span></span>
              <span className='hidden text-[14px] font-semibold md:block'>{row.trails}</span>
              <span className='hidden text-[20px] font-extrabold md:block'>{row.participants > 0 ? formatNumber(row.participants) : <span className='text-[13px] font-semibold text-sage'>–</span>}</span>
              <div className='hidden h-5 overflow-hidden rounded-full bg-mist md:block' title={row.participants > 0 ? `${pct}% of the best year` : 'No participants recorded'}>
                <div className='h-full rounded-full' style={{ width: `${pct}%`, background: stampAt(index) }} />
              </div>
            </Link>
          );
        })}
      </div>

      <YearDialog ref={yearDialogRef} onSaved={onSaveYear} existingYears={yearList} />
    </div>
  );
}
