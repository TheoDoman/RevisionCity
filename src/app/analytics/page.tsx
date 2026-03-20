import { AnalyticsPageClient } from '@/components/AnalyticsPageClient';

export const metadata = {
  title: 'My Progress | Revision City',
  description: 'Track your revision progress, spot weak topics, and see your predicted IGCSE grade.',
};

export default function AnalyticsPage() {
  return <AnalyticsPageClient />;
}
