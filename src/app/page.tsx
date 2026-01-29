'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import supabase from './lib/supabaseClient';
import LoadingSpinner from './components/loadingSpinner';
import TrailGrid from './components/trailGrid';

const monthList = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];

const getTrasyLabel = (trasyCount: Number) => {
  switch (trasyCount) {
    case 0:
      return 'Žádné trasy';
    case 1:
      return '1 trasa';
    case 2:
    case 3:
    case 4:
      return `${trasyCount} trasy`;
    default:
      return `${trasyCount} tras`;
  }
}

export default function Home() {
  const [year, setYear] = useState<any>({});
  const [trailList, setTrailList] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const gettingLatestYear = async () => {
      const { data: yearData, error: yearError } = await supabase.from('year').select('*').order('year', { ascending: false }).limit(1);
      if (yearError) setError(yearError.message);
      else {
        const year = yearData[0];
        const { data: trailData, error: trailError } = await supabase.from('trail').select('*').eq('yearId', year.id);
        if (trailError) setError(trailError.message);
        else {
          setYear(year);
          setTrailList(trailData);
        }
      };
      setLoading(false);
    };
    gettingLatestYear();
  }, []);
  const eventDate = new Date(year.eventDate);
  const eventYear = eventDate.getFullYear();
  const month = monthList[eventDate.getMonth()];
  const day = eventDate.getDate();

  const hikingTrailList = trailList.filter(trail => trail.type === 'hiking');
  const cyclingTrailList = trailList.filter(trail => trail.type === 'cycling');
  return (
    <div>
      {loading && <LoadingSpinner />}
      <div className={`flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black bg-background home-page ${loading ? 'loading' : 'loaded'}`}>
        <section className='relative flex items-center justify-center w-full h-screen min-h-[600px] overflow-hidden'>
          <div
            className='absolute inset-0 bg-cover bg-center bg-no-repeat'
            style={{ backgroundImage: `url('/jizera-background.jpg')` }}
          ></div>

          <div className='relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in'>
            <div className='inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-full mb-6 text-sm font-semibold'>
              <Image
                className='dark:invert'
                src='/calendar.svg'
                alt='Calendar'
                width={16}
                height={16} />
              <span>{`${day}. ${month} ${eventYear}`}</span>
            </div>
            <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 font-serif leading-tight'>
              Loupežnickou pěšinou
            </h1>
            <p className='text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto font-sans'>
              Pěší a cyklistická turistická akce v Mníšku u Liberce. Různé trasy od 9 do 80 km, vhodné pro všechny věkové kategorie
            </p>
            <div className='flex items-center justify-center gap-2 text-primary-foreground/80'>
              <Image
                className='dark:invert'
                src='/place.svg'
                alt='Location'
                width={16}
                height={16} />
              <span className='font-medium'>Mníšek u Liberce</span>
            </div>
          </div>
        </section>
        <section className='py-20 px-4 bg-background w-full inverse'>
          <div className='max-w-7xl mx-auto'>
            <div className='mb-16'>
              <div className='flex items-center gap-3 mb-8'>
                <div className='p-2 bg-accent-10 rounded-lg'>
                   <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-mountain w-8 h-8'>
                    <path d='m8 3 4 8 5-5 5 15H2L8 3z' />
                  </svg>
                </div>
                <h3 className='text-2xl font-bold text-foreground font-serif'>Pěší trasy</h3>
                <span className='bg-accent-10 text-primary px-3 py-1 rounded-full text-sm font-medium'>{getTrasyLabel(hikingTrailList.length)}</span>
              </div>
              <TrailGrid trailList={hikingTrailList} />
            </div>
            <div>
              <div className='flex items-center gap-3 mb-8'>
                <div className='p-2 bg-accent-10 rounded-lg'>
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bike w-8 h-8 text-accent">
                    <circle cx="18.5" cy="17.5" r="3.5" />
                    <circle cx="5.5" cy="17.5" r="3.5" />
                    <circle cx="15" cy="5" r="1" />
                    <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
                  </svg>
                </div>
                <h3 className='text-2xl font-bold text-foreground font-serif'>Cyklo trasy</h3>
                <span className='bg-accent-10 text-primary px-3 py-1 rounded-full text-sm font-medium'>{getTrasyLabel(cyclingTrailList.length)}</span>
              </div>
              <TrailGrid trailList={cyclingTrailList} />
            </div>
          </div>
        </section>
        <footer className='bg-accent text-primary-foreground w-full py-16 px-4'>
          <div className='max-w-7xl mx-auto'>
            <div className='grid md:grid-cols-3 gap-12 mb-12'>
              <div>
                <div className='flex items-center gap-2 mb-4'>
                  <Image
                    className='dark:invert w-8 h-8'
                    src='/mountain.svg'
                    alt='Mountain'
                    width={16}
                    height={16} />
                  <span className='text-xl font-bold font-serif'>Loupežnickou pěšinou</span>
                </div>
                <p className='text-primary-foreground/80 leading-relaxed'>
                  Klub českých turistů v Mníšku u Liberce vás zve na turistický pochod Loupežnickou pěšinou. V nabídce pochodu jsou pěší a cyklo trasy. Vybrat si můžete libovolně dle vaší výkonnosti.
                </p>
              </div>
              <div>
                <h4 className='font-bold text-lg mb-4 font-serif'>Detaily akce</h4>
                <div className='space-y-3'>
                  <div className='flex items-center gap-3 text-primary-foreground/80'>
                    <Image
                      className='dark:invert'
                      src='/calendar.svg'
                      alt='Calendar'
                      width={16}
                      height={16} />
                    <span>{`${day}. ${month} ${eventYear}`}</span>
                  </div>
                  <div className='flex items-center gap-3 text-primary-foreground/80'>
                    <Image
                      className='dark:invert'
                      src='/clock.svg'
                      alt='Clock'
                      width={16}
                      height={16} />
                    <span>Start: 7:00 – 9:00</span>
                  </div>
                  <div className='flex items-center gap-3 text-primary-foreground/80'>
                    <Image
                      className='dark:invert'
                      src='/place.svg'
                      alt='Location'
                      width={16}
                      height={16} />
                    <span> hřiště FK Mníšek</span>
                  </div>
                  <div className='flex items-center gap-3 text-primary-foreground/80'>
                    <Image
                      className='dark:invert'
                      src='/mail.svg'
                      alt='Contact'
                      width={16}
                      height={16} />
                    <span><a href='mailto:daneckova.b@seznam.cz'>daneckova.b@seznam.cz</a></span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className='font-bold text-lg mb-4 font-serif'>Odkazy</h4>
                <div className='space-y-2'>
                  <a href='https://mnisekkct.webnode.cz/' target='_blank' rel='noopener noreferrer' className='block text-primary-foreground/80 hover:text-primary-foreground transition-colors'>KČT Mníšek</a>
                  <a href='https://www.obec-mnisek.cz/' target='_blank' rel='noopener noreferrer' className='block text-primary-foreground/80 hover:text-primary-foreground transition-colors'>Obec Mníšek</a>
                  <a href='https://kct.cz/' target='_blank' rel='noopener noreferrer' className='block text-primary-foreground/80 hover:text-primary-foreground transition-colors'>Klub českých turistů</a>
                  <a href='/admin' className='block text-primary-foreground/80 hover:text-primary-foreground transition-colors'>Admin portal</a>
                </div>
              </div>
            </div>
            <div className='border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/60'>
              <p>Powered by <a href='https://nextjs.org/' target='_blank' rel='noopener noreferrer'>Next.js</a>, <a href='https://vercel.com/' target='_blank' rel='noopener noreferrer'>Vercel</a> and <a href='https://supabase.com/' target='_blank' rel='noopener noreferrer'>Supabase</a></p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
