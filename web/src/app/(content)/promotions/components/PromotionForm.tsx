'use client';

import { Select, NumberInput, Button, Group, Stack, Paper, Title } from '@mantine/core';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface PromotionFormData {
  productId: string;
  minQty: number;
  discountValue: number;
}

interface PromotionFormProps {
  title: string;
  initialValues?: PromotionFormData;
  onSubmit: (data: PromotionFormData) => void;
}

export function PromotionForm({ title, initialValues, onSubmit }: PromotionFormProps) {
  const router = useRouter();
  const [productId, setProductId] = useState<string | null>(initialValues?.productId || null);
  const [minQty, setMinQty] = useState<number | string>(initialValues?.minQty || 1);
  const [discountValue, setDiscountValue] = useState<number | string>(initialValues?.discountValue || 0);

  // Lista mockada de produtos para o Select dropdown
  const productsMock = [
    { value: 'p1', label: 'Notebook Dell' },
    { value: 'p2', label: 'Mouse Sem Fio' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    onSubmit({ productId, minQty: Number(minQty), discountValue: Number(discountValue) });
  };

  return (
    <Paper withBorder p="xl" radius="md" style={{ maxWidth: 500 }}>
      <Title order={3} mb="lg">{title}</Title>
      <form onSubmit={handleSubmit}>
        <Stack>
          <Select
            label="Selecione o Produto"
            placeholder="Escolha um produto"
            data={productsMock}
            required
            value={productId}
            onChange={setProductId}
          />
          <NumberInput
            label="Quantidade Mínima"
            placeholder="A partir de quantas unidades?"
            required
            min={1}
            value={minQty}
            onChange={setMinQty}
          />
          <NumberInput
            label="Valor do Desconto (R$)"
            placeholder="0.00"
            decimalScale={2}
            fixedDecimalScale
            required
            min={0}
            value={discountValue}
            onChange={setDiscountValue}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={() => router.push('/promotions')}>
              Cancelar
            </Button>
            <Button type="submit" color="blue">
              Salvar Promoção
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}