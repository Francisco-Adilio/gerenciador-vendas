// app/products/ProductsClient.tsx
'use client';

import { Container, Group, Title, Button } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { GenericTable, Column, TableAction } from '../components/GenericTable';
import { deleteProductAction } from './actions';
import { useState } from 'react';

export interface Product {
  id: string;
  name: string;
  value: number;
}

interface ProductsClientProps {
  initialProducts: Product[];
}

export default function ProductsClient({ initialProducts }: ProductsClientProps) {
  const router = useRouter();

  const columns: Column<Product>[] = [
    { key: 'name', header: 'Nome' },
    { 
      key: 'value', 
      header: 'Preço', 
      render: (p) => `R$ ${p.value}` 
    },
  ];

  const handleDelete = async (product: Product) => {
    if (confirm(`Deseja mesmo excluir o produto: ${product.name}?`)) {
      try {
        await deleteProductAction(product.id);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Erro ao deletar');
      } 
    }
  };

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
      onClick: handleDelete,
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Produtos</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => router.push('/products/create')}>
          Novo Produto
        </Button>
      </Group>
      
      <GenericTable<Product> 
        data={initialProducts} 
        columns={columns} 
        actions={actions} 
        rowKey="id" 
      />
    </Container>
  );
}