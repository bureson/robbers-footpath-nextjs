'use client'

import { Alert, Box, Button, TextField } from '@mui/material';
import { useState } from 'react';
import supabase from '../lib/supabaseClient';

export default function Login (props: any) {
  const { setUser } = props;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function signInWithEmail (ev: any) {
    ev.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else {
      console.log({ data });
      setUser(data.user);
    }
  }
  const onChangeEmail = (ev: any) => setEmail(ev.target.value);
  const onChangePassword = (ev: any) => setPassword(ev.target.value);
  return (
    <Box className='login'>
      <form onSubmit={signInWithEmail}>
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
      </form>
    </Box>
  );
}