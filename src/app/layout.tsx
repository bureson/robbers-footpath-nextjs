import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { AuthProvider } from './context/authContext';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Loupežnická pěšina',
    template: '%s | Loupežnickou pěšinou',
  },
  description: 'Loupežnická pěšina – turistické a cyklo trasy od 9 do 80 km, vhodné pro všechny věkové kategorie. Objevte krásy přírody, zajímavá místa a doporučené body na cestu pro pěší turisty a milovníky výletů.',
  metadataBase: new URL('https://www.loupeznickapesina.cz'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Loupežnická pěšina',
    description: 'Loupežnická pěšina – turistické a cyklo trasy od 9 do 80 km, vhodné pro všechny věkové kategorie. Objevte krásy přírody, zajímavá místa a doporučené body na cestu pro pěší turisty a milovníky výletů.',
    url: 'https://www.loupeznickapesina.cz',
    siteName: 'My App Name',
    locale: 'cs_CZ',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang='cs' className='scroll-smooth'>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <SpeedInsights />
        </body>
      </html>
    </AuthProvider>
  );
}
