import PromotionsClient, { Promotion } from './PromotionsClient';
import { apiFetch } from '../../lib/api';

async function getPromotions(): Promise<Promotion[]> {
  const response = await apiFetch('/promotions');
  if (!response.ok) throw new Error('Erro ao carregar promoções.');
  return response.json();
}

export default async function PromotionsPage() {
  const promotions = await getPromotions();
  return <PromotionsClient initialPromotions={promotions} />;
}
