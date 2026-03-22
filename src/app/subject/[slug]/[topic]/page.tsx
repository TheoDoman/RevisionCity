import { redirect } from 'next/navigation';

export default async function LegacyTopicPage({
  params,
}: {
  params: Promise<{ slug: string; topic: string }>;
}) {
  const { slug, topic } = await params;

  if (slug.endsWith('-edexcel')) {
    redirect(`/subject/edexcel/${slug.replace(/-edexcel$/, '')}/${topic}`);
  } else {
    redirect(`/subject/cambridge/${slug}/${topic}`);
  }
}
