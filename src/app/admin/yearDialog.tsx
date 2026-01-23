'use client'

import { Fragment, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

import supabase from '../lib/supabaseClient';

export default function YearDialog () {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const onOpen = () => setOpen(true);
  const onClose = () => {
    setOpen(false);
    setYear('');
    setLoading(false);
    setError('');
  };
  const onChangeYear = (ev: any) => setYear(ev.target.value);
  const onSave = async () => {
    try {
      const { data: insertedData, error: insertError } = await supabase.from('year').insert([{ year }]);
      if (insertError) throw insertError;
      console.log('Data inserted:', insertedData);
      onClose();
    } catch (err: any) {
      setError('Failed to add data: ' + err.message);
      setLoading(false);
    }
  };
  return (
    <Fragment>
      <Button onClick={onOpen}>Add year</Button>
      <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth={true}>
        <DialogTitle>Add year</DialogTitle>
        <DialogContent>
          <TextField value={year} onChange={onChangeYear} fullWidth={true} />
          {error && <Alert severity='error'>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant='outlined' onClick={onSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}