/**
 * robots.ts — Phase 9: SEO
 * يولّد /robots.txt تلقائياً بـ Next.js App Router
 */
import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fa-arch.cu.edu.eg';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/*/student/dashboard',
          '/*/faculty/dashboard',
          '/*/admin/dashboard',
          '/*/login',
          '/*/forgot-password',
          '/api/',
        ],
      },
      {
        // حماية Dashboard Bots
        userAgent: 'GPTBot',
        disallow: '/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
