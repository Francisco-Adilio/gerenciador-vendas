'use client';

import { Alert, Badge, Button, Card, Container, Group, Modal, SegmentedControl, Stack, Text } from '@mantine/core';
import { IconArrowBackUp } from '@tabler/icons-react';
import { useMemo, useState, useTransition } from 'react';
import { deleteSaleAction } from '../../../../lib/actions';
import { formatBRL } from '../../../../lib/pricing';
import { PAYMENT_COLORS, PAYMENT_LABELS, PAYMENT_METHODS, type PaymentMethod, type Sale } from '../../../../lib/types';

const timeFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export default function SalesClient({ eventId, sales }: { eventId: string; sales: Sale[] }) {
  const [filter, setFilter] = useState<'ALL' | PaymentMethod>('ALL');
  const [toRefund, setToRefund] = useState<Sale | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const visible = useMemo(() => (filter === 'ALL' ? sales : sales.filter((s) => s.paymentMethod === filter)), [sales, filter]);
  const visibleTotal = useMemo(() => Math.round(visible.reduce((sum, s) => sum + s.totalValue, 0) * 100) / 100, [visible]);

  const confirmRefund = () => {
    if (!toRefund) return;
    startTransition(async () => {
      const result = await deleteSaleAction(eventId, toRefund.id);
      if (!result.ok) setError(result.error);
      setToRefund(null);
    });
  };

  return (
    <Container size="md" py="md" px="sm">
      <SegmentedControl
        fullWidth
        mb="sm"
        value={filter}
        onChange={(v) => setFilter(v as typeof filter)}
        data={[{ value: 'ALL', label: 'Todas' }, ...PAYMENT_METHODS.map((m) => ({ value: m, label: PAYMENT_LABELS[m] }))]}
      />

      <Group justify="space-between" mb="sm">
        <Text c="dimmed" size="sm">{visible.length} {visible.length === 1 ? 'venda' : 'vendas'}</Text>
        <Text fw={700}>{formatBRL(visibleTotal)}</Text>
      </Group>

      {error && <Alert color="red" mb="sm" withCloseButton onClose={() => setError(null)}>{error}</Alert>}

      {visible.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">Nenhuma venda registrada.</Text>
      ) : (
        <Stack gap="xs">
          {visible.map((sale) => (
            <Card key={sale.id} withBorder radius="md" padding="sm">
              <Group justify="space-between" mb={6} wrap="nowrap">
                <Group gap="xs">
                  <Text size="sm" c="dimmed">{timeFormat.format(new Date(sale.createdAt))}</Text>
                  <Badge color={PAYMENT_COLORS[sale.paymentMethod]} variant="light">{PAYMENT_LABELS[sale.paymentMethod]}</Badge>
                </Group>
                <Text fw={700}>{formatBRL(sale.totalValue)}</Text>
              </Group>
              <Stack gap={2}>
                {sale.items.map((item) => (
                  <Group key={item.id} justify="space-between" wrap="nowrap">
                    <Text size="sm">
                      {item.quantity}× {item.product.name}
                      {item.promotion && <Text span size="xs" c="grape"> · {item.promotion.name}</Text>}
                    </Text>
                    <Text size="sm" c="dimmed">{formatBRL(item.totalValue)}</Text>
                  </Group>
                ))}
              </Stack>
              <Group justify="flex-end" mt={6}>
                <Button size="compact-sm" variant="subtle" color="red" leftSection={<IconArrowBackUp size={14} />} onClick={() => setToRefund(sale)}>
                  Estornar
                </Button>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <Modal opened={!!toRefund} onClose={() => setToRefund(null)} title="Estornar venda" centered>
        {toRefund && (
          <Stack>
            <Text>
              Estornar a venda de <b>{formatBRL(toRefund.totalValue)}</b> ({PAYMENT_LABELS[toRefund.paymentMethod]})? Ela será removida do evento.
            </Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setToRefund(null)}>Cancelar</Button>
              <Button color="red" loading={pending} onClick={confirmRefund}>Estornar</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
