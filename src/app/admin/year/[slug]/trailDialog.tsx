'use client'

import { Fragment, forwardRef, useImperativeHandle, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Select, TextField, Typography } from '@mui/material';
import Save from '@mui/icons-material/Save';

import supabase from '../../../lib/supabaseClient';

const TrailDialog = forwardRef(function TrailDialog (props: any, ref: any) {
  const { yearId, onSaved } = props;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingTrail, setEditingTrail] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('hiking');
  const [distance, setDistance] = useState('0');
  const [elevation, setElevation] = useState('0');
  const [participantCount, setParticipantCount] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const isEditing = Boolean(editingTrail?.id);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  const [error, setError] = useState('');

  const resetForm = () => {
    setEditingTrail(null);
    setSelectedFile(null);
    setTitle('');
    setType('hiking');
    setDescription('');
    setDistance('0');
    setElevation('0');
    setParticipantCount('');
    setLoading(false);
    setError('');
  };
  const onOpen = () => {
    resetForm();
    setOpen(true);
  };
  const onOpenEdit = (selectedTrail: any) => {
    setEditingTrail(selectedTrail);
    setTitle(selectedTrail.title || '');
    setType(selectedTrail.type || 'hiking');
    setDescription(selectedTrail.description || '');
    setDistance(String(selectedTrail.distance ?? '0'));
    setElevation(String(selectedTrail.elevation ?? '0'));
    setParticipantCount(selectedTrail.participant_count == null ? '' : String(selectedTrail.participant_count));
    setSelectedFile(null);
    setError('');
    setLoading(false);
    setOpen(true);
  };
  useImperativeHandle(ref, () => ({ openEdit: onOpenEdit }));
  const onClose = () => {
    setOpen(false);
    resetForm();
  };
  const onChangeTitle = (ev: any) => setTitle(ev.target.value);
  const onChangeDescription = (ev: any) => setDescription(ev.target.value);
  const onChangeDistance = (ev: any) => setDistance(ev.target.value);
  const onChangeElevation = (ev: any) => setElevation(ev.target.value);
  const onChangeParticipantCount = (ev: any) => setParticipantCount(ev.target.value);
  const onChangeType = (ev: any) => setType(ev.target.value);
  const onUploadGpx = async () => {
    if (selectedFile) {
      const response = await fetch(`/api/uploadGpx?filename=${selectedFile?.name}`, { method: 'POST', body: selectedFile });
      const { url } = await response.json();
      return url;
    } else {
      return null;
    }
  };
  const onSave = async () => {
    try {
      setLoading(true);
      const gpxFileUrl = await onUploadGpx();
      const payload = {
        ...(editingTrail?.id ? { id: editingTrail.id } : {}),
        yearId,
        title,
        description,
        type,
        distance: parseFloat(distance),
        elevation: parseFloat(elevation),
        participant_count: participantCount === '' ? null : parseInt(participantCount, 10),
        gpxFileUrl: gpxFileUrl || editingTrail?.gpxFileUrl || null
      };
      const { data, error: saveError } = await supabase.from('trail').upsert([payload]).select().single();
      if (saveError) {
        setError(saveError.message);
        setLoading(false);
      } else {
        onSaved?.(data);
        onClose();
      }
    } catch (err: any) {
      setError('Failed to add data: ' + err.message);
      setLoading(false);
    }
  };
  return (
    <Fragment>
      <Button variant='outlined' size='small' onClick={onOpen}>Add trail</Button>
      <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth={true}>
        <DialogTitle>{isEditing ? 'Edit trail' : 'Add trail'}</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant='body1'>Title</Typography>
            <TextField value={title} onChange={onChangeTitle} fullWidth={true} size='small' />
          </Box>
          <Box mb={2}>
            <Typography variant='body1'>Description</Typography>
            <TextField value={description} onChange={onChangeDescription} fullWidth={true} size='small' multiline minRows={3} />
          </Box>
          <Grid container spacing={2} mb={2}>
            <Grid size={3}>
              <Box mb={2}>
                <Typography variant='body1'>Type</Typography>
                <Select value={type} onChange={onChangeType} fullWidth={true} size='small'>
                  <MenuItem value='hiking'>Hiking</MenuItem>
                  <MenuItem value='cycling'>Cycling</MenuItem>
                </Select>
              </Box>
            </Grid>
            <Grid size={3}>
              <Box mb={2}>
                <Typography variant='body1'>Distance (km)</Typography>
                <TextField value={distance} onChange={onChangeDistance} fullWidth={true} size='small' type='number' />
              </Box>
            </Grid>
            <Grid size={3}>
              <Box mb={2}>
                <Typography variant='body1'>Elevation (m)</Typography>
                <TextField value={elevation} onChange={onChangeElevation} fullWidth={true} size='small' type='number' />
              </Box>
            </Grid>
            <Grid size={3}>
              <Box mb={2}>
                <Typography variant='body1'>Participants</Typography>
                <TextField value={participantCount} onChange={onChangeParticipantCount} fullWidth={true} size='small' type='number' />
              </Box>
            </Grid>
          </Grid>
          <Box>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id="upload-button"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="upload-button">
              <Button variant="outlined" color="primary" component="span" style={{ padding: '10px 20px', textTransform: 'none', width: '100%' }}>{selectedFile ? `Selected file: ${selectedFile.name}` : isEditing && editingTrail?.gpxFileUrl ? 'Replace GPX file' : 'Upload File'}</Button>
            </label>
          </Box>
          {error && <Alert severity='error'>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant='outlined' onClick={onSave} disabled={loading} startIcon={loading ? <CircularProgress size={24} /> : <Save />}>Save</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
});

export default TrailDialog;
