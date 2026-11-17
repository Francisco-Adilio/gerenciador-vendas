import { getSales } from '../../../../lib/data';
import SummaryClient from './SummaryClient';

export default async function SummaryPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const data = await getSales(eventId);
  return <SummaryClient {...data} />;
}
