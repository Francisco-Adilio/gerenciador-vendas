import { ReactNode } from 'react';
import { getEvent } from '../../../lib/data';
import { EventNav } from './EventNav';

interface Props {
  children: ReactNode;
  params: Promise<{ eventId: string }>;
}

export default async function EventLayout({ children, params }: Props) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  return (
    <EventNav eventId={event.id} eventName={event.name}>
      {children}
    </EventNav>
  );
}
