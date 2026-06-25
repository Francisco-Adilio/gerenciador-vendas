'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch } from '../../lib/api';

export interface PromotionFormData {
  name: string;
  value: number;
  productId: string;
}

export async function createPromotionAction(data: PromotionFormData) {
  const response = await apiFetch('/promotions', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Falha ao criar a promoção.');

  revalidatePath('/promotions');
  redirect('/promotions');
}

export async function updatePromotionAction(id: string, data: PromotionFormData) {
  const response = await apiFetch(`/promotions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Falha ao atualizar a promoção.');

  revalidatePath('/promotions');
  redirect('/promotions');
}

export async function deletePromotionAction(id: string) {
  const response = await apiFetch(`/promotions/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('Falha ao excluir a promoção.');

  revalidatePath('/promotions');
}