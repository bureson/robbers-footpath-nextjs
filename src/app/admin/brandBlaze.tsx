'use client';

import { useEffect, useState } from 'react';

import { BLAZES } from './format';
import { BlazeMark } from './ui';

const SWIRL_EVERY_MS = 6500;

// The brand blaze: every few seconds it flips over and the reverse side carries the next blaze colour.
type BrandBlazeProps = { width?: number; height?: number; border?: string };

export default function BrandBlaze ({ width: WIDTH = 38, height: HEIGHT = 22, border }: BrandBlazeProps) {
  const [colorIndex, setColorIndex] = useState(0);
  const [swirling, setSwirling] = useState(false);
  const nextIndex = (colorIndex + 1) % BLAZES.length;

  useEffect(() => {
    const interval = setInterval(() => setSwirling(true), SWIRL_EVERY_MS);
    return () => clearInterval(interval);
  }, []);

  const onAnimationEnd = () => {
    setColorIndex(nextIndex);
    setSwirling(false);
  };

  if (!swirling) {
    return <BlazeMark color={BLAZES[colorIndex].hex} width={WIDTH} height={HEIGHT} radius={4} border={border} />;
  }

  return (
    <div className='blaze-swirl' style={{ position: 'relative', width: WIDTH, height: HEIGHT, flex: 'none', transformStyle: 'preserve-3d' }} onAnimationEnd={onAnimationEnd}>
      <BlazeMark color={BLAZES[colorIndex].hex} width={WIDTH} height={HEIGHT} radius={4} border={border} style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }} />
      <BlazeMark color={BLAZES[nextIndex].hex} width={WIDTH} height={HEIGHT} radius={4} border={border} style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} />
    </div>
  );
}
