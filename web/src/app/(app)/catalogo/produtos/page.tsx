import { getProducts } from '../../../lib/data';
import ProductsCatalogClient from './ProductsCatalogClient';

export default async function ProductsCatalogPage() {
  const products = await getProducts();
  return <ProductsCatalogClient products={products} />;
}
