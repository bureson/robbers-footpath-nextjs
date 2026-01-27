'use client'

import { Alert, Box, Button, Card, Link, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/authContext';

export default function Login () {
  const { login, loading, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const onChangeEmail = (ev: any) => setEmail(ev.target.value);
  const onChangePassword = (ev: any) => setPassword(ev.target.value);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill out all fields.');
      return;
    }

    try {
      await login(email, password);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
    }
  };
  return (
    <Box className='login'>
      <Card variant='outlined' style={{ margin: 'auto', width: '50%' }}>
        <Typography variant='h2'>Sign in</Typography>
        <form onSubmit={handleLogin}>
          <Box>
            <TextField variant='outlined' value={email} onChange={onChangeEmail} label='Email' placeholder='admin@example.com' />
          </Box>
          <Box>
            <TextField variant='outlined' type='password' value={password} onChange={onChangePassword} label='Password' autoComplete='current-password' />
          </Box>
          {error && <Box><Alert severity='error'>{error}</Alert></Box>}
          <Box>
            <Button variant='outlined' type='submit'>Log in</Button>
          </Box>
          <a href='/'>← Back to homepage</a>
        </form>
      </Card>
    </Box>
  );
}