'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';

import LoadingSpinner from '../../../../../components/loadingSpinner';
import ProtectedRoute from '../../../../../components/protectedRoute';
import supabase from '../../../../../lib/supabaseClient';
import TrailDetailPage from './trailDetailPage';

const GpxMap = dynamic(() => import('../../../../../components/gpxMap'), { ssr: false });

export default function Trail () {
  const { slug, trailId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [year, setYear] = useState<any>(null);
  const [trail, setTrail] = useState<any>(null);

  useEffect(() => {
    const gettingTrail = async () => {
      setLoading(true);

      const { data: yearData, error: yearError } = await supabase.from('year').select('*').eq('year', slug).single();
      if (yearError) {
        setError(yearError.message);
        setLoading(false);
        return;
      }

      const { data: trailData, error: trailError } = await supabase.from('trail').select('*').eq('id', trailId).eq('yearId', yearData.id).single();
      if (trailError) setError(trailError.message);
      else {
        setYear(yearData);
        setTrail(trailData);
      }

      setLoading(false);
    };

    gettingTrail();
  }, [slug, trailId]);

  const handleClick = (ev: any) => ev.preventDefault();
  const onNavigateHome = () => router.push('/');
  const onNavigateDashboard = () => router.push('/admin');
  const onNavigateYear = () => router.push(`/admin/year/${slug}`);

  return (
    <ProtectedRoute>
      <Box p={2}>
        <Breadcrumbs onClick={handleClick}>
          <Link href='/' onClick={onNavigateHome}>Home</Link>
          <Link href='/admin' onClick={onNavigateDashboard}>Dashboard</Link>
          <Link href={`/admin/year/${slug}`} onClick={onNavigateYear}>Year {slug}</Link>
          <Typography>{trail?.title || 'Trail'}</Typography>
        </Breadcrumbs>
        {loading && <LoadingSpinner />}
        {!loading && error && <Box mt={2}><Typography color='error'>{error}</Typography></Box>}
        {!loading && !error && trail && year && <TrailDetailPage trail={trail} year={year} GpxMap={GpxMap} />}
      </Box>
    </ProtectedRoute>
  );
}
