'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch } from '../../lib/api';
import { ProductFormData } from './components/ProductForm';

export async function createProductAction(data: ProductFormData) {
  const response = await apiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Falha ao criar o produto.');

  revalidatePath('/products');
  redirect('/products');
}

export async function updateProductAction(id: string, data: ProductFormData) {
  const response = await apiFetch(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Falha ao atualizar o produto.');

  revalidatePath('/products');
  redirect('/products');
}

export async function deleteProductAction(id: string) {
  const response = await apiFetch(`/products/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('Falha ao excluir o produto.');

  revalidatePath('/products');
}