import ProductsClient, { Product } from './ProductsClient';
import { apiFetch } from '@/app/lib/api';

// Função para buscar os dados diretamente no servidor
async function getProducts(): Promise<Product[]> {
  const response = await apiFetch('/products', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar produtos.');
  }

  return response.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return <ProductsClient initialProducts={products} />;
}
