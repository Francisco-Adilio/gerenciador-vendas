'use client';

import { TextInput, NumberInput, Button, Group, Stack, Paper, Title } from '@mantine/core';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface ProductFormData {
  name: string;
  price: number;
}

interface ProductFormProps {
  title: string;
  initialValues?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
}

export function ProductForm({ title, initialValues, onSubmit }: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialValues?.name || '');
  const [price, setPrice] = useState<number | string>(initialValues?.price || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, price: Number(price) });
  };

  return (
    <Paper withBorder p="xl" radius="md" style={{ maxWidth: 500 }}>
      <Title order={3} mb="lg">{title}</Title>
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Nome do Produto"
            placeholder="Ex: Camiseta Nike"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <NumberInput
            label="Preço (R$)"
            placeholder="0.00"
            decimalScale={2}
            fixedDecimalScale
            required
            min={0}
            value={price}
            onChange={setPrice}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={() => router.push('/products')}>
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