'use client'

import { Fragment, forwardRef, useImperativeHandle, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import Save from '@mui/icons-material/Save';

import supabase from '../lib/supabaseClient';

const YearDialog = forwardRef(function YearDialog (props: any, ref: any) {
  const { onSaved } = props;
  const today = new Date();
  const todayYear = today.getFullYear();
  const month = today.getMonth() < 9 ? `0${today.getMonth() + 1}` : today.getMonth() + 1;
  const day = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate();
  const todayDate = `${todayYear}-${month}-${day}`;

  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(todayYear);
  const [eventDate, setEventDate] = useState(todayDate);
  const [editingYear, setEditingYear] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(editingYear?.id);

  const resetForm = () => {
    setYear(todayYear);
    setEventDate(todayDate);
    setEditingYear(null);
    setLoading(false);
    setError('');
  };
  const onOpen = () => {
    resetForm();
    setOpen(true);
  };
  const onOpenEdit = (selectedYear: any) => {
    setEditingYear(selectedYear);
    setYear(selectedYear.year);
    setEventDate(selectedYear.eventDate);
    setError('');
    setLoading(false);
    setOpen(true);
  };
  useImperativeHandle(ref, () => ({ openEdit: onOpenEdit }));
  const onClose = () => {
    setOpen(false);
    resetForm();
  };
  const onChangeYear = (ev: any) => setYear(ev.target.value);
  const onChangeEventDate = (ev: any) => setEventDate(ev.target.value);
  const onSave = async () => {
    try {
      setLoading(true);
      const payload = editingYear?.id ? { id: editingYear.id, year, eventDate } : { year, eventDate };
      const { data, error: saveError } = await supabase.from('year').upsert([payload]).select().single();
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
      <Button variant='outlined' size='small' onClick={onOpen}>Add year</Button>
      <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth={true}>
        <DialogTitle>{isEditing ? 'Edit year' : 'Add year'}</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant='body1'>Year</Typography>
            <TextField value={year} onChange={onChangeYear} fullWidth={true} size='small' />
          </Box>
          <Box mb={2}>
            <Typography variant='body1'>Event date</Typography>
            <TextField value={eventDate} onChange={onChangeEventDate} fullWidth={true} size='small' type='date' />
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

export default YearDialog;
