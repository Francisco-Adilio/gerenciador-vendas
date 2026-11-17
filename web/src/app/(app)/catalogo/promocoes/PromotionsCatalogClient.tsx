'use client';

import { Alert, Badge, Button, Container, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState, useTransition } from 'react';
import {
  createPromotionAction, deletePromotionAction, updatePromotionAction, type ActionResult, type PromotionInput,
} from '../../../lib/actions';
import { promotionLabel, PROMOTION_TYPE_LABELS } from '../../../lib/pricing';
import type { Product, PromotionWithProduct } from '../../../lib/types';
import { Column, GenericTable, TableAction } from '../../components/GenericTable';
import { PromotionForm } from './PromotionForm';

type Editing = { mode: 'create' } | { mode: 'edit'; promotion: PromotionWithProduct } | null;

interface Props {
  promotions: PromotionWithProduct[];
  products: Product[];
}

export default function PromotionsCatalogClient({ promotions, products }: Props) {
  const [editing, setEditing] = useState<Editing>(null);
  const [toDelete, setToDelete] = useState<PromotionWithProduct | null>(null);
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

  const handleSubmit = (data: PromotionInput) => {
    if (!editing) return;
    run(
      () => (editing.mode === 'create' ? createPromotionAction(data) : updatePromotionAction(editing.promotion.id, data)),
      () => setEditing(null),
    );
  };

  const columns: Column<PromotionWithProduct>[] = [
    { key: 'name', header: 'Promoção' },
    { key: 'product', header: 'Produto', render: (p) => p.product.name },
    { key: 'type', header: 'Regra', render: (p) => (
      <Group gap={6} wrap="nowrap">
        <Badge variant="light" color="grape" size="sm">{PROMOTION_TYPE_LABELS[p.type]}</Badge>
        <Text size="sm">{promotionLabel(p)}</Text>
      </Group>
    ) },
    { key: 'actions', header: '' },
  ];

  const actions: TableAction<PromotionWithProduct>[] = [
    { label: 'Editar', icon: <IconEdit size={14} />, onClick: (promotion) => setEditing({ mode: 'edit', promotion }) },
    { label: 'Excluir', icon: <IconTrash size={14} />, color: 'red', onClick: setToDelete },
  ];

  const initialValues = (p: PromotionWithProduct): PromotionInput => ({
    name: p.name,
    productId: p.product.id,
    type: p.type,
    discountValue: p.discountValue,
    totalValue: p.totalValue,
    minQuantity: p.minQuantity,
  });

  return (
    <Container size="md" py="lg" px="sm">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Promoções</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setEditing({ mode: 'create' })} disabled={!products.length}>
          Nova promoção
        </Button>
      </Group>

      {error && <Alert color="red" mb="sm" withCloseButton onClose={() => setError(null)}>{error}</Alert>}

      <GenericTable<PromotionWithProduct> data={promotions} columns={columns} actions={actions} rowKey="id" />

      <Modal opened={!!editing} onClose={() => setEditing(null)} title={editing?.mode === 'edit' ? 'Editar promoção' : 'Nova promoção'} centered>
        {editing && (
          <PromotionForm
            products={products}
            initialValues={editing.mode === 'edit' ? initialValues(editing.promotion) : undefined}
            pending={pending}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <Modal opened={!!toDelete} onClose={() => setToDelete(null)} title="Excluir promoção" centered>
        {toDelete && (
          <Stack>
            <Text>Excluir a promoção <b>{toDelete.name}</b>? Vendas antigas continuam registradas.</Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setToDelete(null)}>Cancelar</Button>
              <Button color="red" loading={pending} onClick={() => run(() => deletePromotionAction(toDelete.id), () => setToDelete(null))}>
                Excluir
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
