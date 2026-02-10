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
     <Box className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Card
        variant="outlined"
        className="w-full max-w-md p-8 shadow-xl rounded-2xl bg-white"
      >
        <Box mb={2}>
          <Typography
            variant="h5"
            className="text-center text-4xl font-extrabold text-gray-900 tracking-tight"
          >
            Sign in
          </Typography>
        </Box>

        <form onSubmit={handleLogin} className="space-y-6">
          <Box>
            <TextField
              variant="outlined"
              fullWidth
              label="Email"
              placeholder="admin@example.com"
              value={email}
              onChange={onChangeEmail}
              className="bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-200 ease-in-out"
            />
          </Box>
          <Box>
            <TextField
              variant="outlined"
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={onChangePassword}
              autoComplete="current-password"
              className="bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-200 ease-in-out"
            />
          </Box>

          {error && (
            <Box>
              <Alert severity="error" className="mt-4">{error}</Alert>
            </Box>
          )}

          <Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              className="py-3 text-lg font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              Log in
            </Button>
          </Box>

          <Box className="text-center mt-4">
            <a href="/" className="text-indigo-600 hover:text-indigo-800 text-sm transition duration-150 ease-in-out">
              ← Back to homepage
            </a>
          </Box>
        </form>
      </Card>
    </Box>
  );
}