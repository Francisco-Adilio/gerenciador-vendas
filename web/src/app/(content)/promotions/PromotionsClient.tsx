'use client';

import { Container, Group, Title, Button } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { GenericTable, Column, TableAction } from '../components/GenericTable';
import { deletePromotionAction } from './actions';
import { Product } from '../products/ProductsClient';

export interface Promotion {
  id: string;
  name: string;
  value: number;
  product: Product;
  minQuantity: number;
}

interface PromotionsClientProps {
  initialPromotions: Promotion[];
}

export default function PromotionsClient({ initialPromotions }: PromotionsClientProps) {
  const router = useRouter();

  const columns: Column<Promotion>[] = [
    { key: 'name', header: 'Promoção' },
    { 
      key: 'product', 
      header: 'Produto', 
      render: (promo) => promo.product.name || 'N/A' 
    },
    { 
      key: 'value', 
      header: 'Desconto', 
      render: (promo) => `R$ ${promo.value.toFixed(2)}` 
    },
    { key: 'actions', header: 'Ações' }
  ];

  const handleDelete = async (promo: Promotion) => {
    if (confirm(`Deseja excluir a promoção: ${promo.name}?`)) {
      try {
        await deletePromotionAction(promo.id);
      } catch (error) {
        console.error(error)
        alert('Erro ao deletar.');
      } 
    }
  };

  const actions: TableAction<Promotion>[] = [
    {
      label: 'Editar',
      icon: <IconEdit size={14} />,
      onClick: (promo) => router.push(`/promotions/${promo.id}/edit`),
    },
    {
      label: 'Excluir',
      icon: <IconTrash size={14} />,
      color: 'red',
      onClick: handleDelete,
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Promoções</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => router.push('/promotions/create')}>
          Nova Promoção
        </Button>
      </Group>
      <GenericTable<Promotion> data={initialPromotions} columns={columns} actions={actions} rowKey="id" />
    </Container>
  );
}