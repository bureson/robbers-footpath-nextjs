import { Trail, Year, sortTrails, sortYears } from './admin/format';
import HomeView from './homeView';
import supabase from './lib/supabaseClient';

// The public page is rendered on the server with the trails already in the HTML, so nothing
// pops in after load. Vercel re-renders it in the background at most once a minute, which is how
// edits made in the admin reach visitors.
export const revalidate = 60;

export default async function Home () {
  const [yearResult, trailResult] = await Promise.all([
    supabase.from('year').select('*'),
    supabase.from('trail').select('*'),
  ]);
  const loadError = yearResult.error?.message ?? trailResult.error?.message ?? '';
  const yearList = yearResult.error ? [] : sortYears(yearResult.data as Year[]);
  const trailList = trailResult.error ? [] : sortTrails(trailResult.data as Trail[]);

  return <HomeView yearList={yearList} trailList={trailList} loadError={loadError} />;
}
