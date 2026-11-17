import { getSales } from '../../../../lib/data';
import SalesClient from './SalesClient';

export default async function SalesPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { sales } = await getSales(eventId);
  return <SalesClient eventId={eventId} sales={sales} />;
}
