import { Container } from '@mantine/core';
import { PromotionForm } from '../../components/PromotionForm';
import { PromotionFormData, updatePromotionAction } from '../../actions';
import { apiFetch } from '../../../../lib/api';

async function getPromotionData(id: string) {
  const response = await apiFetch(`/promotions/${id}`);
  const promo = await response.json();
  
  return {
    name: promo.name,
    value: promo.value,
    productId: promo.product?.id || '',
    minQuantity: promo.minQuantity
  };
}

async function getProducts() {
  const response = await apiFetch('/products');
  return response.json();
}

interface EditPromoProps {
  params: Promise<{ id: string }>;
}

export default async function EditPromotionPage({ params }: EditPromoProps) {
  const { id } = await params;
  
  // Executa as duas requisições no servidor simultaneamente para melhor performance
  const [promoData, products] = await Promise.all([
    getPromotionData(id),
    getProducts()
  ]);

  const handleSubmit = async (data: PromotionFormData) => {
    'use server';
    await updatePromotionAction(id, data);
  };

  return (
    <Container size="xl" py="xl">
      <PromotionForm 
        title="Editar Promoção" 
        products={products} 
        initialValues={promoData} 
        onSubmit={handleSubmit} 
      />
    </Container>
  );
}