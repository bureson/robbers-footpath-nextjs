'use client';

import { Fragment, forwardRef, useImperativeHandle, useState } from 'react';

import supabase from '../lib/supabaseClient';
import { Year, cx, formatShort, saturdaysInMay, toIsoDate } from './format';
import { AdminDialog, ErrorNote, Field, Pill } from './ui';

export type YearDialogHandle = {
  open: () => void;
  openEdit: (year: Year) => void;
};

type YearDialogProps = {
  onSaved?: (year: Year) => void;
  existingYears?: Year[];
};

const nextFreeYear = (existing: Year[] = []) => {
  const taken = new Set(existing.map(year => Number(year.year)));
  let candidate = new Date().getFullYear();
  while (taken.has(candidate)) candidate += 1;
  return candidate;
};

const defaultDate = (year: number) => saturdaysInMay(year)[2] ?? saturdaysInMay(year)[0] ?? toIsoDate(new Date());

const YearDialog = forwardRef<YearDialogHandle, YearDialogProps>(function YearDialog (props, ref) {
  const { onSaved, existingYears } = props;
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [editingYear, setEditingYear] = useState<Year | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(editingYear?.id);

  const onOpen = () => {
    const suggested = nextFreeYear(existingYears);
    setEditingYear(null);
    setYear(String(suggested));
    setEventDate(defaultDate(suggested));
    setError('');
    setLoading(false);
    setOpen(true);
  };
  const onOpenEdit = (selectedYear: Year) => {
    setEditingYear(selectedYear);
    setYear(String(selectedYear.year));
    setEventDate(selectedYear.eventDate ?? '');
    setError('');
    setLoading(false);
    setOpen(true);
  };
  useImperativeHandle(ref, () => ({ open: onOpen, openEdit: onOpenEdit }));

  const onClose = () => {
    setOpen(false);
    setLoading(false);
  };
  const onChangeYear = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value;
    setYear(value);
    // Keep the date inside the chosen year when it was one of the suggestions.
    const numeric = Number(value);
    if (value.length === 4 && numeric > 1970 && (!eventDate || saturdaysInMay(Number(eventDate.slice(0, 4))).includes(eventDate))) {
      setEventDate(defaultDate(numeric));
    }
  };
  const onChangeEventDate = (ev: React.ChangeEvent<HTMLInputElement>) => setEventDate(ev.target.value);

  const onSave = async () => {
    if (!year.trim()) {
      setError('Please fill in the year.');
      return;
    }
    if (!eventDate) {
      setError('Please choose the event date.');
      return;
    }
    try {
      setLoading(true);
      const payload = editingYear?.id ? { id: editingYear.id, year, eventDate } : { year, eventDate };
      const { data, error: saveError } = await supabase.from('year').upsert([payload]).select().single();
      if (saveError) {
        setError(saveError.message);
        setLoading(false);
      } else {
        onSaved?.(data as Year);
        onClose();
      }
    } catch (err: unknown) {
      setError('Failed to save: ' + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  };

  const saturdays = saturdaysInMay(Number(year));

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      eyebrow={isEditing ? `Edit year · ${editingYear?.year}` : 'New year'}
      title={isEditing ? 'When is the event?' : 'When is the next event?'}
      width={520}
      footer={
        <Fragment>
          <Pill variant='soft' onClick={onClose} disabled={loading}>Cancel</Pill>
          <Pill variant='primary' onClick={onSave} disabled={loading} className='px-5'>
            {loading ? 'Saving…' : isEditing ? `Save ${year || 'year'}` : `Create ${year || 'year'}`}
          </Pill>
        </Fragment>
      }
    >
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.6fr]'>
        <Field label='Year'>
          <input className='admin-input strong' value={year} onChange={onChangeYear} inputMode='numeric' maxLength={4} autoFocus={!isEditing} />
        </Field>
        <Field label='Event date'>
          <input className='admin-input' type='date' value={eventDate} onChange={onChangeEventDate} />
        </Field>
      </div>
      {saturdays.length > 0 && (
        <div className='mt-3 flex flex-wrap items-center gap-2 text-[12px] font-bold text-sage'>
          <span>Suggested Saturdays:</span>
          {saturdays.map(iso => {
            const onPick = () => setEventDate(iso);
            const selected = iso === eventDate;
            return (
              <button
                key={iso}
                type='button'
                onClick={onPick}
                className={cx('cursor-pointer rounded-full px-[10px] py-[5px] transition-colors', selected ? 'bg-sun text-ink' : 'bg-moss text-ink hover:bg-mist')}
              >
                {formatShort(iso)}
              </button>
            );
          })}
        </div>
      )}
      <ErrorNote>{error}</ErrorNote>
    </AdminDialog>
  );
});

export default YearDialog;
