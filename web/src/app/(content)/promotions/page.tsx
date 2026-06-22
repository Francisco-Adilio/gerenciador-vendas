'use client';

import { Container, Group, Title, Button } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { GenericTable, Column, TableAction } from '../components/GenericTable';

interface Promotion {
  id: string;
  product: { id: string; name: string };
  minQty: number;
  discountValue: number;
}

export default function PromotionsPage() {
  const router = useRouter();

  const promotions: Promotion[] = [
    { id: 'prom1', product: { id: 'p1', name: 'Notebook Dell' }, minQty: 3, discountValue: 200.00 },
  ];

  const columns: Column<Promotion>[] = [
    { key: 'product', header: 'Produto', render: (p) => p.product.name },
    { key: 'minQty', header: 'Qtd Mínima' },
    { 
      key: 'discountValue', 
      header: 'Desconto', 
      render: (p) => `R$ ${p.discountValue.toFixed(2)}` 
    },
    { key: 'actions', header: 'Ações' },
  ];

  const actions: TableAction<Promotion>[] = [
    {
      label: 'Editar',
      icon: <IconEdit size={14} />,
      onClick: (p) => router.push(`/promotions/${p.id}/edit`),
    },
    {
      label: 'Excluir',
      icon: <IconTrash size={14} />,
      color: 'red',
      onClick: (p) => alert(`Excluir promoção da linha: ${p.id}`),
    },
  ];

  return (
    <Container size="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Promoções</Title>
        <Button leftSection={<IconPlus size={16} />} color="green" onClick={() => router.push('/promotions/create')}>
          Nova Promoção
        </Button>
      </Group>
      <GenericTable data={promotions} columns={columns} actions={actions} rowKey="id" />
    </Container>
  );
}