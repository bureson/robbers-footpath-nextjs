import type { MetadataRoute } from 'next';

// The admin portal and login sit behind auth (the home page footer links to /admin, which sends
// crawlers on to /login), so keep crawlers on the public page only.
export default function robots (): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/login', '/api'],
    },
    sitemap: 'https://www.loupeznickapesina.cz/sitemap.xml',
  };
}
