// app/sales/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '../../lib/api';

export interface CreateSaleData {
  productId: string;
  promotionId: string | null;
  quantity: number;
  paymentMethod: string;
}

export async function createSaleAction(data: CreateSaleData) {
  const response = await apiFetch('/sales', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Falha ao registrar a venda.');
  }

  revalidatePath('/sales');
}

export async function refundSaleAction(saleId: string) {
  const response = await apiFetch(`/sales/${saleId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Falha ao estornar a venda.');
  }

  revalidatePath('/sales');
}