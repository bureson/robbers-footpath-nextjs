'use client';

import { useLayoutEffect, useRef, useState } from 'react';

// Animated landscape for the public hero: drifting clouds, hikers and cyclists on the trail, a signpost.
// SMIL animations run natively in the browser, no JS needed.

type HeroSceneProps = {
  year: string;
};

const VIEW_W = 1280;
const VIEW_H = 560;

const cutTopOf = (width: number, height: number) => width && height ? Math.max(0, VIEW_H - VIEW_W * height / width) : 0;

export default function HeroScene ({ year }: HeroSceneProps) {
  // With a bottom-anchored 'slice' crop, very wide heroes lose the top of the scene. Measure how many
  // viewBox units are cut and slide the sky (sun, clouds, birds) down so they stay in frame. The first
  // measurement happens in a layout effect so the shift is applied before the hydrated frame paints.
  const svgRef = useRef<SVGSVGElement>(null);
  const [cutTop, setCutTop] = useState(0);
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setCutTop(cutTopOf(rect.width, rect.height));
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (!width || !height) return;
      setCutTop(cutTopOf(width, height));
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);
  const skyShift = Math.round(cutTop * 0.7);

  return (
    <svg ref={svgRef} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio='xMidYMax slice' className='absolute inset-0 block h-full w-full' aria-hidden='true'>
      <defs>
        <linearGradient id='hero-sky' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stopColor='#dfe9f0' /><stop offset='1' stopColor='#f7f1dc' /></linearGradient>
        <linearGradient id='hero-meadow' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stopColor='#9fc27e' /><stop offset='1' stopColor='#e3cd6a' /></linearGradient>
        <path id='hero-trail' d='M -160 470 C 250 500, 520 430, 820 465 S 1180 440, 1440 455' fill='none' />
        <g id='hero-tree'><polygon points='0,-46 12,-10 -12,-10' fill='#24512f' /><polygon points='0,-30 9,-4 -9,-4' fill='#2f6a3b' /><rect x='-2' y='-5' width='4' height='6' fill='#4a3a25' /></g>
        <g id='hero-hiker' stroke='#14261b' strokeWidth='3' strokeLinecap='round' fill='none'>
          <circle cx='0' cy='-36' r='4.5' fill='#14261b' stroke='none' />
          <line x1='0' y1='-31' x2='0' y2='-15' />
          <rect x='-8' y='-30' width='7' height='13' rx='2.5' fill='#d21f1f' stroke='none' />
          <line x1='0' y1='-27' x2='8' y2='-18'><animateTransform attributeName='transform' type='rotate' values='-25 0 -27;25 0 -27;-25 0 -27' dur='0.9s' repeatCount='indefinite' /></line>
          <line x1='8' y1='-18' x2='8' y2='-2' stroke='#8a6b3f' strokeWidth='2'><animateTransform attributeName='transform' type='rotate' values='-25 0 -27;25 0 -27;-25 0 -27' dur='0.9s' repeatCount='indefinite' /></line>
          <line x1='0' y1='-15' x2='0' y2='0'><animateTransform attributeName='transform' type='rotate' values='-28 0 -15;28 0 -15;-28 0 -15' dur='0.9s' repeatCount='indefinite' /></line>
          <line x1='0' y1='-15' x2='0' y2='0'><animateTransform attributeName='transform' type='rotate' values='28 0 -15;-28 0 -15;28 0 -15' dur='0.9s' repeatCount='indefinite' /></line>
        </g>
        <g id='hero-bike' stroke='#14261b' strokeWidth='2.5' strokeLinecap='round' fill='none'>
          <g><circle cx='-11' cy='-8' r='8' /><line x1='-11' y1='-16' x2='-11' y2='0' /><line x1='-19' y1='-8' x2='-3' y2='-8' /><animateTransform attributeName='transform' type='rotate' from='0 -11 -8' to='360 -11 -8' dur='0.7s' repeatCount='indefinite' /></g>
          <g><circle cx='11' cy='-8' r='8' /><line x1='11' y1='-16' x2='11' y2='0' /><line x1='3' y1='-8' x2='19' y2='-8' /><animateTransform attributeName='transform' type='rotate' from='0 11 -8' to='360 11 -8' dur='0.7s' repeatCount='indefinite' /></g>
          <polyline points='-11,-8 -3,-22 9,-22 11,-8 0,-8 -3,-22' />
          <line x1='9' y1='-22' x2='13' y2='-26' />
          <line x1='-3' y1='-22' x2='-1' y2='-26' />
          <line x1='-2' y1='-27' x2='10' y2='-38' strokeWidth='3' />
          <line x1='10' y1='-38' x2='13' y2='-27' />
          <circle cx='12' cy='-43' r='4.5' fill='#1f5fd2' stroke='none' />
          <line x1='-2' y1='-27' x2='1' y2='-13'><animateTransform attributeName='transform' type='rotate' values='-30 -2 -27;30 -2 -27;-30 -2 -27' dur='0.7s' repeatCount='indefinite' /></line>
        </g>
      </defs>

      <rect width='1280' height='560' fill='url(#hero-sky)' />
      <g transform={`translate(0 ${skyShift})`}>
      {/* On phones the centred crop would lose the sun, so a second copy peeks from the top-right corner there.
          Both are in the markup and CSS picks one, so the sun never jumps after hydration. */}
      <circle cx='980' cy='150' r='46' fill='#f2c418' className='hidden md:block'><animate attributeName='cy' values='160;140;160' dur='30s' repeatCount='indefinite' /></circle>
      <circle cx='812' cy='150' r='46' fill='#f2c418' className='md:hidden'><animate attributeName='cy' values='160;140;160' dur='30s' repeatCount='indefinite' /></circle>
      <g fill='#fff' opacity='.9'>
        <g><ellipse cx='0' cy='0' rx='70' ry='22' /><ellipse cx='-30' cy='-10' rx='36' ry='24' /><ellipse cx='22' cy='-14' rx='44' ry='30' /><animateTransform attributeName='transform' type='translate' values='-160 110;1440 110' dur='150s' repeatCount='indefinite' /></g>
        <g><ellipse cx='0' cy='0' rx='90' ry='24' /><ellipse cx='-40' cy='-12' rx='40' ry='26' /><ellipse cx='30' cy='-18' rx='50' ry='34' /><animateTransform attributeName='transform' type='translate' values='-200 70;1480 70' dur='190s' repeatCount='indefinite' begin='-80s' /></g>
        <g opacity='.7'><ellipse cx='0' cy='0' rx='50' ry='14' /><ellipse cx='-18' cy='-8' rx='26' ry='16' /><ellipse cx='18' cy='-10' rx='28' ry='18' /><animateTransform attributeName='transform' type='translate' values='-120 190;1400 190' dur='120s' repeatCount='indefinite' begin='-45s' /></g>
        <g opacity='.8'><ellipse cx='0' cy='0' rx='60' ry='18' /><ellipse cx='-24' cy='-10' rx='30' ry='20' /><ellipse cx='20' cy='-12' rx='36' ry='24' /><animateTransform attributeName='transform' type='translate' values='-140 40;1420 40' dur='170s' repeatCount='indefinite' begin='-130s' /></g>
      </g>
      </g>

      <path d='M0 250 C 200 180, 380 200, 560 230 S 900 160, 1280 230 V 560 H 0 Z' fill='#b7cfa8' />
      <path d='M0 300 C 160 260, 300 320, 520 280 S 820 220, 1000 290 S 1200 300, 1280 270 V 560 H 0 Z' fill='#84ad78' />
      <g opacity='.55' fill='#fff'>
        <ellipse cx='300' cy='300' rx='260' ry='22'><animateTransform attributeName='transform' type='translate' values='-60 0;60 0;-60 0' dur='26s' repeatCount='indefinite' /></ellipse>
        <ellipse cx='900' cy='290' rx='300' ry='26'><animateTransform attributeName='transform' type='translate' values='50 0;-70 0;50 0' dur='32s' repeatCount='indefinite' /></ellipse>
      </g>
      <path d='M0 360 C 200 330, 360 380, 600 340 S 980 320, 1280 360 V 560 H 0 Z' fill='#4f8a55' />
      <g>
        <use href='#hero-tree' transform='translate(60 372) scale(1.3)' /><use href='#hero-tree' transform='translate(100 380) scale(1.6)' /><use href='#hero-tree' transform='translate(150 366) scale(1.1)' />
        <use href='#hero-tree' transform='translate(440 356) scale(1.2)' /><use href='#hero-tree' transform='translate(475 362) scale(1.5)' />
        <use href='#hero-tree' transform='translate(1080 352) scale(1.4)' /><use href='#hero-tree' transform='translate(1125 362) scale(1.8)' /><use href='#hero-tree' transform='translate(1180 356) scale(1.2)' /><use href='#hero-tree' transform='translate(1230 370) scale(1.6)' />
      </g>
      <path d='M0 400 C 300 370, 600 420, 900 390 S 1150 380, 1280 400 V 560 H 0 Z' fill='url(#hero-meadow)' />
      <path d='M -160 470 C 250 500, 520 430, 820 465 S 1180 440, 1440 455' fill='none' stroke='#e9d9a8' strokeWidth='10' strokeLinecap='round' />
      <path d='M -160 470 C 250 500, 520 430, 820 465 S 1180 440, 1440 455' fill='none' stroke='#c9b27a' strokeWidth='2' strokeDasharray='6 14' />
      <use href='#hero-tree' transform='translate(30 470) scale(2.4)' /><use href='#hero-tree' transform='translate(1250 480) scale(2.6)' />

      <g transform='translate(1000 452)' fontFamily='Helvetica,Arial,sans-serif' fontWeight='700' fill='#14261b'>
        <ellipse cx='6' cy='2' rx='22' ry='4' fill='#14261b' opacity='.2' />
        <path d='M 2 0 L 2 -70 C 2 -95, -8 -110, -10 -200 L -2 -200 C 0 -110, 10 -95, 12 -70 L 12 0 Z' fill='#b8874a' />
        <path d='M -30 -196 L -6 -228 L 18 -196 Z' fill='#4a3a25' />
        <path d='M -38 -194 L -6 -232 L 26 -194 L 22 -190 L -6 -224 L -34 -190 Z' fill='#5e7a63' />
        <g transform='translate(-6 -178)'><rect x='-32' y='-11' width='64' height='22' rx='2' fill='#fff' stroke='#14261b' strokeWidth='1.2' /><text x='0' y='-4' fontSize='3.5' textAnchor='middle' fontWeight='400'>KČT</text><text x='0' y='3' fontSize='7.5' textAnchor='middle' letterSpacing='.5'>MNÍŠEK</text><text x='0' y='8.5' fontSize='3.8' textAnchor='middle' fontWeight='400'>(HŘIŠTĚ FK) 380 m</text></g>
        <g transform='translate(-6 -150)'><path d='M -34 -9 H 44 L 54 0 L 44 9 H -34 Z' fill='#fff' stroke='#14261b' strokeWidth='1.2' /><path d='M 40 -9 H 44 L 54 0 L 44 9 H 40 Z' fill='#d21f1f' /><text x='-30' y='-2.5' fontSize='4.6'>OLDŘICHOV V H.</text><text x='36' y='-2.5' fontSize='4.6' textAnchor='end'>3 km</text><text x='-30' y='3' fontSize='4.6'>ŠPIČÁK</text><text x='36' y='3' fontSize='4.6' textAnchor='end'>6 km</text><text x='-30' y='8' fontSize='3' fontWeight='400'>{year}</text></g>
        <g transform='translate(-6 -126)'><path d='M 34 -9 H -44 L -54 0 L -44 9 H 34 Z' fill='#fff' stroke='#14261b' strokeWidth='1.2' /><path d='M -40 -9 H -44 L -54 0 L -44 9 H -40 Z' fill='#1f5fd2' /><text x='-36' y='-2.5' fontSize='4.6'>FOJTKA</text><text x='30' y='-2.5' fontSize='4.6' textAnchor='end'>4 km</text><text x='-36' y='3' fontSize='4.6'>ČERVENÁ RUKA</text><text x='30' y='3' fontSize='4.6' textAnchor='end'>7 km</text></g>
        <g transform='translate(-6 -102)'><path d='M -34 -9 H 44 L 54 0 L 44 9 H -34 Z' fill='#fff' stroke='#14261b' strokeWidth='1.2' /><path d='M 40 -9 H 44 L 54 0 L 44 9 H 40 Z' fill='#e0b400' /><text x='-30' y='-2.5' fontSize='4.6'>MNÍŠEK OÚ</text><text x='36' y='-2.5' fontSize='4.6' textAnchor='end'>1,5 km</text><text x='-30' y='3' fontSize='4.6'>ZÁVORY</text><text x='36' y='3' fontSize='4.6' textAnchor='end'>12 km</text></g>
      </g>

      <g>
        <use href='#hero-hiker'><animateMotion dur='48s' repeatCount='indefinite' begin='0s'><mpath href='#hero-trail' /></animateMotion></use>
        <use href='#hero-hiker' transform='scale(0.95)'><animateMotion dur='48s' repeatCount='indefinite' begin='-1.6s'><mpath href='#hero-trail' /></animateMotion></use>
        <use href='#hero-hiker'><animateMotion dur='48s' repeatCount='indefinite' begin='-3.4s'><mpath href='#hero-trail' /></animateMotion></use>
        <use href='#hero-hiker' transform='scale(0.9)'><animateMotion dur='48s' repeatCount='indefinite' begin='-4.6s'><mpath href='#hero-trail' /></animateMotion></use>
        <use href='#hero-hiker'><animateMotion dur='48s' repeatCount='indefinite' begin='-22s'><mpath href='#hero-trail' /></animateMotion></use>
        <use href='#hero-hiker'><animateMotion dur='48s' repeatCount='indefinite' begin='-23.5s'><mpath href='#hero-trail' /></animateMotion></use>
        <use href='#hero-bike'><animateMotion dur='17s' repeatCount='indefinite' begin='-6s'><mpath href='#hero-trail' /></animateMotion></use>
        <use href='#hero-bike'><animateMotion dur='17s' repeatCount='indefinite' begin='-6.9s'><mpath href='#hero-trail' /></animateMotion></use>
        <use href='#hero-bike'><animateMotion dur='17s' repeatCount='indefinite' begin='-13s'><mpath href='#hero-trail' /></animateMotion></use>
      </g>
      <g fill='#14261b' opacity='.6'>
        <path d='M0 0 q6 -6 12 0 q-6 -2 -12 0 M14 0 q6 -6 12 0 q-6 -2 -12 0' transform='translate(300 120)'><animateMotion path='M0 0 C 200 -30, 500 20, 900 -10' dur='40s' repeatCount='indefinite' /></path>
        <path d='M0 0 q5 -5 10 0 q-5 -2 -10 0 M12 0 q5 -5 10 0 q-5 -2 -10 0' transform='translate(340 140)'><animateMotion path='M0 0 C 200 -30, 500 20, 900 -10' dur='40s' repeatCount='indefinite' begin='-3s' /></path>
      </g>
    </svg>
  );
}
