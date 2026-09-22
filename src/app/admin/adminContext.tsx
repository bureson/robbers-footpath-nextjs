'use client';

import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import supabase from '../lib/supabaseClient';
import { Trail, Year, sortTrails, sortYears } from './format';

type AdminContextType = {
  yearList: Year[];
  trailList: Trail[];
  loading: boolean;
  error: string;
  clearError: () => void;
  trailsForYear: (yearId: number) => Trail[];
  mergeYear: (year: Year) => void;
  deleteYear: (yearId: number) => Promise<void>;
  mergeTrail: (trail: Trail) => void;
  deleteTrail: (trailId: number) => Promise<void>;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const upsertById = <T extends { id: number }>(list: T[], item: T) =>
  list.some(existing => existing.id === item.id)
    ? list.map(existing => existing.id === item.id ? item : existing)
    : list.concat(item);

export function AdminProvider ({ children }: { children: ReactNode }) {
  const [yearList, setYearList] = useState<Year[]>([]);
  const [trailList, setTrailList] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [yearResult, trailResult] = await Promise.all([
        supabase.from('year').select('*'),
        supabase.from('trail').select('*'),
      ]);
      if (yearResult.error) setError(yearResult.error.message);
      else setYearList(sortYears(yearResult.data as Year[]));
      if (trailResult.error) setError(trailResult.error.message);
      else setTrailList(sortTrails(trailResult.data as Trail[]));
      setLoading(false);
    };
    load();
  }, []);

  const mergeYear = useCallback((year: Year) => {
    setYearList(prev => sortYears(upsertById(prev, year)));
  }, []);

  const mergeTrail = useCallback((trail: Trail) => {
    setTrailList(prev => sortTrails(upsertById(prev, trail)));
  }, []);

  useEffect(() => {
    const channel = supabase.channel('realtime admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'year' }, payload => {
        if (payload.eventType === 'DELETE') setYearList(prev => prev.filter(year => year.id !== payload.old.id));
        else mergeYear(payload.new as Year);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trail' }, payload => {
        if (payload.eventType === 'DELETE') setTrailList(prev => prev.filter(trail => trail.id !== payload.old.id));
        else mergeTrail(payload.new as Trail);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [mergeYear, mergeTrail]);

  const deleteYear = useCallback(async (yearId: number) => {
    setYearList(prev => prev.filter(year => year.id !== yearId));
    const { error: deleteError } = await supabase.from('year').delete().eq('id', yearId);
    if (deleteError) setError(deleteError.message);
    else setTrailList(prev => prev.filter(trail => trail.yearId !== yearId));
  }, []);

  const deleteTrail = useCallback(async (trailId: number) => {
    setTrailList(prev => prev.filter(trail => trail.id !== trailId));
    const { error: deleteError } = await supabase.from('trail').delete().eq('id', trailId);
    if (deleteError) setError(deleteError.message);
  }, []);

  const trailsForYear = useCallback((yearId: number) => trailList.filter(trail => trail.yearId === yearId), [trailList]);
  const clearError = useCallback(() => setError(''), []);

  const value = useMemo(() => ({
    yearList, trailList, loading, error, clearError, trailsForYear, mergeYear, deleteYear, mergeTrail, deleteTrail,
  }), [yearList, trailList, loading, error, clearError, trailsForYear, mergeYear, deleteYear, mergeTrail, deleteTrail]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
