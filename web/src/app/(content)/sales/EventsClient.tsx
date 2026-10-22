'use client';

import { Container, Group, Title } from '@mantine/core';
import { IconCalendarEvent } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { GenericTable, Column, TableAction } from '../components/GenericTable';

export interface Event {
  id: string;
  name: string;
}

interface EventsClientProps {
  initialEvents: Event[];
}

export default function EventsClient({ initialEvents }: EventsClientProps) {
  const router = useRouter();

  const columns: Column<Event>[] = [
    { key: 'name', header: 'Nome do Evento' },
    { key: 'actions', header: 'Ações' }
  ];

  const actions: TableAction<Event>[] = [
    {
      label: 'Abrir evento',
      icon: <IconCalendarEvent size={14} />,
      onClick: (event) => router.push(`/sales/${event.id}`),
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Group mb="lg">
        <Title order={2}>Eventos</Title>
      </Group>
      <GenericTable<Event>
        data={initialEvents}
        columns={columns}
        actions={actions}
        rowKey="id"
      />
    </Container>
  );
}
