'use client';

import { Fragment, forwardRef, useImperativeHandle, useRef, useState } from 'react';

import { ElevationChart, RoutePreview, useGpx } from '../../../components/gpxCharts';
import { GpxPoint, climbM, distanceKm, hasElevation, parseGpx } from '../../../lib/gpx';
import supabase from '../../../lib/supabaseClient';
import { Blaze, BLAZES, Trail, cx, formatNumber } from '../../format';
import { AdminDialog, ErrorNote, Field, Pill } from '../../ui';

export type TrailDialogHandle = {
  open: () => void;
  openEdit: (trail: Trail) => void;
};

type TrailDialogProps = {
  yearId: number;
  yearLabel: string;
  onSaved?: (trail: Trail) => void;
  blazeFor?: (trail: Trail | null) => Blaze;
};

type GpxFile = { file: File; points: GpxPoint[] };

const formatSize = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} kB`;

const TrailDialog = forwardRef<TrailDialogHandle, TrailDialogProps>(function TrailDialog (props, ref) {
  const { yearId, yearLabel, onSaved, blazeFor } = props;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingTrail, setEditingTrail] = useState<Trail | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('hiking');
  const [distance, setDistance] = useState('');
  const [elevation, setElevation] = useState('');
  const [participantCount, setParticipantCount] = useState('');
  const [gpxFile, setGpxFile] = useState<GpxFile | null>(null);
  const [gpxNote, setGpxNote] = useState('');
  const [fromGpx, setFromGpx] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(editingTrail?.id);

  // Preview of the already uploaded track while editing, until a new file replaces it.
  const existing = useGpx(open && !gpxFile ? editingTrail?.gpxFileUrl : null);
  const previewPoints = gpxFile?.points ?? existing.points;
  const blaze = blazeFor ? blazeFor(editingTrail) : BLAZES[0];

  const resetForm = () => {
    setEditingTrail(null);
    setGpxFile(null);
    setGpxNote('');
    setFromGpx(false);
    setTitle('');
    setType('hiking');
    setDescription('');
    setDistance('');
    setElevation('');
    setParticipantCount('');
    setLoading(false);
    setError('');
  };
  const onOpen = () => {
    resetForm();
    setOpen(true);
  };
  const onOpenEdit = (selectedTrail: Trail) => {
    resetForm();
    setEditingTrail(selectedTrail);
    setTitle(selectedTrail.title || '');
    setType(selectedTrail.type || 'hiking');
    setDescription(selectedTrail.description || '');
    setDistance(selectedTrail.distance == null ? '' : String(selectedTrail.distance));
    setElevation(selectedTrail.elevation == null ? '' : String(selectedTrail.elevation));
    setParticipantCount(selectedTrail.participant_count == null ? '' : String(selectedTrail.participant_count));
    setOpen(true);
  };
  useImperativeHandle(ref, () => ({ open: onOpen, openEdit: onOpenEdit }));
  const onClose = () => {
    setOpen(false);
    setLoading(false);
  };

  const onChangeTitle = (ev: React.ChangeEvent<HTMLInputElement>) => setTitle(ev.target.value);
  const onChangeDescription = (ev: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(ev.target.value);
  const onChangeDistance = (ev: React.ChangeEvent<HTMLInputElement>) => { setDistance(ev.target.value); setFromGpx(false); };
  const onChangeElevation = (ev: React.ChangeEvent<HTMLInputElement>) => { setElevation(ev.target.value); setFromGpx(false); };
  const onChangeParticipantCount = (ev: React.ChangeEvent<HTMLInputElement>) => setParticipantCount(ev.target.value);
  const onPickHiking = () => setType('hiking');
  const onPickCycling = () => setType('cycling');

  const acceptFile = async (file: File) => {
    setError('');
    try {
      const points = parseGpx(await file.text());
      if (points.length === 0) {
        setGpxFile(null);
        setGpxNote('');
        setError('No route points found in that GPX file.');
        return;
      }
      setGpxFile({ file, points });
      setDistance((Math.round(distanceKm(points) * 10) / 10).toString());
      if (hasElevation(points)) {
        setElevation(String(Math.round(climbM(points))));
        setGpxNote('');
      } else {
        setGpxNote('No elevation data in this file, fill in the climb by hand.');
      }
      setFromGpx(true);
      if (!title.trim()) setTitle(`${Math.round(distanceKm(points))} km`);
    } catch (err: unknown) {
      setError('Could not read the GPX file: ' + (err instanceof Error ? err.message : String(err)));
    }
  };
  const onFileChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (file) acceptFile(file);
    ev.target.value = '';
  };
  const onDrop = (ev: React.DragEvent) => {
    ev.preventDefault();
    setDragging(false);
    const file = ev.dataTransfer.files?.[0];
    if (file) acceptFile(file);
  };
  const onDragOver = (ev: React.DragEvent) => { ev.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onBrowse = () => fileInputRef.current?.click();

  const uploadGpx = async () => {
    if (!gpxFile) return null;
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`/api/uploadGpx?filename=${encodeURIComponent(gpxFile.file.name)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
      body: gpxFile.file,
    });
    if (!response.ok) throw new Error('GPX upload failed');
    const { url } = await response.json();
    return url as string;
  };

  const onSave = async () => {
    if (!title.trim()) {
      setError('Please give the trail a title.');
      return;
    }
    try {
      setLoading(true);
      const gpxFileUrl = await uploadGpx();
      const payload = {
        ...(editingTrail?.id ? { id: editingTrail.id } : {}),
        yearId,
        title: title.trim(),
        description,
        type,
        distance: distance === '' ? 0 : parseFloat(distance),
        elevation: elevation === '' ? 0 : parseFloat(elevation),
        participant_count: participantCount === '' ? null : parseInt(participantCount, 10),
        gpxFileUrl: gpxFileUrl || editingTrail?.gpxFileUrl || null,
      };
      const { data, error: saveError } = await supabase.from('trail').upsert([payload]).select().single();
      if (saveError) {
        setError(saveError.message);
        setLoading(false);
      } else {
        onSaved?.(data as Trail);
        onClose();
      }
    } catch (err: unknown) {
      setError('Failed to save: ' + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  };

  const existingName = editingTrail?.gpxFileUrl ? decodeURIComponent(editingTrail.gpxFileUrl.split('/').pop() || '') : '';
  const shortTitle = title.trim() || 'trail';
  const segment = 'flex-1 cursor-pointer rounded-full py-2 text-center text-[13px] font-semibold transition-colors';

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      eyebrow={isEditing ? `Edit trail · ${yearLabel}` : `New trail · ${yearLabel}`}
      title={isEditing ? `Edit ${editingTrail?.title}` : 'Add a trail'}
      width={760}
      footerNote='Distance and climb can be edited after upload.'
      footer={
        <Fragment>
          <Pill variant='soft' onClick={onClose} disabled={loading}>Cancel</Pill>
          <Pill variant='primary' onClick={onSave} disabled={loading}>
            {loading ? 'Saving…' : isEditing ? `Save ${shortTitle}` : `Add ${shortTitle} trail`}
          </Pill>
        </Fragment>
      }
    >
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div className='flex flex-col gap-[18px]'>
          <Field label='Type' as='div'>
            <div className='flex rounded-full bg-sand p-[3px]'>
              <button type='button' onClick={onPickHiking} className={cx(segment, type === 'hiking' ? 'bg-ink text-white' : 'text-sage hover:text-ink')}>Hiking</button>
              <button type='button' onClick={onPickCycling} className={cx(segment, type === 'cycling' ? 'bg-ink text-white' : 'text-sage hover:text-ink')}>Cycling</button>
            </div>
          </Field>
          <Field label='Title'>
            <input className='admin-input strong' value={title} onChange={onChangeTitle} placeholder='12 km' autoFocus={!isEditing} />
          </Field>
          <Field label='Route' hint='places separated by dashes'>
            <textarea className='admin-input multiline' value={description} onChange={onChangeDescription} placeholder='Mníšek FK – ul. Dětská – Ekocentrum – … – Mníšek FK' />
          </Field>
          <Field label='Participants' hint='fill in after the event'>
            <input className='admin-input strong w-[140px]' value={participantCount} onChange={onChangeParticipantCount} inputMode='numeric' placeholder='0' style={{ width: 140 }} />
          </Field>
        </div>

        <div className='flex flex-col gap-3'>
          <span className='text-[13px] font-semibold text-ink'>GPX track</span>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={cx('flex flex-col gap-3 rounded-[14px] border-[1.5px] border-dashed bg-white p-[14px] transition-colors', dragging ? 'border-ink bg-moss' : 'border-ash')}
          >
            <input ref={fileInputRef} type='file' accept='.gpx,application/gpx+xml' className='hidden' onChange={onFileChange} />
            {gpxFile || existingName ? (
              <div className='flex items-center gap-3'>
                <div className='flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-sun text-[11px] font-bold'>GPX</div>
                <div className='min-w-0'>
                  <div className='truncate text-[14px] font-bold'>{gpxFile ? gpxFile.file.name : existingName}</div>
                  <div className='text-[12px] font-semibold text-sage'>
                    {gpxFile ? `${formatSize(gpxFile.file.size)} · ${formatNumber(gpxFile.points.length)} points · ` : existing.points ? `${formatNumber(existing.points.length)} points · ` : 'uploaded · '}
                    <button type='button' onClick={onBrowse} className='cursor-pointer font-semibold text-ink underline'>replace</button>
                  </div>
                </div>
              </div>
            ) : (
              <button type='button' onClick={onBrowse} className='flex cursor-pointer items-center gap-3 text-left'>
                <div className='flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-moss text-[11px] font-bold'>GPX</div>
                <div className='min-w-0'>
                  <div className='text-[14px] font-bold'>Drop a GPX file here</div>
                  <div className='text-[12px] font-semibold text-sage'>or click to browse · it fills distance and climb</div>
                </div>
              </button>
            )}
            <div className='flex h-[150px] items-center justify-center rounded-[10px]' style={{ background: 'repeating-linear-gradient(135deg, #dce6d6 0 5px, #e8efe3 5px 10px)' }}>
              {previewPoints
                ? <RoutePreview points={previewPoints} stroke={blaze.hex} height={150} />
                : <span className='font-mono text-[11px] tracking-[.08em] text-sage'>{existing.error ? existing.error.toUpperCase() : 'ROUTE PREVIEW'}</span>}
            </div>
            {previewPoints && hasElevation(previewPoints) && (
              <ElevationChart points={previewPoints} stroke={blaze.hex} fill={blaze.soft} height={50} strokeWidth={2} />
            )}
          </div>
          {gpxNote && <div className='text-[12px] font-semibold text-sage'>{gpxNote}</div>}
          <div className='grid grid-cols-2 gap-3'>
            <Field label='Distance' hint={fromGpx ? 'from GPX' : undefined}>
              <div className='relative'>
                <input className='admin-input strong pr-12' value={distance} onChange={onChangeDistance} inputMode='decimal' placeholder='0' />
                <span className='pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[14px] font-semibold text-sage'>km</span>
              </div>
            </Field>
            <Field label='Climb' hint={fromGpx ? 'from GPX' : undefined}>
              <div className='relative'>
                <input className='admin-input strong pr-10' value={elevation} onChange={onChangeElevation} inputMode='numeric' placeholder='0' />
                <span className='pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[14px] font-semibold text-sage'>m</span>
              </div>
            </Field>
          </div>
        </div>
      </div>
      <ErrorNote>{error}</ErrorNote>
    </AdminDialog>
  );
});

export default TrailDialog;
