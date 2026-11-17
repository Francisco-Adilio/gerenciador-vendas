'use client';

import { Badge, Container, Paper, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core';
import { formatBRL } from '../../../../lib/pricing';
import { PAYMENT_COLORS, PAYMENT_LABELS, PAYMENT_METHODS, type SalesResponse } from '../../../../lib/types';

const round = (n: number) => Math.round(n * 100) / 100;

export default function SummaryClient({ sales, totalValue, totalQuantity }: SalesResponse) {

  const byProduct = new Map<string, { name: string; quantity: number; revenue: number }>();
  const byPayment = new Map(PAYMENT_METHODS.map((m) => [m, { count: 0, revenue: 0 }]));

  for (const sale of sales) {
    const payment = byPayment.get(sale.paymentMethod)!;
    payment.count += 1;
    payment.revenue += sale.totalValue;
    for (const item of sale.items) {
      const row = byProduct.get(item.product.id) ?? { name: item.product.name, quantity: 0, revenue: 0 };
      row.quantity += item.quantity;
      row.revenue += item.totalValue;
      byProduct.set(item.product.id, row);
    }
  }
  const productRows = [...byProduct.values()].sort((a, b) => b.revenue - a.revenue);

  const stats = [
    { label: 'Faturamento', value: formatBRL(totalValue) },
    { label: 'Vendas', value: String(sales.length) },
    { label: 'Itens vendidos', value: String(totalQuantity) },
    { label: 'Ticket médio', value: formatBRL(sales.length ? round(totalValue / sales.length) : 0) },
  ];

  return (
    <Container size="md" py="md" px="sm">
      <Stack gap="lg">
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          {stats.map((s) => (
            <Paper key={s.label} withBorder radius="md" p="sm">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>{s.label}</Text>
              <Text size="xl" fw={800}>{s.value}</Text>
            </Paper>
          ))}
        </SimpleGrid>

        <div>
          <Title order={4} mb="xs">Por forma de pagamento</Title>
          <Table withTableBorder striped>
            <Table.Thead>
              <Table.Tr><Table.Th>Pagamento</Table.Th><Table.Th ta="right">Vendas</Table.Th><Table.Th ta="right">Total</Table.Th></Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {PAYMENT_METHODS.map((m) => {
                const row = byPayment.get(m)!;
                return (
                  <Table.Tr key={m}>
                    <Table.Td><Badge color={PAYMENT_COLORS[m]} variant="light">{PAYMENT_LABELS[m]}</Badge></Table.Td>
                    <Table.Td ta="right">{row.count}</Table.Td>
                    <Table.Td ta="right" fw={600}>{formatBRL(round(row.revenue))}</Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </div>

        <div>
          <Title order={4} mb="xs">Por produto</Title>
          {productRows.length === 0 ? (
            <Text c="dimmed">Nenhuma venda ainda.</Text>
          ) : (
            <Table withTableBorder striped>
              <Table.Thead>
                <Table.Tr><Table.Th>Produto</Table.Th><Table.Th ta="right">Qtd.</Table.Th><Table.Th ta="right">Total</Table.Th></Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {productRows.map((row) => (
                  <Table.Tr key={row.name}>
                    <Table.Td>{row.name}</Table.Td>
                    <Table.Td ta="right">{row.quantity}</Table.Td>
                    <Table.Td ta="right" fw={600}>{formatBRL(round(row.revenue))}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </div>
      </Stack>
    </Container>
  );
}
