'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Breadcrumbs, Box, Button, Card, Link, TextField, Typography } from '@mui/material';

import LoadingSpinner from '../../../components/loadingSpinner';
import ProtectedRoute from '../../../components/protectedRoute';
import supabase from '../../../lib/supabaseClient';
import YearPage from './yearPage';

export default function Year () {
  const { slug } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [year, setYear] = useState({});

  useEffect(() => {
    const gettingYear = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('year').select('*').eq('year', slug);
      if (error) setError(error.message);
      else {
        if (data.length === 0) setError(`Nothing found for: ${slug}`);
        setYear(data[0]);
      }
      setLoading(false);
    };
    gettingYear();
  }, []);

  const handleClick = (ev: any) => ev.preventDefault();
  const onNavigateHome = () => router.push('/');
  const onNavigateDashboard = () => router.push(`/admin`);
  const onChangeEventDate = (ev: any) => {
    setYear({ ...year, eventDate: ev.target.value });
  };
  return (
    <ProtectedRoute>
      <Box p={2}>
        <Breadcrumbs onClick={handleClick}>
          <Link href='/' onClick={onNavigateDashboard}>Home</Link>
          <Link href='/admin' onClick={onNavigateDashboard}>Dashboard</Link>
          <Typography>Year {slug}</Typography>
        </Breadcrumbs>
        {loading ? <LoadingSpinner /> : <YearPage year={year} />}
      </Box>
    </ProtectedRoute>
  );
}