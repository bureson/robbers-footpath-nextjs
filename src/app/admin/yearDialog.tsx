'use client'

import { Fragment, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import Save from '@mui/icons-material/Save';

import supabase from '../lib/supabaseClient';

export default function YearDialog () {
  const today = new Date();
  const todayYear = today.getFullYear();
  const month = today.getMonth() < 9 ? `0${today.getMonth() + 1}` : today.getMonth() + 1;
  const day = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate();

  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(todayYear);
  const [eventDate, setEventDate] = useState(`${todayYear}-${month}-${day}`);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const onOpen = () => setOpen(true);
  const onClose = () => {
    setOpen(false);
    setYear(todayYear);
    setLoading(false);
    setError('');
  };
  const onChangeYear = (ev: any) => setYear(ev.target.value);
  const onChangeEventDate = (ev: any) => setEventDate(ev.target.value);
  const onSave = async () => {
    try {
      const { data: insertedData, error: insertError } = await supabase.from('year').upsert([{ year, eventDate }]).select();
      if (insertError) setError(insertError.message);
      else onClose();
    } catch (err: any) {
      setError('Failed to add data: ' + err.message);
      setLoading(false);
    }
  };
  return (
    <Fragment>
      <Button variant='outlined' size='small' onClick={onOpen}>Add year</Button>
      <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth={true}>
        <DialogTitle>Add year</DialogTitle>
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
}