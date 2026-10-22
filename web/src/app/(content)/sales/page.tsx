import EventsClient, { Event } from './EventsClient';
import { apiFetch } from '../../lib/api';

async function getEvents(): Promise<Event[]> {
  const response = await apiFetch('/events');
  if (!response.ok) throw new Error('Erro ao carregar eventos.');
  return response.json();
}

export default async function SalesPage() {
  const events = await getEvents();
  return <EventsClient initialEvents={events} />;
}