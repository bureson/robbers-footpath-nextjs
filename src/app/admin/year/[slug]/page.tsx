'use client';

import { useParams, useRouter } from 'next/navigation';
import { Breadcrumbs, Box, Button, Link, Typography } from '@mui/material';

import ProtectedRoute from '../../../components/protectedRoute';

export default function YearPage () {
  const { slug } = useParams();
  const router = useRouter();

  const handleClick = (ev: any) => ev.preventDefault();
  const onNavigateHome = () => router.push('/');
  const onNavigateDashboard = () => router.push(`/admin`);
  return (
    <ProtectedRoute>
      <Box p={2}>
        <Breadcrumbs onClick={handleClick}>
          <Link href='/' onClick={onNavigateDashboard}>Home</Link>
          <Link href='/admin' onClick={onNavigateDashboard}>Dashboard</Link>
          <Typography>Year {slug}</Typography>
        </Breadcrumbs>
        <Button variant='outlined' size='small'>Add path</Button>
      </Box>
    </ProtectedRoute>
  );
}