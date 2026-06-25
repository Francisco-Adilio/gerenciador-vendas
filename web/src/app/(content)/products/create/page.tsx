import { Container } from '@mantine/core';
import { ProductForm, ProductFormData } from '../components/ProductForm';
import { createProductAction } from '../actions';

export default function CreateProductPage() {
  // Passamos a Server Action diretamente como callback do onSubmit
  const handleSubmit = async (data: ProductFormData) => {
    'use server';
    await createProductAction(data);
  };

  return (
    <Container size="xl" py="xl">
      <ProductForm 
        title="Criar Novo Produto" 
        onSubmit={handleSubmit} 
      />
    </Container>
  );
}
