import { Container } from '@mantine/core';
import { PromotionForm } from '../components/PromotionForm';
import { createPromotionAction, PromotionFormData } from '../actions';
import { apiFetch } from '../../../lib/api';

async function getProducts() {
  const response = await apiFetch('/products');
  return response.json();
}

export default async function CreatePromotionPage() {
  const products = await getProducts();

  const handleSubmit = async (data: PromotionFormData) => {
    'use server';
    await createPromotionAction(data);
  };

  return (
    <Container size="xl" py="xl">
      <PromotionForm title="Criar Nova Promoção" products={products} onSubmit={handleSubmit} />
    </Container>
  );
}