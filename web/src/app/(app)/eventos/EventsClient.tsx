'use client';

import { Alert, Button, Card, Container, Group, Modal, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCalendarEvent, IconChevronRight, IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState, useTransition } from 'react';
import { createEventAction } from '../../lib/actions';
import type { Event } from '../../lib/types';

export default function EventsClient({ events }: { events: Event[] }) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createEventAction(name.trim());
      if (!result.ok) return setError(result.error);
      close();
      setName('');
      router.push(`/eventos/${result.data.id}/produtos`);
    });
  };

  return (
    <Container size="md" py="lg">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Eventos</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>Novo evento</Button>
      </Group>

      {events.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">Nenhum evento ainda. Crie o primeiro para começar a vender.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          {events.map((event) => (
            <Card
              key={event.id}
              component={Link}
              href={`/eventos/${event.id}`}
              withBorder
              radius="md"
              padding="lg"
              style={{ textDecoration: 'none' }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group wrap="nowrap">
                  <IconCalendarEvent size={28} color="var(--mantine-color-orange-7)" />
                  <Text fw={600} size="lg">{event.name}</Text>
                </Group>
                <IconChevronRight size={20} color="var(--mantine-color-gray-5)" />
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal opened={opened} onClose={close} title="Novo evento" centered>
        <form onSubmit={handleCreate}>
          <Stack>
            {error && <Alert color="red">{error}</Alert>}
            <TextInput
              label="Nome do evento"
              placeholder="Ex: Festa Junina 2026"
              required
              data-autofocus
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
            <Button type="submit" loading={pending} disabled={!name.trim()}>Criar e adicionar produtos</Button>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
