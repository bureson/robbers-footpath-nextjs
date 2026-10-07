'use client';

import { useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import DirectionsBike from '@mui/icons-material/DirectionsBike';
import Hiking from '@mui/icons-material/Hiking';
import MenuOutlined from '@mui/icons-material/MenuOutlined';

import { Trail, Year, blazeAt, cx, stampAt, sumParticipants } from './admin/format';
import BrandBlaze from './admin/brandBlaze';
import { BlazeMark } from './admin/ui';
import HeroScene from './components/heroScene';
import TrailOverlay from './components/trailOverlay';
import { formatCsDate, formatCsNumber, formatCsWeekday, participantsLabel, trailsLabel } from './lib/cs';

const FIRST_EDITION = 1972;

const scrollToId = (id: string) => {
  // The header is sticky, so measuring it gives the current offset; the page top is simply 0.
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  // Defer a tick so a year switch has re-rendered before we measure.
  setTimeout(() => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  }, 30);
};

const navPill = (active: boolean) => cx(
  'cursor-pointer rounded-full px-4 py-2 text-[14px] font-semibold whitespace-nowrap transition-colors',
  active ? 'bg-ink text-white' : 'bg-moss text-ink hover:bg-mist',
);

type HomeViewProps = {
  // Sorted newest-first by the server (see page.tsx), so the first entry is the current edition.
  yearList: Year[];
  trailList: Trail[];
  // Message from a failed server-side load; the page still renders with whatever data arrived.
  loadError?: string;
};

