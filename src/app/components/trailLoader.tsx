// Loading state for the trail list: a hiker walking past scrolling hills.

export default function TrailLoader () {
  return (
    <div className='flex min-h-[360px] flex-col items-center justify-center gap-2 rounded-[22px] bg-sand px-6 py-9' role='status' aria-label='Načítám trasy'>
      <svg viewBox='0 0 320 120' className='block h-[120px] w-[320px] max-w-full' strokeLinecap='round' aria-hidden='true'>
        <defs><clipPath id='trail-loader-clip'><rect x='0' y='0' width='320' height='120' /></clipPath></defs>
        <g clipPath='url(#trail-loader-clip)'>
          <g>
            <path d='M -320 96 Q -240 80 -160 96 T 0 96 T 160 96 T 320 96 T 480 96 T 640 96' fill='none' stroke='#cfe3c0' strokeWidth='3' />
            <path d='M -320 96 Q -240 80 -160 96 T 0 96 T 160 96 T 320 96 T 480 96 T 640 96' fill='none' stroke='#c9b27a' strokeWidth='2' strokeDasharray='6 12' />
            <g fill='#24512f'><polygon points='40,86 50,60 60,86' /><polygon points='120,88 128,66 136,88' /><polygon points='230,84 242,52 254,84' /><polygon points='300,88 306,72 312,88' /><polygon points='380,86 390,60 400,86' /><polygon points='470,88 478,66 486,88' /><polygon points='560,84 572,52 584,84' /><polygon points='620,88 626,72 632,88' /></g>
            <animateTransform attributeName='transform' type='translate' values='0 0;-320 0' dur='3s' repeatCount='indefinite' />
          </g>
          <g transform='translate(160 94)' stroke='#14261b' strokeWidth='3' fill='none'>
            <g>
              <animateTransform attributeName='transform' type='translate' values='0 0;0 -2;0 0' dur='0.45s' repeatCount='indefinite' />
              <circle cx='0' cy='-40' r='5' fill='#14261b' stroke='none' />
              <line x1='0' y1='-34' x2='0' y2='-16' />
              <rect x='-9' y='-33' width='8' height='14' rx='3' stroke='none' fill='#d21f1f'><animate attributeName='fill' values='#d21f1f;#1f5fd2;#1f9a3a;#e0b400;#d21f1f' dur='4s' repeatCount='indefinite' /></rect>
              <line x1='0' y1='-30' x2='9' y2='-20'><animateTransform attributeName='transform' type='rotate' values='-25 0 -30;25 0 -30;-25 0 -30' dur='0.9s' repeatCount='indefinite' /></line>
              <line x1='9' y1='-20' x2='9' y2='-2' stroke='#8a6b3f' strokeWidth='2'><animateTransform attributeName='transform' type='rotate' values='-25 0 -30;25 0 -30;-25 0 -30' dur='0.9s' repeatCount='indefinite' /></line>
              <line x1='0' y1='-16' x2='0' y2='0'><animateTransform attributeName='transform' type='rotate' values='-30 0 -16;30 0 -16;-30 0 -16' dur='0.9s' repeatCount='indefinite' /></line>
              <line x1='0' y1='-16' x2='0' y2='0'><animateTransform attributeName='transform' type='rotate' values='30 0 -16;-30 0 -16;30 0 -16' dur='0.9s' repeatCount='indefinite' /></line>
            </g>
          </g>
          <g fill='#14261b' opacity='.5'><path d='M0 0 q5 -5 10 0 q-5 -2 -10 0 M12 0 q5 -5 10 0 q-5 -2 -10 0'><animateMotion path='M 340 30 C 250 20, 150 40, -40 24' dur='7s' repeatCount='indefinite' /></path></g>
        </g>
      </svg>
    </div>
  );
}
