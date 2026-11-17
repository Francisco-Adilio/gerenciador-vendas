'use client';

import { ActionIcon, Alert, Anchor, Badge, Button, Card, Container, Divider, Group, NumberInput, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { FormEvent, useState, useTransition } from 'react';
import { createAndLinkProductAction, linkProductAction, unlinkProductAction, type ActionResult } from '../../../../lib/actions';
import { formatBRL, promotionLabel } from '../../../../lib/pricing';
import type { EventProduct, Product } from '../../../../lib/types';

interface Props {
  eventId: string;
  linked: EventProduct[];
  catalog: Product[];
}

export default function EventProductsClient({ eventId, linked, catalog }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [value, setValue] = useState<number | string>('');

  const linkedIds = new Set(linked.map((p) => p.id));
  const available = catalog.filter((p) => !linkedIds.has(p.id));

  const run = (action: () => Promise<ActionResult<unknown>>, onSuccess?: () => void) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error);
      else onSuccess?.();
    });
  };

  const handleQuickCreate = (e: FormEvent) => {
    e.preventDefault();
    run(() => createAndLinkProductAction(eventId, { name: name.trim(), value: Number(value) }), () => {
      setName('');
      setValue('');
    });
  };

  return (
    <Container size="sm" py="md" px="sm">
      <Stack gap="lg">
        {error && <Alert color="red" withCloseButton onClose={() => setError(null)}>{error}</Alert>}

        <div>
          <Title order={4} mb="xs">Produtos deste evento ({linked.length})</Title>
          {linked.length === 0 ? (
            <Text c="dimmed" size="sm">Nenhum produto ainda. Adicione do catálogo ou crie um novo abaixo.</Text>
          ) : (
            <Stack gap="xs">
              {linked.map((product) => (
                <Card key={product.id} withBorder radius="md" padding="sm">
                  <Group justify="space-between" wrap="nowrap">
                    <div style={{ minWidth: 0 }}>
                      <Text fw={600} truncate>{product.name}</Text>
                      <Text size="sm" c="orange.8" fw={600}>{formatBRL(product.value)}</Text>
                    </div>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="lg"
                      disabled={pending}
                      onClick={() => run(() => unlinkProductAction(eventId, product.id))}
                      aria-label={`Remover ${product.name} do evento`}
                    >
                      <IconX size={18} />
                    </ActionIcon>
                  </Group>
                  {product.promotions.length > 0 && (
                    <Group gap={4} mt={6}>
                      {product.promotions.map((promo) => (
                        <Badge key={promo.id} variant="light" color="grape" tt="none">{promo.name}: {promotionLabel(promo)}</Badge>
                      ))}
                    </Group>
                  )}
                </Card>
              ))}
            </Stack>
          )}
          <Anchor component={Link} href="/catalogo/promocoes" size="sm" mt="xs" display="inline-block">
            Gerenciar promoções no catálogo
          </Anchor>
        </div>

        <Divider />

        <div>
          <Title order={4} mb="xs">Adicionar do catálogo</Title>
          <Group align="flex-end" wrap="nowrap">
            <Select
              style={{ flex: 1 }}
              placeholder={available.length ? 'Escolha um produto' : 'Todos os produtos já estão no evento'}
              data={available.map((p) => ({ value: p.id, label: `${p.name} · ${formatBRL(p.value)}` }))}
              value={selected}
              onChange={setSelected}
              searchable
              disabled={!available.length}
            />
            <Button
              leftSection={<IconPlus size={16} />}
              disabled={!selected}
              loading={pending}
              onClick={() => selected && run(() => linkProductAction(eventId, selected), () => setSelected(null))}
            >
              Adicionar
            </Button>
          </Group>
        </div>

        <div>
          <Title order={4} mb="xs">Criar novo produto</Title>
          <form onSubmit={handleQuickCreate}>
            <Group align="flex-end" wrap="nowrap">
              <TextInput style={{ flex: 2 }} label="Nome" placeholder="Ex: Pastel" required value={name} onChange={(e) => setName(e.currentTarget.value)} />
              <NumberInput
                style={{ flex: 1 }}
                label="Preço"
                prefix="R$ "
                decimalSeparator=","
                thousandSeparator="."
                decimalScale={2}
                fixedDecimalScale
                min={0.01}
                required
                value={value}
                onChange={setValue}
              />
            </Group>
            <Button type="submit" mt="sm" fullWidth loading={pending} disabled={!name.trim() || !Number(value)}>
              Criar e adicionar ao evento
            </Button>
          </form>
        </div>
      </Stack>
    </Container>
  );
}