export default function HomeView ({ yearList, trailList, loadError = '' }: HomeViewProps) {
  const [error, setError] = useState(loadError);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [openTrail, setOpenTrail] = useState<Trail | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const currentYear = yearList[0] ?? null;
  const year = yearList.find(candidate => candidate.id === selectedYearId) ?? currentYear;
  const isCurrent = !year || !currentYear || year.id === currentYear.id;
  const isPast = !isCurrent;
  const yearLabel = year ? String(year.year) : String(new Date().getFullYear());
  const trailsOf = (candidate: Year | null) => candidate ? trailList.filter(trail => trail.yearId === candidate.id) : [];
  const trails = trailsOf(year);
  const hiking = trails.filter(trail => trail.type === 'hiking');
  const cycling = trails.filter(trail => trail.type === 'cycling');
  const participants = sumParticipants(trails);
  const previousYear = yearList[1] ?? null;
  const previousParticipants = sumParticipants(trailsOf(previousYear));
  const pastYears = yearList.slice(1);

  const blazeFor = (trail: Trail) => {
    const list = trail.type === 'cycling' ? cycling : hiking;
    return blazeAt(Math.max(0, list.findIndex(candidate => candidate.id === trail.id)));
  };

  const selectYear = (candidate: Year) => {
    setSelectedYearId(candidate.id);
    setOpenTrail(null);
    scrollToId('top');
  };
  const goHome = () => {
    setSelectedYearId(null);
    setOpenTrail(null);
    scrollToId('top');
  };
  const goPast = () => scrollToId(isCurrent ? 'past' : 'top');
  const goContact = () => scrollToId('contact');
  const goTrails = () => scrollToId('trails');
  const closeTrail = () => setOpenTrail(null);
  const onHideError = () => setError('');
  const toggleMenu = () => setMenuOpen(open => !open);
  const withMenuClosed = (action: () => void) => () => {
    setMenuOpen(false);
    action();
  };
  const navItems = [
    { label: currentYear ? String(currentYear.year) : 'Letošní ročník', active: isCurrent, onClick: withMenuClosed(goHome) },
    { label: 'Předchozí ročníky', active: isPast, onClick: withMenuClosed(goPast) },
    { label: 'Kontakt', active: false, onClick: withMenuClosed(goContact) },
  ];

  // Participation for the shown year once it is recorded, otherwise last year's as a teaser.
  const hasParticipation = participants > 0;
  const statCard = isCurrent
    ? hasParticipation
      ? { label: 'Letos s námi šlo a jelo', value: formatCsNumber(participants), sub: 'účastníků' }
      : previousYear && previousParticipants > 0
        ? { label: 'Loni s námi šlo a jelo', value: formatCsNumber(previousParticipants), sub: 'účastníků' }
        : { label: 'Tradice', value: `od ${FIRST_EDITION}`, sub: 'první ročník pochodu' }
    : hasParticipation
      ? { label: 'Celkem se zúčastnilo', value: formatCsNumber(participants), sub: `účastníků v roce ${yearLabel}` }
      : { label: 'Celkem se zúčastnilo', value: '–', sub: 'počet účastníků není k dispozici' };

  // A new edition has no trails until the club publishes them, so don't offer a choice of "0 trails".
  const introText = isCurrent
    ? trails.length > 0
      ? `Vyberte si některou z ${trails.length} nabízených tras, které pro vás nachystal Klub Českých Turistů v Mníšku u Liberce. Ke každé trase si můžete stáhnout GPX soubor a nahrát jej do vaší oblíbené navigační aplikace.`
      : `Trasy pro ročník ${yearLabel} pro vás chystá Klub Českých Turistů v Mníšku u Liberce. Ke každé trase si pak budete moci stáhnout GPX soubor a nahrát jej do vaší oblíbené navigační aplikace.`
    : `Trasy ročníku ${yearLabel}${participants > 0 ? ' včetně počtu účastníků na každé z nich' : ''}. GPX soubory zůstávají ke stažení.`;

  const renderColumn = (title: string, kind: 'hiking' | 'cycling', list: Trail[]) => (
    <div className='flex min-w-0 flex-col gap-3'>
      <div className='flex items-center justify-between px-[6px]'>
        <span className='flex items-center gap-[10px] text-[26px] leading-none font-extrabold tracking-[-.03em]'>
          <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moss text-ink' aria-hidden='true'>{kind === 'cycling' ? <DirectionsBike fontSize='small' /> : <Hiking fontSize='small' />}</span>
          {title}
        </span>
        {list.length > 0 && <span className='text-[13px] font-bold text-sage'>{trailsLabel(list.length)}</span>}
      </div>
      {list.length === 0 && (
        <div className='rounded-[22px] bg-sand p-5 text-[14px] font-semibold text-sage'>
          {isCurrent ? `Trasy pro ročník ${yearLabel} zveřejníme před konáním akce.` : 'Pro tento ročník nejsou žádné trasy k dispozici.'}
        </div>
      )}
      {list.map(trail => {
        const blaze = blazeFor(trail);
        const onOpen = () => setOpenTrail(trail);
        const stopClick = (ev: React.MouseEvent) => ev.stopPropagation();
        return (
          <div key={trail.id} onClick={onOpen} className='grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-stretch gap-4 rounded-[22px] bg-sand p-4 transition-colors hover:bg-moss'>
            <BlazeMark color={blaze.hex} width={36} height={56} radius={8} border='1.5px solid #14261b' className='h-full min-h-[56px]' />
            <div className='flex min-w-0 flex-col gap-2'>
              <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
                <span className='whitespace-nowrap text-[34px] leading-none font-extrabold tracking-[-.04em]'>{trail.title}</span>
                <span className='whitespace-nowrap text-[13px] font-bold text-sage'>↑ {formatCsNumber(trail.elevation ?? 0)} m převýšení</span>
                {hasParticipation && trail.participant_count != null && <span className='whitespace-nowrap text-[13px] font-bold text-sage'>· {participantsLabel(trail.participant_count)}</span>}
              </div>
              <div className='text-[13px] leading-[1.45] text-bark text-pretty'>{trail.description}</div>
              <div className='mt-auto flex flex-wrap gap-[6px]'>
                <button type='button' onClick={onOpen} className='cursor-pointer whitespace-nowrap rounded-full bg-ink px-[14px] py-[7px] text-[12px] font-bold text-white transition-colors hover:bg-[#1f3a29]'>Mapa trasy</button>
                {trail.gpxFileUrl && (
                  <a href={`${trail.gpxFileUrl}?download=1`} onClick={stopClick} className='whitespace-nowrap rounded-full border-[1.5px] border-ink bg-white px-3 py-[5.5px] text-[12px] font-bold text-ink no-underline transition-colors hover:bg-sun'>↓ GPX</a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className='font-brico min-h-screen bg-white text-ink antialiased'>
      <header id='top' className='sticky top-0 z-[5] w-full bg-white/90 backdrop-blur-lg'>
        <div className='mx-auto flex max-w-[1440px] items-center justify-between gap-[10px] px-6 py-[14px]'>
          <button type='button' onClick={goHome} className='flex cursor-pointer items-center gap-3 bg-transparent text-ink'>
            <BrandBlaze width={40} height={22} border='1.5px solid #14261b' />
            <span className='whitespace-nowrap text-[clamp(16px,2vw,20px)] font-extrabold tracking-[-.02em]'>Loupežnickou pěšinou</span>
          </button>
          <nav className='ml-auto hidden gap-[6px] md:flex'>
            {navItems.map(item => <button key={item.label} type='button' onClick={item.onClick} className={navPill(item.active)}>{item.label}</button>)}
          </nav>
          <button
            type='button'
            onClick={toggleMenu}
            aria-label={menuOpen ? 'Zavřít menu' : 'Otevřít menu'}
            aria-expanded={menuOpen}
            className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-moss text-ink transition-colors hover:bg-mist md:hidden'
          >
            {menuOpen ? <CloseOutlined fontSize='small' /> : <MenuOutlined fontSize='small' />}
          </button>
        </div>
        {menuOpen && (
          <nav className='flex flex-col gap-[6px] border-t border-ink/10 px-6 pb-4 pt-3 md:hidden'>
            {navItems.map(item => <button key={item.label} type='button' onClick={item.onClick} className={cx(navPill(item.active), 'w-full text-left')}>{item.label}</button>)}
          </nav>
        )}
      </header>

      <div className='mx-auto max-w-[1440px] px-6'>
        {isCurrent && (
          <section className='relative flex items-end overflow-hidden rounded-[28px]' style={{ minHeight: 'clamp(560px, 42vw, 80vh)', margin: '0 calc(min(0px, (1440px - 100vw) / 2 + 24px))' }}>
            <HeroScene year={yearLabel} />
            <div className='pointer-events-none absolute inset-0' style={{ background: 'linear-gradient(to top, rgba(20,38,27,.75) 0px, rgba(20,38,27,.25) 200px, rgba(20,38,27,0) 320px)' }} />
            <div
              className='pointer-events-none relative mx-auto flex w-full max-w-[1392px] flex-wrap items-end gap-x-8 gap-y-6 py-[clamp(20px,3.5vw,44px)]'
              // Side inset while the hero equals the column; it fades out as the hero bleeds past the column on wide screens.
              style={{ paddingLeft: 'min(clamp(20px, 3.5vw, 44px), max(0px, 68px - (100vw - 1440px) / 2))', paddingRight: 'min(clamp(20px, 3.5vw, 44px), max(0px, 68px - (100vw - 1440px) / 2))' }}
            >
              <div className='min-w-0 flex-[1_1_320px] text-white'>
                <h1 className='m-0 text-[clamp(34px,7vw,104px)] leading-[.9] font-extrabold tracking-[-.05em] text-balance' style={{ textShadow: '0 2px 24px rgba(20,38,27,.55)' }}>Loupežnickou pěšinou</h1>
                <p className='mb-0 mt-5 max-w-[560px] text-[18px] leading-[1.4] font-medium text-pretty' style={{ textShadow: '0 1px 12px rgba(20,38,27,.6)' }}>Pěší a cyklistická turistická akce v Mníšku u Liberce. Různé trasy od 9 do 80 km, vhodné pro všechny věkové kategorie</p>
              </div>
              {currentYear && (
                <button type='button' onClick={goTrails} className='pointer-events-auto min-w-[220px] flex-none cursor-pointer rounded-[20px] bg-sun px-[22px] py-5 text-left text-ink transition-transform duration-200 rotate-2 hover:rotate-0 hover:scale-[1.03]'>
                  <div className='text-[12px] font-bold uppercase tracking-[.06em] opacity-70'>{formatCsWeekday(currentYear.eventDate) || 'Termín'}</div>
                  <div className='mt-[6px] whitespace-nowrap text-[clamp(28px,3vw,40px)] leading-none font-extrabold tracking-[-.04em]'>{formatCsDate(currentYear.eventDate) || yearLabel}</div>
                  <div className='mt-[10px] text-[14px] leading-[1.5] font-semibold'>Start 7:00 – 9:00<br />hřiště FK Mníšek</div>
                </button>
              )}
            </div>
          </section>
        )}

        {isPast && year && (
          <section className='flex flex-wrap items-end justify-between gap-6 px-2 pt-6'>
            <div>
              <button type='button' onClick={goHome} className='cursor-pointer bg-transparent text-[14px] font-bold text-sage hover:text-ink'>← Zpět na rok {currentYear?.year}</button>
              <h1 className='m-0 mt-[10px] text-[clamp(48px,6vw,84px)] leading-[.9] font-extrabold tracking-[-.05em]'>Ročník {yearLabel}</h1>
              <div className='mt-[10px] text-[16px] font-semibold text-sage'>{formatCsDate(year.eventDate)}{participants > 0 && ` · ${participantsLabel(participants)}`}</div>
            </div>
            <div className='flex flex-wrap gap-[6px]'>
              {yearList.map(candidate => {
                const onPick = () => candidate.id === currentYear?.id ? goHome() : selectYear(candidate);
                return <button key={candidate.id} type='button' onClick={onPick} className={cx(navPill(candidate.id === year.id), 'font-bold')}>{String(candidate.year)}</button>;
              })}
            </div>
          </section>
        )}

        <section id='trails' className='mt-12 flex flex-col gap-6 md:flex-row md:items-start md:justify-between'>
          <div className='max-w-[720px] px-2 pt-2'>
            <h2 className='m-0 text-[40px] leading-none font-extrabold tracking-[-.04em]'>Trasy pro rok {yearLabel}</h2>
            <p className='mb-0 mt-[14px] text-[15px] leading-[1.5] text-bark text-pretty'>{introText}</p>
          </div>
          <div className='shrink-0 rounded-[20px] bg-ink px-[22px] py-5 text-white md:min-w-[260px]'><div className='text-[12px] font-bold opacity-70'>{statCard.label}</div><div className='mt-2 text-[40px] leading-none font-extrabold tracking-[-.04em]'>{statCard.value}</div><div className='mt-[6px] text-[13px] font-semibold opacity-70'>{statCard.sub}</div></div>
        </section>

        <section className='mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] gap-6'>
          {renderColumn('Pěší trasy', 'hiking', hiking)}
          {renderColumn('Cyklo trasy', 'cycling', cycling)}
        </section>

        {pastYears.length > 0 && (
          <section id='past' className='mt-16'>
            <div className='flex flex-wrap items-baseline justify-between gap-3 px-[6px]'>
              <span className='text-[26px] leading-none font-extrabold tracking-[-.03em]'>Předchozí ročníky</span>
              <span className='text-[13px] font-bold text-sage'>Prohlédnout si také můžete trasy předchozích ročníků</span>
            </div>
            <div className='mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(160px,100%),1fr))] gap-[14px]'>
              {pastYears.map((candidate, index) => {
                const list = trailsOf(candidate);
                const count = sumParticipants(list);
                const active = candidate.id === year?.id;
                const onPick = () => selectYear(candidate);
                return (
                  <button
                    key={candidate.id}
                    type='button'
                    onClick={onPick}
                    className='flex cursor-pointer flex-col gap-[10px] rounded-[20px] border-2 border-dashed px-[18px] py-5 text-left text-ink transition-transform duration-200 hover:-rotate-2 hover:scale-[1.03]'
                    style={{ background: stampAt(index + 1), borderColor: active ? '#14261b' : 'rgba(20,38,27,.3)' }}
                  >
                    <div className='text-[12px] font-bold uppercase tracking-[.06em] opacity-65'>{formatCsDate(candidate.eventDate)}</div>
                    <div className='text-[44px] leading-none font-extrabold tracking-[-.04em]'>{String(candidate.year)}</div>
                    <div className='text-[13px] font-semibold opacity-75'>{count > 0 ? `${participantsLabel(count)} · ` : ''}{trailsLabel(list.length)}</div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <footer id='contact' className='mt-[72px] bg-ink px-6 pb-7 pt-14 text-white'>
        <div className='mx-auto grid max-w-[1440px] grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-10'>
          <div>
            <div className='flex items-center gap-3'>
              <BrandBlaze width={40} height={22} />
              <span className='text-[20px] font-extrabold tracking-[-.02em]'>Loupežnickou pěšinou</span>
            </div>
            <p className='mb-0 mt-4 max-w-[380px] text-[14px] leading-[1.55] opacity-80 text-pretty'>Klub českých turistů v Mníšku u Liberce vás zve na turistický pochod Loupežnickou pěšinou. V nabídce pochodu jsou pěší a cyklo trasy. Vybrat si můžete libovolně dle vaší výkonnosti.</p>
          </div>
          <div>
            <div className='text-[16px] font-extrabold'>Detaily akce</div>
            <div className='mt-4 flex flex-col gap-[10px] text-[14px] opacity-85'>
              <span>{currentYear ? formatCsDate(currentYear.eventDate) : ''}</span>
              <span>Start: 7:00 – 9:00</span>
              <span>hřiště FK Mníšek</span>
              <a href='mailto:daneckova.b@seznam.cz' className='text-white'>daneckova.b@seznam.cz</a>
            </div>
          </div>
          <div>
            <div className='text-[16px] font-extrabold'>Odkazy</div>
            <div className='mt-4 flex flex-col gap-[10px] text-[14px] opacity-85'>
              <a href='https://mnisekkct.webnode.cz/' target='_blank' rel='noopener noreferrer' className='text-white no-underline hover:underline'>KČT Mníšek</a>
              <a href='https://www.obec-mnisek.cz/' target='_blank' rel='noopener noreferrer' className='text-white no-underline hover:underline'>Obec Mníšek</a>
              <a href='https://kct.cz/' target='_blank' rel='noopener noreferrer' className='text-white no-underline hover:underline'>Klub českých turistů</a>
              <a href='/admin' className='text-white no-underline hover:underline'>Admin portal</a>
            </div>
          </div>
        </div>
        <div className='mx-auto mt-10 max-w-[1440px] border-t border-white/15 pt-5 text-center text-[12px] opacity-60'>
          Powered by <a href='https://nextjs.org/' target='_blank' rel='noopener noreferrer' className='text-white'>Next.js</a>, <a href='https://vercel.com/' target='_blank' rel='noopener noreferrer' className='text-white'>Vercel</a> and <a href='https://supabase.com/' target='_blank' rel='noopener noreferrer' className='text-white'>Supabase</a>
        </div>
      </footer>

      <TrailOverlay trail={openTrail} blaze={openTrail ? blazeFor(openTrail) : blazeAt(0)} year={yearLabel} showParticipants={hasParticipation} onClose={closeTrail} />

      {error && (
        <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={onHideError}>
          <Alert severity='error' variant='filled' onClose={onHideError}>{error}</Alert>
        </Snackbar>
      )}
    </div>
  );
}
