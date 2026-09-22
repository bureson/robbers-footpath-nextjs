'use client';

import { Fragment, ReactNode, useState } from 'react';

import { AdminDialog, Pill } from '../admin/ui';

type ConfirmDialogProps = {
  onConfirm: (ev: React.MouseEvent) => void;
  title?: ReactNode;
  message?: ReactNode;
  confirmLabel?: ReactNode;
  renderTrigger: (open: (ev: React.MouseEvent) => void) => ReactNode;
};

export default function ConfirmDialog (props: ConfirmDialogProps) {
  const { onConfirm, title = 'Delete this?', message = 'This cannot be undone.', confirmLabel = 'Delete', renderTrigger } = props;
  const [open, setOpen] = useState(false);
  const onOpen = (ev: React.MouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    setOpen(true);
  };
  const onClose = () => setOpen(false);
  const onClickConfirm = (ev: React.MouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    onConfirm(ev);
    setOpen(false);
  };
  return (
    <Fragment>
      {renderTrigger(onOpen)}
      <AdminDialog
        open={open}
        onClose={onClose}
        eyebrow='Please confirm'
        title={title}
        width={440}
        footer={
          <Fragment>
            <Pill variant='soft' onClick={onClose}>Cancel</Pill>
            <Pill variant='primary' onClick={onClickConfirm} className='bg-alert hover:bg-[#8f1e18]'>{confirmLabel}</Pill>
          </Fragment>
        }
      >
        <p className='m-0 text-[15px] leading-[1.45] font-medium text-bark'>{message}</p>
      </AdminDialog>
    </Fragment>
  );
}
