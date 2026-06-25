// app/products/[id]/edit/page.tsx
import { Container } from '@mantine/core';
import { ProductForm, ProductFormData } from '../../components/ProductForm';
import { updateProductAction } from '../../actions';
import { apiFetch } from '../../../../lib/api';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string): Promise<ProductFormData> {
  const response = await apiFetch(`/products/${id}`);

  if (!response.ok) {
    throw new Error('Produto não encontrado.');
  }

  return response.json();
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const productData = await getProduct(id);

  const handleSubmit = async (data: ProductFormData) => {
    'use server';
    await updateProductAction(id, data);
  };

  return (
    <Container size="xl" py="xl">
      <ProductForm 
        title="Editar Produto" 
        initialValues={productData} 
        onSubmit={handleSubmit} 
      />
    </Container>
  );
}
