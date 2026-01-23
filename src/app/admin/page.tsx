'use client'

import { Alert, Box, Button, TextField } from '@mui/material';
import { useEffect, useState } from 'react';

import Dashboard from './dashboard';
import Login from './login';

export default function Admin () {
  const [user, setUser] = useState(null);
  return (
    <Box className='dashboard'>
      {user ? <Dashboard user={user} setUser={setUser} /> : <Login setUser={setUser} />}
    </Box>
  );
}