import { getProducts, getPromotions } from '../../../lib/data';
import PromotionsCatalogClient from './PromotionsCatalogClient';

export default async function PromotionsCatalogPage() {
  const [promotions, products] = await Promise.all([getPromotions(), getProducts()]);
  return <PromotionsCatalogClient promotions={promotions} products={products} />;
}
