'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import supabase from './lib/supabaseClient';
import LoadingSpinner from './components/loadingSpinner';

const monthList = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];

export default function Home() {
  const [year, setYear] = useState<any>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const gettingLatestYear = async () => {
      const { data, error } = await supabase.from('year').select('*').order('year', { ascending: false }).limit(1);
      if (error) setError(error.message);
      else setYear(data[0]);
      setLoading(false);
    };
    gettingLatestYear();
  }, []);
  const eventDate = new Date(year.eventDate);
  const eventYear = eventDate.getFullYear();
  const month = monthList[eventDate.getMonth()];
  const day = eventDate.getDate();
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
