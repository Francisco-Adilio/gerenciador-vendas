import { getEventProducts } from '../../../lib/data';
import CheckoutClient from './caixa/CheckoutClient';

export default async function CheckoutPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const products = await getEventProducts(eventId);
  return <CheckoutClient eventId={eventId} products={products} />;
}
