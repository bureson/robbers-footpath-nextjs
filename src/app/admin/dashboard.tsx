'use client'

import { useEffect, useState } from 'react';
import { Box, Button, Paper, Table, TableContainer, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

import supabase from '../lib/supabaseClient';
import YearDialog from './yearDialog';

export default function Dashboard (props: any) {
  const { user, setUser } = props;
  const [yearList, setYearList] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const onLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  }
  useEffect(() => {
    const gettingYearList = async () => {
      const { data, error } = await supabase.from('year').select('*');
      if (error) setError(error.message);
      else setYearList(data);
      setLoading(false);
    };
    gettingYearList();
  }, []);

  return (
    <Box>
      <Typography variant='body1'>Welcome {user.displayName}</Typography>
      <YearDialog />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Year</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {yearList.map((year: any) => {
              return (
                <TableRow key={year.id} hover={true}>
                  <TableCell>{year.year}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Button onClick={onLogout}>Logout</Button>
    </Box>
  );
}