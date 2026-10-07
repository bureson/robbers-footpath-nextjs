'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import BrandBlaze from '../admin/brandBlaze';
import { ErrorNote, Label, Pill } from '../admin/ui';
import { useAuth } from '../context/authContext';

// Supabase reports a refused Google sign-in in the URL it redirects back to, in the query or the hash.
// The URL doesn't change while this page is open, so there is nothing to subscribe to.
const noSubscribe = () => () => {};
const noRedirectError = () => '';
const readRedirectError = () => {
  const params = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const code = params.get('error_code') ?? hash.get('error_code');
  const description = params.get('error_description') ?? hash.get('error_description');
  if (!code && !description) return '';
  // New sign-ups are disabled, so a Google account that isn't already an admin lands here.
  if (code === 'signup_disabled') return 'This Google account doesn\'t have access to the admin. Ask an existing admin to add you.';
  return description ?? 'Failed to log in. Please try again.';
};

export default function Login () {
  const { login, loading, user } = useAuth();
  const router = useRouter();
  const redirectError = useSyncExternalStore(noSubscribe, readRedirectError, noRedirectError);
  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const error = loginError || redirectError;

  // Already signed in, or just back from Google: go straight to the dashboard.
  useEffect(() => {
    if (!loading && user) router.replace('/admin');
  }, [loading, user, router]);

  const onLogin = async () => {
    try {
      setSubmitting(true);
      setLoginError('');
      await login();
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Failed to log in. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className='admin-root flex min-h-screen items-center justify-center bg-ink px-4 py-10' style={{ background: '#14261b' }}>
      <div className='w-full max-w-[440px]'>
        <Link href='/' className='mb-6 flex items-center justify-center gap-3 text-white no-underline'>
          <BrandBlaze width={38} height={22} />
          <span className='text-[18px] font-extrabold tracking-[-.02em]'>Loupežnická pěšina</span>
        </Link>

        <div className='rounded-[20px] bg-white px-7 pb-6 pt-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,.5)]'>
          <Label>Admin</Label>
          <h1 className='m-0 mt-[6px] text-[30px] leading-[1.1] font-semibold tracking-[-.03em] text-ink'>Sign in to manage the trails</h1>

          <ErrorNote>{error}</ErrorNote>

          <div className='mt-7 flex items-center justify-between gap-3'>
            <Link href='/' className='text-[13px] font-semibold text-sage no-underline hover:text-ink'>← Back to the site</Link>
            <Pill variant='primary' onClick={onLogin} disabled={submitting || loading}>{submitting ? 'Redirecting…' : 'Sign in with Google'}</Pill>
          </div>
        </div>
      </div>
    </div>
  );
}
