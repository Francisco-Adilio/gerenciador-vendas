import SalesClient, { SalesResponse } from '../SalesClient';
import { apiFetch } from '../../../lib/api';
import { Product } from '../../products/ProductsClient';
import { Promotion } from '../../promotions/PromotionsClient';

interface Event {
  id: string;
  name: string;
}

interface EventSalesPageProps {
  params: Promise<{ eventId: string }>;
}

async function getEvent(eventId: string): Promise<Event> {
  const response = await apiFetch(`/events/${eventId}`);
  if (!response.ok) throw new Error('Erro ao carregar evento.');
  return response.json();
}

async function getProducts(): Promise<Product[]> {
  const response = await apiFetch('/products');
  if (!response.ok) throw new Error('Erro ao carregar produtos.');
  return response.json();
}

async function getPromotions(): Promise<Promotion[]> {
  const response = await apiFetch('/promotions');
  if (!response.ok) throw new Error('Erro ao carregar promoções.');
  return response.json();
}

async function getSalesResponse(eventId: string): Promise<SalesResponse> {
  const response = await apiFetch(`/events/${eventId}/sales`);
  if (!response.ok) throw new Error('Erro ao carregar histórico de vendas.');
  return response.json();
}

export default async function EventSalesPage({ params }: EventSalesPageProps) {
  const { eventId } = await params;
  const [event, products, promotions, salesResponse] = await Promise.all([
    getEvent(eventId),
    getProducts(),
    getPromotions(),
    getSalesResponse(eventId),
  ]);

  return (
    <SalesClient
      eventId={event.id}
      eventName={event.name}
      products={products}
      promotions={promotions}
      salesResponse={salesResponse}
    />
  );
}
