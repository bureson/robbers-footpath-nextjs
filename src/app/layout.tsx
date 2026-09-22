import type { Metadata } from 'next';
import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';

import { AuthProvider } from './context/authContext';
import supabase from './lib/supabaseClient';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin', 'latin-ext'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Google reads the site name shown in search results from a WebSite JSON-LD
// block. It must be a <script type="application/ld+json">; putting it in the
// `other` metadata field renders a <meta> tag, which Google ignores.
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Loupežnická pěšina',
  alternateName: 'Loupeznicka pesina',
  url: 'https://www.loupeznickapesina.cz/',
};

// The layout is rendered once per revalidation window, so the title picks up a newly added year
// within a minute, matching the public page (see page.tsx).
export const revalidate = 60;

const description = 'Loupežnická pěšina – turistické a cyklo trasy od 9 do 80 km, vhodné pro všechny věkové kategorie. Objevte krásy přírody, zajímavá místa a doporučené body na cestu pro pěší turisty a milovníky výletů.';

// The year in the title is the newest edition in the database, which is what the home page shows
// as the current one. If the query fails, fall back to the calendar year rather than no year.
const latestYear = async () => {
  const { data, error } = await supabase.from('year').select('year').order('year', { ascending: false }).limit(1);
  const year = Number(data?.[0]?.year);
  return !error && Number.isFinite(year) && year > 0 ? year : new Date().getFullYear();
};

export async function generateMetadata (): Promise<Metadata> {
  const siteTitle = `Loupežnická pěšina ${await latestYear()}`;

  return {
    title: {
      default: siteTitle,
      template: `%s | ${siteTitle}`,
    },
    description,
    metadataBase: new URL('https://www.loupeznickapesina.cz'),
    alternates: {
      canonical: '/',
    },
    // Google shows the large og:image preview (Discover, rich results) only when the page opts in.
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
    openGraph: {
      title: siteTitle,
      description,
      url: 'https://www.loupeznickapesina.cz',
      siteName: 'Loupežnická pěšina',
      locale: 'cs_CZ',
      type: 'website',
      images: [
        {
          // Bump the query when the image changes so social networks refetch it instead of serving their cached copy.
          url: 'https://www.loupeznickapesina.cz/page-image.png?v=2',
          width: 1200,
          height: 630,
          alt: 'Loupežnická pěšina'
        },
      ]
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang='cs' className='scroll-smooth'>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} antialiased`}
        >
          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
          />
          {children}
          <SpeedInsights />
          <Script
            data-goatcounter='https://loupeznickapesina.goatcounter.com/count'
            src='//gc.zgo.at/count.js'
            strategy='afterInteractive'
          />
        </body>
      </html>
    </AuthProvider>
  );
}
