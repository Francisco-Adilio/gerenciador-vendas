'use client';

import { TextInput, NumberInput, Select, Button, Group, Stack, Paper, Title } from '@mantine/core';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PromotionFormData } from '../actions';

interface ProductOption {
  id: string;
  name: string;
}

interface PromotionFormProps {
  title: string;
  products: ProductOption[];
  initialValues?: {
    name: string;
    value: number;
    productId: string;
  };
  onSubmit: (data: PromotionFormData) => void;
}

export function PromotionForm({ title, products, initialValues, onSubmit }: PromotionFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialValues?.name || '');
  const [value, setValue] = useState<number | string>(initialValues?.value || 0);
  const [productId, setProductId] = useState<string | null>(initialValues?.productId || null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return alert('Selecione um produto.');
    
    onSubmit({ 
      name, 
      value: Number(value), 
      productId 
    });
  };

  const selectData = products.map(p => ({ value: p.id, label: p.name }));

  return (
    <Paper withBorder p="xl" radius="md" style={{ maxWidth: 500 }}>
      <Title order={3} mb="lg">{title}</Title>
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Nome da Promoção"
            placeholder="Ex: Black Friday"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Select
            label="Produto Relacionado"
            placeholder="Selecione um produto"
            data={selectData}
            required
            searchable
            value={productId}
            onChange={setProductId}
          />

          <NumberInput
            label="Valor do Desconto (R$ ou %)"
            placeholder="0.00"
            decimalScale={2}
            fixedDecimalScale
            required
            min={0}
            value={value}
            onChange={setValue}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={() => router.push('/promotions')}>
              Cancelar
            </Button>
            <Button type="submit" color="blue">
              Salvar
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}