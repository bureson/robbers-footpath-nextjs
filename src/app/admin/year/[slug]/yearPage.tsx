'use client';

import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';

import supabase from '../../../lib/supabaseClient';
import TrailDialog from './trailDialog';
import TrailTable from './trailTable';

export default function YearPage (props: any) {
  const { year } = props;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trailList, setTrailList] = useState<any[]>([]);
  const trailDialogRef = useRef<any>(null);

  useEffect(() => {
    const gettingTrailList = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('trail').select('*').eq('yearId', year.id);
      if (error) setError(error.message);
      else setTrailList(data);
      setLoading(false);
    };
    gettingTrailList();
  }, []);

  const mergeTrail = (savedTrail: any) => {
    setTrailList(prevTrailList => {
      const nextTrailList = prevTrailList.some(trail => trail.id === savedTrail.id)
        ? prevTrailList.map(trail => trail.id === savedTrail.id ? savedTrail : trail)
        : prevTrailList.concat(savedTrail);
      return nextTrailList;
    });
  };

  useEffect(() => {
    const channel = supabase.channel('realtime year').on('postgres_changes', {
      event: '*', schema: 'public', table: 'trail', filter: `yearId=eq.${year.id}`
    }, payload => {
      if (payload.eventType === 'DELETE') {
        setTrailList(prevTrailList => prevTrailList.filter(trail => trail.id !== payload.old.id));
      } else {
        mergeTrail(payload.new);
      }
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, setTrailList, year.id]);

  const hikingTrailList = trailList.filter(trail => trail.type === 'hiking');
  const cyclingTrailList = trailList.filter(trail => trail.type === 'cycling');
  const onEdit = (trailId: any) => {
    const trail = trailList.find(trail => trail.id === trailId);
    trailDialogRef.current?.openEdit(trail);
  };
  const onDelete = async (trailId: any) => {
    setTrailList(trailList.filter(trail => trail.id !== trailId));
    await supabase.from('trail').delete().eq('id', trailId);
  };
  const onSelectTrail = (trailId: any) => router.push(`/admin/year/${year.year}/trail/${trailId}`);
  const onSaveTrail = (savedTrail: any) => mergeTrail(savedTrail);
  return (
    <Box>
      <Box mt={2} mb={2}>
        <h2 className='text-2xl font-bold font-serif'>Manage paths</h2>
        <p className='text-muted-foreground'>Create, edit, and delete hiking and cycling paths</p>
      </Box>
      <TrailDialog ref={trailDialogRef} yearId={year.id} onSaved={onSaveTrail} />
      <Box mt={2} mb={2}>
        <h3 className='text-xl font-bold font-serif'>Hiking paths</h3>
        <TrailTable trailList={hikingTrailList} onEdit={onEdit} onDelete={onDelete} onSelect={onSelectTrail} />
      </Box>
      <Box mt={2} mb={2}>
        <h3 className='text-xl font-bold font-serif'>Cycling paths</h3>
        <TrailTable trailList={cyclingTrailList} onEdit={onEdit} onDelete={onDelete} onSelect={onSelectTrail} />
      </Box>
    </Box>
  );
}
