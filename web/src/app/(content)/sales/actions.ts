// app/sales/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '../../lib/api';

export interface CreateSaleData {
  eventId: string;
  productId: string;
  promotionId: string | null;
  quantity: number;
  paymentMethod: string;
}

export async function createSaleAction(data: CreateSaleData) {
  const { eventId, ...saleData } = data;
  const response = await apiFetch(`/events/${eventId}/sales`, {
    method: 'POST',
    body: JSON.stringify(saleData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Falha ao registrar a venda.');
  }

  revalidatePath(`/sales/${eventId}`);
}

export async function refundSaleAction(eventId: string, saleId: string) {
  const response = await apiFetch(`/events/${eventId}/sales/${saleId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Falha ao estornar a venda.');
  }

  revalidatePath(`/sales/${eventId}`);
}