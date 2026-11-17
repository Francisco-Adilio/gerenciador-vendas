'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from './api';
import type { Event, PaymentMethod, PromotionType, Sale } from './types';

/** Server actions return results instead of throwing, so error messages reach the client in production. */
export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

async function send<T = null>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body: unknown,
  fallbackError: string,
): Promise<ActionResult<T>> {
  try {
    const response = await apiFetch(endpoint, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    const json = text ? JSON.parse(text) : null;
    if (!response.ok) return { ok: false, error: json?.error || json?.message || fallbackError };
    return { ok: true, data: json as T };
  } catch (e) {
    // redirect() from apiFetch (401) must propagate
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    return { ok: false, error: 'Não foi possível conectar ao servidor.' };
  }
}

const eventPath = (eventId: string) => `/eventos/${eventId}`;

// ---------- Events ----------

export async function createEventAction(name: string) {
  const result = await send<Event>('/events', 'POST', { name }, 'Falha ao criar o evento.');
  if (result.ok) revalidatePath('/eventos');
  return result;
}

// ---------- Sales ----------

export interface CartItemInput {
  productId: string;
  promotionId: string | null;
  quantity: number;
}

export async function createSaleAction(eventId: string, paymentMethod: PaymentMethod, items: CartItemInput[]) {
  // No revalidate here: keeps the checkout screen from refetching after every sale.
  // Vendas/Resumo are dynamic pages and fetch fresh data when opened.
  return send<Sale>(`/events/${eventId}/sales`, 'POST', { paymentMethod, items }, 'Falha ao registrar a venda.');
}

export async function deleteSaleAction(eventId: string, saleId: string) {
  const result = await send(`/events/${eventId}/sales/${saleId}`, 'DELETE', undefined, 'Falha ao estornar a venda.');
  if (result.ok) revalidatePath(eventPath(eventId), 'layout');
  return result;
}

// ---------- Event products ----------

export async function linkProductAction(eventId: string, productId: string) {
  const result = await send(`/events/${eventId}/products`, 'POST', { productId }, 'Falha ao adicionar o produto.');
  if (result.ok) revalidatePath(eventPath(eventId), 'layout');
  return result;
}

export async function unlinkProductAction(eventId: string, productId: string) {
  const result = await send(`/events/${eventId}/products/${productId}`, 'DELETE', undefined, 'Falha ao remover o produto.');
  if (result.ok) revalidatePath(eventPath(eventId), 'layout');
  return result;
}

/** Quick-create from the event: creates the product in the catalog and links it to the event. */
export async function createAndLinkProductAction(eventId: string, data: ProductInput) {
  const created = await createProductAction(data);
  if (!created.ok) return created;
  return linkProductAction(eventId, created.data.id);
}

// ---------- Catalog: products ----------

export interface ProductInput {
  name: string;
  value: number;
}

export async function createProductAction(data: ProductInput) {
  const result = await send<{ id: string }>('/products', 'POST', data, 'Falha ao criar o produto.');
  if (result.ok) revalidatePath('/', 'layout');
  return result;
}

export async function updateProductAction(id: string, data: ProductInput) {
  const result = await send(`/products/${id}`, 'PUT', data, 'Falha ao atualizar o produto.');
  if (result.ok) revalidatePath('/', 'layout');
  return result;
}

export async function deleteProductAction(id: string) {
  const result = await send(`/products/${id}`, 'DELETE', undefined, 'Falha ao excluir o produto (ele pode ter vendas ou promoções).');
  if (result.ok) revalidatePath('/', 'layout');
  return result;
}

// ---------- Catalog: promotions ----------

export interface PromotionInput {
  name: string;
  productId: string;
  type: PromotionType;
  discountValue: number | null;
  totalValue: number | null;
  minQuantity: number;
}

export async function createPromotionAction(data: PromotionInput) {
  const result = await send('/promotions', 'POST', data, 'Falha ao criar a promoção.');
  if (result.ok) revalidatePath('/', 'layout');
  return result;
}

export async function updatePromotionAction(id: string, data: PromotionInput) {
  const result = await send(`/promotions/${id}`, 'PUT', data, 'Falha ao atualizar a promoção.');
  if (result.ok) revalidatePath('/', 'layout');
  return result;
}

export async function deletePromotionAction(id: string) {
  const result = await send(`/promotions/${id}`, 'DELETE', undefined, 'Falha ao excluir a promoção (ela pode ter vendas).');
  if (result.ok) revalidatePath('/', 'layout');
  return result;
}
