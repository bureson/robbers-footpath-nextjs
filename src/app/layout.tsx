import type { Metadata } from 'next';
import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';

import { AuthProvider } from './context/authContext';
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

export const metadata: Metadata = {
  title: {
    default: `Loupežnická pěšina ${new Date().getFullYear()}`,
    template: `%s | Loupežnická pěšina ${new Date().getFullYear()}`,
  },
  description: 'Loupežnická pěšina – turistické a cyklo trasy od 9 do 80 km, vhodné pro všechny věkové kategorie. Objevte krásy přírody, zajímavá místa a doporučené body na cestu pro pěší turisty a milovníky výletů.',
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
    title: `Loupežnická pěšina ${new Date().getFullYear()}`,
    description: 'Loupežnická pěšina – turistické a cyklo trasy od 9 do 80 km, vhodné pro všechny věkové kategorie. Objevte krásy přírody, zajímavá místa a doporučené body na cestu pro pěší turisty a milovníky výletů.',
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
