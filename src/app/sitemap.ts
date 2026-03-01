import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://revisioncity.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/subjects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/ai-generator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  // Fetch all subjects
  const { data: subjects } = await supabase
    .from('subjects')
    .select('slug');

  const subjectPages: MetadataRoute.Sitemap = (subjects || []).map((subject) => ({
    url: `${BASE_URL}/subject/${subject.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Fetch all topics with their subject slugs
  const { data: topics } = await supabase
    .from('topics')
    .select('slug, subjects!inner(slug)')
    .returns<{ slug: string; subjects: { slug: string } }[]>();

  const topicPages: MetadataRoute.Sitemap = (topics || []).map((topic) => ({
    url: `${BASE_URL}/subject/${topic.subjects.slug}/${topic.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...subjectPages, ...topicPages];
}
