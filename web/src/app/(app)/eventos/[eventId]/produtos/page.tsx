import { getEventProducts, getProducts } from '../../../../lib/data';
import EventProductsClient from './EventProductsClient';

export default async function EventProductsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const [linked, catalog] = await Promise.all([getEventProducts(eventId), getProducts()]);
  return <EventProductsClient eventId={eventId} linked={linked} catalog={catalog} />;
}
