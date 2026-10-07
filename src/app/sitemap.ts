import type { MetadataRoute } from 'next';

// Lists the canonical https://www host so Google stops treating the redirecting http and bare-domain
// variants as candidate pages.
export default function sitemap (): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.loupeznickapesina.cz/',
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
