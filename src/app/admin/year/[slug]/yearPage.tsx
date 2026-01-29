'use client';

import { useEffect, useState } from 'react';
import { Box, Card, Typography } from '@mui/material';

import supabase from '../../../lib/supabaseClient';
import TrailDialog from './trailDialog';
import TrailTable from './trailTable';

export default function YearPage (props: any) {
  const { year } = props;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trailList, setTrailList] = useState<any[]>([]);

  useEffect(() => {
    const gettingTrailList = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('trail').select('*').eq('yearId', year.id);
      if (error) setError(error.message);
      else {
        setTrailList(data);
      }
      setLoading(false);
    };
    gettingTrailList();
  }, []);

  useEffect(() => {
    const channel = supabase.channel('realtime year').on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'trail'
    }, payload => {
      setTrailList(trailList.concat(payload.new));
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, trailList, setTrailList]);

  const hikingTrailList = trailList.filter(trail => trail.type === 'hiking');
  const cyclingTrailList = trailList.filter(trail => trail.type === 'cycling');
  return (
    <Box>
      <Box mt={2} mb={2}>
        <h2 className='text-2xl font-bold font-serif'>Manage paths</h2>
        <p className='text-muted-foreground'>Create, edit, and delete hiking and cycling paths</p>
      </Box>
      <TrailDialog yearId={year.id} />
      <Box mt={2} mb={2}>
        <h3 className='text-xl font-bold font-serif'>Hiking paths</h3>
        <TrailTable trailList={hikingTrailList} />
      </Box>
      <Box mt={2} mb={2}>
        <h3 className='text-xl font-bold font-serif'>Cycling paths</h3>
        <TrailTable trailList={cyclingTrailList} />
      </Box>
    </Box>
  );
}