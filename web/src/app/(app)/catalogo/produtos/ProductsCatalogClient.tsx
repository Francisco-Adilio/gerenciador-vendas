'use client';

import { Alert, Button, Container, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState, useTransition } from 'react';
import { createProductAction, deleteProductAction, updateProductAction, type ActionResult, type ProductInput } from '../../../lib/actions';
import { formatBRL } from '../../../lib/pricing';
import type { Product } from '../../../lib/types';
import { Column, GenericTable, TableAction } from '../../components/GenericTable';
import { ProductForm } from './ProductForm';

type Editing = { mode: 'create' } | { mode: 'edit'; product: Product } | null;

export default function ProductsCatalogClient({ products }: { products: Product[] }) {
  const [editing, setEditing] = useState<Editing>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<ActionResult<unknown>>, onDone: () => void) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error);
      onDone();
    });
  };

  const handleSubmit = (data: ProductInput) => {
    if (!editing) return;
    run(
      () => (editing.mode === 'create' ? createProductAction(data) : updateProductAction(editing.product.id, data)),
      () => setEditing(null),
    );
  };

  const columns: Column<Product>[] = [
    { key: 'name', header: 'Nome' },
    { key: 'value', header: 'Preço', render: (p) => formatBRL(p.value) },
    { key: 'actions', header: '' },
  ];

  const actions: TableAction<Product>[] = [
    { label: 'Editar', icon: <IconEdit size={14} />, onClick: (product) => setEditing({ mode: 'edit', product }) },
    { label: 'Excluir', icon: <IconTrash size={14} />, color: 'red', onClick: setToDelete },
  ];

  return (
    <Container size="md" py="lg" px="sm">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Produtos</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setEditing({ mode: 'create' })}>Novo produto</Button>
      </Group>

      {error && <Alert color="red" mb="sm" withCloseButton onClose={() => setError(null)}>{error}</Alert>}

      <GenericTable<Product> data={products} columns={columns} actions={actions} rowKey="id" />

      <Modal opened={!!editing} onClose={() => setEditing(null)} title={editing?.mode === 'edit' ? 'Editar produto' : 'Novo produto'} centered>
        {editing && (
          <ProductForm
            initialValues={editing.mode === 'edit' ? editing.product : undefined}
            pending={pending}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <Modal opened={!!toDelete} onClose={() => setToDelete(null)} title="Excluir produto" centered>
        {toDelete && (
          <Stack>
            <Text>Excluir <b>{toDelete.name}</b> do catálogo?</Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setToDelete(null)}>Cancelar</Button>
              <Button color="red" loading={pending} onClick={() => run(() => deleteProductAction(toDelete.id), () => setToDelete(null))}>
                Excluir
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
