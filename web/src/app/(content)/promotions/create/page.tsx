'use client';
import { Container } from '@mantine/core';
import { PromotionForm, PromotionFormData } from '../components/PromotionForm';

export default function CreatePromotionPage() {
  const handleCreate = (data: PromotionFormData) => {
    alert(`Promoção registrada com sucesso: ${JSON.stringify(data)}`);
  };

  return (
    <Container size="xl">
      <PromotionForm title="Configurar Nova Promoção" onSubmit={handleCreate} />
    </Container>
  );
}