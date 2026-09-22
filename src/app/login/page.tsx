'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import BrandBlaze from '../admin/brandBlaze';
import { ErrorNote, Field, Label, Pill } from '../admin/ui';
import { useAuth } from '../context/authContext';

export default function Login () {
  const { login, loading, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already signed in: go straight to the dashboard.
  useEffect(() => {
    if (!loading && user) router.replace('/admin');
  }, [loading, user, router]);

  const onChangeEmail = (ev: React.ChangeEvent<HTMLInputElement>) => setEmail(ev.target.value);
  const onChangePassword = (ev: React.ChangeEvent<HTMLInputElement>) => setPassword(ev.target.value);
  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!email || !password) {
      setError('Please fill in both your email and password.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await login(email, password);
      router.push('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to log in. Please try again.');
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

        <form onSubmit={onSubmit} className='rounded-[20px] bg-white px-7 pb-6 pt-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,.5)]'>
          <Label>Admin</Label>
          <h1 className='m-0 mt-[6px] text-[30px] leading-[1.1] font-semibold tracking-[-.03em] text-ink'>Sign in to manage the trails</h1>

          <div className='mt-7 flex flex-col gap-[18px]'>
            <Field label='Email'>
              <input className='admin-input' type='email' value={email} onChange={onChangeEmail} placeholder='admin@example.com' autoComplete='email' autoFocus />
            </Field>
            <Field label='Password'>
              <input className='admin-input' type='password' value={password} onChange={onChangePassword} autoComplete='current-password' />
            </Field>
          </div>

          <ErrorNote>{error}</ErrorNote>

          <div className='mt-7 flex items-center justify-between gap-3'>
            <Link href='/' className='text-[13px] font-semibold text-sage no-underline hover:text-ink'>← Back to the site</Link>
            <Pill type='submit' variant='primary' disabled={submitting}>{submitting ? 'Signing in…' : 'Log in'}</Pill>
          </div>
        </form>
      </div>
    </div>
  );
}
