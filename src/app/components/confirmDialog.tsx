import { Fragment, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import Delete from '@mui/icons-material/Delete';

export default function ConfirmDialog (props: any) {
  const { onConfirm } = props;
  const [open, setOpen] = useState(false);
  const onOpen = (ev: any) => {
    ev.preventDefault();
    ev.stopPropagation();
    setOpen(true);
  };
  const onClose = (ev: any) => {
    ev.preventDefault();
    ev.stopPropagation();
    setOpen(false);
  };
  const onClickConfirm = (ev: any) => {
    ev.preventDefault();
    ev.stopPropagation();
    onConfirm(ev);
    onClose(ev);
  };
  return (
    <Fragment>
      <IconButton onClick={onOpen} size='small'>
        <Delete fontSize='small' />
      </IconButton>
      <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
        <DialogTitle>Please confirm</DialogTitle>
        <DialogContent>Please confirm your action</DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant='outlined' onClick={onClickConfirm}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}