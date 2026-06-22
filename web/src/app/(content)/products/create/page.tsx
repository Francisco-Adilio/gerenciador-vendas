'use client';
import { Container } from '@mantine/core';
import { ProductForm, ProductFormData } from '../components/ProductForm';

export default function CreateProductPage() {
  const handleCreate = (data: ProductFormData) => {
    alert(`Salvando novo produto: ${JSON.stringify(data)}`);
  };

  return (
    <Container size="xl">
      <ProductForm title="Criar Novo Produto" onSubmit={handleCreate} />
    </Container>
  );
}