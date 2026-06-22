'use client';

import { Container, Group, Title, Button } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { GenericTable, Column, TableAction } from '../components/GenericTable';

interface Product {
  id: string;
  name: string;
  price: number;
}

export default function ProductsPage() {
  const router = useRouter();

  // Mock de dados
  const products: Product[] = [
    { id: 'p1', name: 'Notebook Dell', price: 4500.00 },
    { id: 'p2', name: 'Mouse Sem Fio', price: 150.00 },
  ];

  const columns: Column<Product>[] = [
    { key: 'name', header: 'Nome' },
    { 
      key: 'price', 
      header: 'Preço', 
      render: (p) => `R$ ${p.price.toFixed(2)}` 
    },
    { key: 'actions', header: 'Ações' },
  ];

  const actions: TableAction<Product>[] = [
    {
      label: 'Editar',
      icon: <IconEdit size={14} />,
      onClick: (p) => router.push(`/products/${p.id}/edit`),
    },
    {
      label: 'Excluir',
      icon: <IconTrash size={14} />,
      color: 'red',
      onClick: (p) => alert(`Excluir: ${p.name}`),
    },
  ];

  return (
    <Container size="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Produtos</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => router.push('/products/create')}>
          Novo Produto
        </Button>
      </Group>
      <GenericTable data={products} columns={columns} actions={actions} rowKey="id" />
    </Container>
  );
}