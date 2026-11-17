'use client';

import { Button, Group, NumberInput, Stack, TextInput } from '@mantine/core';
import { FormEvent, useState } from 'react';
import type { ProductInput } from '../../../lib/actions';

interface ProductFormProps {
  initialValues?: ProductInput;
  pending?: boolean;
  onSubmit: (data: ProductInput) => void;
  onCancel: () => void;
}

export function ProductForm({ initialValues, pending, onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [value, setValue] = useState<number | string>(initialValues?.value ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ name: name.trim(), value: Number(value) });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label="Nome do produto"
          placeholder="Ex: Pastel"
          required
          data-autofocus
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <NumberInput
          label="Preço"
          prefix="R$ "
          decimalSeparator=","
          thousandSeparator="."
          decimalScale={2}
          fixedDecimalScale
          required
          min={0.01}
          value={value}
          onChange={setValue}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" loading={pending} disabled={!name.trim() || !Number(value)}>Salvar</Button>
        </Group>
      </Stack>
    </form>
  );
}
