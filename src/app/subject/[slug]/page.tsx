import { redirect } from 'next/navigation';

export default async function LegacySubjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug.endsWith('-edexcel')) {
    redirect(`/subject/edexcel/${slug.replace(/-edexcel$/, '')}`);
  } else {
    redirect(`/subject/cambridge/${slug}`);
  }
}
