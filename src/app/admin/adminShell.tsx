'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Alert, Snackbar } from '@mui/material';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';

import { useAuth } from '../context/authContext';
import { useAdmin } from './adminContext';
import { cx, formatShort } from './format';
import BrandBlaze from './brandBlaze';

export default function AdminShell ({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const { yearList, error, clearError } = useAdmin();
  const params = useParams<{ slug?: string }>();
  const activeSlug = params?.slug ? String(params.slug) : null;
  const isOverview = !activeSlug;

  return (
    <div className='admin-root'>
      <div className='grid min-h-screen grid-cols-1 md:grid-cols-[300px_1fr]'>
        <aside className='flex flex-col gap-1 bg-ink px-6 py-8 text-white md:sticky md:top-0 md:h-screen md:overflow-y-auto'>
          <Link href='/' title='Open the public site' className='mb-8 flex items-center gap-3 rounded-xl px-2 py-1 text-white no-underline transition-opacity hover:opacity-80'>
            <BrandBlaze />
            <span className='whitespace-nowrap text-[18px] font-extrabold tracking-[-.02em]'>Loupežnická pěšina</span>
          </Link>

          <Link
            href='/admin'
            className={cx(
              'flex items-center gap-[10px] rounded-xl px-4 py-3 text-[15px] no-underline transition-colors',
              isOverview ? 'bg-sun font-bold text-ink' : 'font-semibold text-white/85 hover:bg-white/10',
            )}
          >
            <HomeOutlined fontSize='small' />
            All years
          </Link>

          <hr className='my-3 border-0 border-t border-white/15' />

          {yearList.map(year => {
            const slug = String(year.year);
            const active = slug === activeSlug;
            return (
              <Link
                key={year.id}
                href={`/admin/year/${slug}`}
                className={cx(
                  'flex items-center justify-between rounded-xl px-4 py-3 text-[15px] no-underline transition-colors',
                  active ? 'bg-sun font-bold text-ink' : 'font-semibold text-white/85 hover:bg-white/10',
                )}
              >
                <span className='whitespace-nowrap'>{slug}</span>
                <span className={cx('whitespace-nowrap text-[13px]', active ? 'opacity-70' : 'opacity-60')}>{formatShort(year.eventDate)}</span>
              </Link>
            );
          })}

          <div className='mt-auto pt-8'>
            <button
              type='button'
              onClick={logout}
              className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-3 text-[14px] font-bold text-white transition-colors hover:bg-white/20'
            >
              <LogoutOutlined fontSize='small' />
              Logout
            </button>
          </div>
        </aside>

        <main className='min-w-0 bg-white px-4 pb-12 pt-7 text-ink sm:px-8 md:px-11 md:pt-9'>
          {children}
        </main>
      </div>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={clearError}>
        <Alert severity='error' variant='filled' onClose={clearError}>{error}</Alert>
      </Snackbar>
    </div>
  );
}
