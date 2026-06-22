'use client';
import { Container } from '@mantine/core';
import { useParams } from 'next/navigation';
import { ProductForm } from '../../components/ProductForm';

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id;

  // Em um cenário real, você buscaria os dados do produto usando o `productId`
  const mockProduct = { name: 'Notebook Dell', price: 4500.00 };

  return (
    <Container size="xl">
      <ProductForm 
        title={`Editar Produto #${productId}`} 
        initialValues={mockProduct} 
        onSubmit={(data) => alert(`Atualizando produto ${productId}: ${JSON.stringify(data)}`)} 
      />
    </Container>
  );
}