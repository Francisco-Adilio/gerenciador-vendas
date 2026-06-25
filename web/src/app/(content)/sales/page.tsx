// app/sales/page.tsx
import SalesClient, { Sale } from './SalesClient';
import { apiFetch } from '../../lib/api';
import { Product } from '../products/ProductsClient';
import { Promotion } from '../promotions/PromotionsClient';

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

async function getSalesHistory(): Promise<Sale[]> {
  // Chamada limitando ou pegando a listagem geral das últimas vendas da sua API
  const response = await apiFetch('/sales?limit=5');
  if (!response.ok) throw new Error('Erro ao carregar histórico de vendas.');
  return response.json();
}

export default async function SalesPage() {
  // Dispara todas as requisições no servidor paralelamente para velocidade extrema
  const [products, promotions, history] = await Promise.all([
    getProducts(),
    getPromotions(),
    getSalesHistory(),
  ]);

  return (
    <SalesClient 
      products={products} 
      promotions={promotions} 
      initialHistory={history} 
    />
  );
}