// Server-only: apiFetch reads the session cookie.
import { notFound } from 'next/navigation';
import { apiFetch } from './api';
import type { Event, EventProduct, Product, PromotionWithProduct, SalesResponse } from './types';

async function getJson<T>(endpoint: string, errorMessage: string): Promise<T> {
  const response = await apiFetch(endpoint);
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error(errorMessage);
  return response.json();
}

export const getEvents = () => getJson<Event[]>('/events', 'Erro ao carregar eventos.');
export const getEvent = (id: string) => getJson<Event>(`/events/${id}`, 'Erro ao carregar evento.');
export const getEventProducts = (id: string) =>
  getJson<EventProduct[]>(`/events/${id}/products`, 'Erro ao carregar produtos do evento.');
export const getSales = (eventId: string) =>
  getJson<SalesResponse>(`/events/${eventId}/sales`, 'Erro ao carregar vendas.');

export const getProducts = () => getJson<Product[]>('/products', 'Erro ao carregar produtos.');
export const getProduct = (id: string) => getJson<Product>(`/products/${id}`, 'Produto não encontrado.');
export const getPromotions = () => getJson<PromotionWithProduct[]>('/promotions', 'Erro ao carregar promoções.');
export const getPromotion = (id: string) =>
  getJson<PromotionWithProduct>(`/promotions/${id}`, 'Promoção não encontrada.');
