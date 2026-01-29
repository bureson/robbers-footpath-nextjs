'use client'

import { useEffect, useState } from 'react';
import { Box, Breadcrumbs, Button, IconButton, Link, Paper, Table, TableContainer, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

import ConfirmDialog from '../components/confirmDialog';
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

  useEffect(() => {
    const channel = supabase.channel('realtime year').on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'year'
    }, payload => {
      setYearList(yearList.concat(payload.new));
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, yearList, setYearList]);

  const handleClick = (ev: any) => ev.preventDefault();
  const onNavigateHome = (ev: any) => router.push('/');
  const onDeleteYear = async (yearId: any) => {
    setYearList(yearList.filter(year => year.id !== yearId));
    await supabase.from('year').delete().eq('id', yearId);
  };

  return (
    <Box p={2}>
      <Breadcrumbs onClick={handleClick}>
        <Link href='/' onClick={onNavigateHome}>Home</Link>
        <Typography>Dashboard</Typography>
      </Breadcrumbs>
      <Box mt={2} mb={2}>
        <h2 className='text-2xl font-bold font-serif'>Manage years</h2>
        <p className='text-muted-foreground'>Create, edit, and delete years</p>
      </Box>
      <YearDialog />
      <TableContainer component={Paper} style={{ margin: '15px 0' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Year</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {yearList.map((year: any) => {
              const selectYear = () => router.push(`/admin/year/${year.year}`);
              const onDelete = (ev: any) => {
                ev.preventDefault();
                ev.stopPropagation();
                onDeleteYear(year.id);
              };
              return (
                <TableRow key={year.id} hover={true} onClick={selectYear} style={{ cursor: 'pointer' }}>
                  <TableCell>{year.year}</TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <ConfirmDialog onConfirm={onDelete} />
                  </TableCell>
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