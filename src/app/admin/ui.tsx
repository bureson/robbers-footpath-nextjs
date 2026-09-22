'use client';

import { CSSProperties, ReactNode } from 'react';
import { Dialog } from '@mui/material';

import { cx } from './format';

type PillVariant = 'primary' | 'soft' | 'white' | 'danger' | 'ghost';

type PillProps = {
  children: ReactNode;
  variant?: PillVariant;
  size?: 'md' | 'sm';
  href?: string;
  download?: boolean;
  onClick?: (ev: React.MouseEvent) => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  title?: string;
};

const PILL_VARIANTS: Record<PillVariant, string> = {
  primary: 'bg-ink text-white hover:bg-[#1f3a29]',
  soft: 'bg-moss text-ink hover:bg-mist',
  white: 'bg-white text-ink hover:bg-moss',
  danger: 'bg-moss text-alert hover:bg-[#f7e3e1]',
  ghost: 'bg-transparent text-ink hover:bg-moss',
};

export function Pill (props: PillProps) {
  const { children, variant = 'soft', size = 'md', href, download, onClick, type = 'button', disabled, className, title } = props;
  const classes = cx(
    'inline-flex items-center justify-center whitespace-nowrap rounded-full font-bold transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
    size === 'md' ? 'text-[14px] px-5 py-3' : 'text-[11px] px-[10px] py-[5px]',
    PILL_VARIANTS[variant],
    className,
  );
  if (href) {
    return <a href={href} download={download} className={classes} onClick={onClick} title={title}>{children}</a>;
  }
  return <button type={type} className={classes} onClick={onClick} disabled={disabled} title={title}>{children}</button>;
}

type IconPillProps = {
  label: string;
  onClick?: (ev: React.MouseEvent) => void;
  variant?: 'soft' | 'danger';
  disabled?: boolean;
  children: ReactNode;
};

// Round icon-only button; `label` is the accessible name and the hover tooltip.
export function IconPill (props: IconPillProps) {
  const { label, onClick, variant = 'soft', disabled, children } = props;
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors disabled:opacity-50 disabled:pointer-events-none',
        PILL_VARIANTS[variant],
      )}
    >
      {children}
    </button>
  );
}

export function Eyebrow ({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('text-[13px] font-bold text-sage', className)}>{children}</div>;
}

export function Label ({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('text-[11px] font-bold uppercase tracking-[.06em] text-sage', className)}>{children}</div>;
}

type BlazeMarkProps = {
  color: string;
  width: number;
  height: number;
  radius?: number;
  border?: string;
  className?: string;
  style?: CSSProperties;
};

// A Czech trail blaze: white / colour / white horizontal stripes.
export function BlazeMark (props: BlazeMarkProps) {
  const { color, width, height, radius = 6, border, className, style } = props;
  return (
    <div
      aria-hidden='true'
      className={cx('shrink-0', className)}
      style={{
        width, height, borderRadius: radius, border,
        background: `linear-gradient(#fff 0 25%, ${color} 25% 75%, #fff 75%)`,
        ...style,
      }}
    />
  );
}

type StatCardProps = {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  tone?: 'moss' | 'sun';
  size?: 'md' | 'sm';
  className?: string;
};

export function StatCard (props: StatCardProps) {
  const { label, value, sub, tone = 'moss', size = 'md', className } = props;
  const sun = tone === 'sun';
  const small = size === 'sm';
  return (
    <div className={cx(small ? 'rounded-[16px] px-4 py-[14px]' : 'rounded-[20px] px-[22px] py-5', sun ? 'bg-sun text-ink' : 'bg-moss text-ink', className)}>
      <div className={cx('text-[12px] font-bold', sun ? 'opacity-70' : 'text-sage')}>{label}</div>
      <div className={cx('leading-none font-extrabold tracking-[-.03em] whitespace-nowrap', small ? 'mt-[6px] text-[26px]' : 'mt-2 text-[32px]')}>{value}</div>
      {sub && <div className={cx('text-[13px] font-semibold', small ? 'mt-1' : 'mt-2', !sun && 'text-sage')}>{sub}</div>}
    </div>
  );
}

type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
  as?: 'label' | 'div';
};

export function Field (props: FieldProps) {
  const { label, hint, children, className, as = 'label' } = props;
  const Tag = as;
  return (
    <Tag className={cx('flex flex-col gap-2', className)}>
      <span className='text-[13px] font-semibold text-ink'>{label}{hint && <span className='text-sage'> · {hint}</span>}</span>
      {children}
    </Tag>
  );
}

type AdminDialogProps = {
  open: boolean;
  onClose: () => void;
  eyebrow?: ReactNode;
  title: ReactNode;
  width?: number;
  children: ReactNode;
  footer?: ReactNode;
  footerNote?: ReactNode;
};

export function AdminDialog (props: AdminDialogProps) {
  const { open, onClose, eyebrow, title, width = 520, children, footer, footerNote } = props;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className='font-brico'
      slotProps={{
        paper: {
          sx: {
            width, maxWidth: 'calc(100% - 32px)', margin: '16px', borderRadius: '20px', padding: '28px 28px 24px',
            boxShadow: '0 30px 80px -20px rgba(0,0,0,.5)', color: '#14261b', fontFamily: 'inherit',
          },
        },
        backdrop: { sx: { backgroundColor: 'rgba(20,38,27,.55)', backdropFilter: 'blur(2px)' } },
      }}
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          {eyebrow && <Label>{eyebrow}</Label>}
          <h2 className='mt-[6px] text-[30px] leading-[1.1] font-semibold tracking-[-.03em] text-ink text-balance'>{title}</h2>
        </div>
        <button type='button' onClick={onClose} aria-label='Close' className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moss text-[18px] text-ink hover:bg-mist cursor-pointer'>×</button>
      </div>
      <div className='mt-7'>{children}</div>
      {(footer || footerNote) && (
        <div className={cx('mt-7 flex flex-wrap items-center gap-3', footerNote ? 'justify-between' : 'justify-end')}>
          {footerNote && <span className='text-[13px] font-semibold text-sage'>{footerNote}</span>}
          <div className='flex gap-2'>{footer}</div>
        </div>
      )}
    </Dialog>
  );
}

export function ErrorNote ({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <div className='mt-4 rounded-xl bg-[#fbe9e7] px-4 py-3 text-[13px] font-semibold text-alert'>{children}</div>;
}

