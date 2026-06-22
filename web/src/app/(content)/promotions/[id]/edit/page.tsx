'use client';
import { Container } from '@mantine/core';
import { useParams } from 'next/navigation';
import { PromotionForm } from '../../components/PromotionForm';

export default function EditPromotionPage() {
  const params = useParams();
  const promotionId = params.id;

  const mockPromotion = { productId: 'p1', minQty: 3, discountValue: 200.00 };

  return (
    <Container size="xl">
      <PromotionForm 
        title={`Editar Promoção #${promotionId}`} 
        initialValues={mockPromotion} 
        onSubmit={(data) => alert(`Atualizando promoção ${promotionId}: ${JSON.stringify(data)}`)} 
      />
    </Container>
  );
}