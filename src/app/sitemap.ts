import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://revisioncity.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/subjects`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/subjects?board=edexcel`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/ai-generator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ];

  // Use service role key so the sitemap build has full read access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch all subjects with their exam_board so we can build canonical URLs
  const { data: subjects } = await supabase
    .from('subjects')
    .select('slug, exam_board');

  const subjectPages: MetadataRoute.Sitemap = (subjects || []).map((subject) => {
    const board = subject.exam_board === 'edexcel' ? 'edexcel' : 'cambridge';
    const baseSlug = subject.slug.replace(/-edexcel$/, '');
    return {
      url: `${BASE_URL}/subject/${board}/${baseSlug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    };
  });

  // Fetch all topics with their parent subject's slug and exam_board
  const { data: topics } = await supabase
    .from('topics')
    .select('slug, subjects!inner(slug, exam_board)')
    .returns<{ slug: string; subjects: { slug: string; exam_board: string } }[]>();

  const topicPages: MetadataRoute.Sitemap = (topics || []).map((topic) => {
    const board = topic.subjects.exam_board === 'edexcel' ? 'edexcel' : 'cambridge';
    const baseSlug = topic.subjects.slug.replace(/-edexcel$/, '');
    return {
      url: `${BASE_URL}/subject/${board}/${baseSlug}/${topic.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    };
  });

  return [...staticPages, ...subjectPages, ...topicPages];
}
