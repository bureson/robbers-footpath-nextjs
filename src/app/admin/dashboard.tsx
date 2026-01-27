'use client'

import { useEffect, useState } from 'react';
import { Box, Breadcrumbs, Button, Link, Paper, Table, TableContainer, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

import { useAuth } from '../context/authContext';
import supabase from '../lib/supabaseClient';
import YearDialog from './yearDialog';

export default function Dashboard (props: any) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [yearList, setYearList] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const gettingYearList = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('year').select('*');
      if (error) setError(error.message);
      else setYearList(data);
      setLoading(false);
    };
    gettingYearList();
  }, []);

  const handleClick = (ev: any) => ev.preventDefault();
  const onNavigateHome = (ev: any) => router.push('/');

  return (
    <Box p={2}>
      <Breadcrumbs onClick={handleClick}>
        <Link href='/' onClick={onNavigateHome}>Home</Link>
        <Typography>Dashboard</Typography>
      </Breadcrumbs>
      <YearDialog />
      <TableContainer component={Paper} style={{ margin: '15px 0' }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Year</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {yearList.map((year: any) => {
              const selectYear = () => router.push(`/admin/year/${year.year}`);
              return (
                <TableRow key={year.id} hover={true} onClick={selectYear} style={{ cursor: 'pointer' }}>
                  <TableCell>{year.year}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Button size='small' onClick={logout}>Logout</Button>
    </Box>
  );
}