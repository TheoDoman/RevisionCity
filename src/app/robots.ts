import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://revisioncity.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/sign-in', '/sign-up', '/settings', '/analytics', '/revision-plan', '/test-data', '/debug-content'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
