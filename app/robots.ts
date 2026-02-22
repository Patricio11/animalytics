import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://animalytics.co';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/settings/',
          '/pet-owner/',
          '/unauthorized/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
