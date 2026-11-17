'use client';

import { Alert, Button, Group, NumberInput, SegmentedControl, Select, Stack, Text, TextInput } from '@mantine/core';
import { FormEvent, useState } from 'react';
import type { PromotionInput } from '../../../lib/actions';
import { formatBRL, lineTotal, PROMOTION_TYPE_LABELS } from '../../../lib/pricing';
import type { Product, PromotionType } from '../../../lib/types';

interface Props {
  products: Product[];
  initialValues?: PromotionInput;
  pending?: boolean;
  onSubmit: (data: PromotionInput) => void;
  onCancel: () => void;
}

const moneyProps = { prefix: 'R$ ', decimalSeparator: ',', thousandSeparator: '.', decimalScale: 2, fixedDecimalScale: true } as const;

export function PromotionForm({ products, initialValues, pending, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [productId, setProductId] = useState<string | null>(initialValues?.productId ?? null);
  const [type, setType] = useState<PromotionType>(initialValues?.type ?? 'COMBO');
  const [discountValue, setDiscountValue] = useState<number | string>(initialValues?.discountValue ?? '');
  const [totalValue, setTotalValue] = useState<number | string>(initialValues?.totalValue ?? '');
  const [minQuantity, setMinQuantity] = useState<number | string>(initialValues?.minQuantity ?? (type === 'COMBO' ? 2 : 1));

  const product = products.find((p) => p.id === productId);
  const min = Number(minQuantity) || 1;
  const valid =
    !!name.trim() && !!productId &&
    (type === 'COMBO' ? Number(totalValue) > 0 && min >= 2 : Number(discountValue) > 0 && (type !== 'PERCENTAGE' || Number(discountValue) <= 100));

  // Live preview of what the customer pays for the minimum quantity
  const preview = product && valid
    ? lineTotal(product.value, min, {
        id: '', name, type, minQuantity: min,
        discountValue: type === 'COMBO' ? null : Number(discountValue),
        totalValue: type === 'COMBO' ? Number(totalValue) : null,
      })
    : null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid || !productId) return;
    onSubmit({
      name: name.trim(),
      productId,
      type,
      discountValue: type === 'COMBO' ? null : Number(discountValue),
      totalValue: type === 'COMBO' ? Number(totalValue) : null,
      minQuantity: min,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <Select
          label="Produto"
          placeholder="Escolha o produto"
          required
          searchable
          data={products.map((p) => ({ value: p.id, label: `${p.name} · ${formatBRL(p.value)}` }))}
          value={productId}
          onChange={setProductId}
        />
        <TextInput label="Nome" placeholder="Ex: Pague 2 leve 3" required value={name} onChange={(e) => setName(e.currentTarget.value)} />

        <div>
          <Text size="sm" fw={500} mb={4}>Tipo</Text>
          <SegmentedControl
            fullWidth
            value={type}
            onChange={(v) => {
              setType(v as PromotionType);
              if (v === 'COMBO' && min < 2) setMinQuantity(2);
            }}
            data={(Object.keys(PROMOTION_TYPE_LABELS) as PromotionType[]).map((t) => ({ value: t, label: PROMOTION_TYPE_LABELS[t] }))}
          />
        </div>

        {type === 'COMBO' && (
          <Group grow align="flex-start">
            <NumberInput label="Quantidade do combo" min={2} allowDecimal={false} required value={minQuantity} onChange={setMinQuantity} />
            <NumberInput label="Preço do combo" {...moneyProps} min={0.01} required value={totalValue} onChange={setTotalValue} />
          </Group>
        )}
        {type === 'FIXED' && (
          <Group grow align="flex-start">
            <NumberInput label="Desconto por unidade" {...moneyProps} min={0.01} required value={discountValue} onChange={setDiscountValue} />
            <NumberInput label="Quantidade mínima" min={1} allowDecimal={false} value={minQuantity} onChange={setMinQuantity} />
          </Group>
        )}
        {type === 'PERCENTAGE' && (
          <Group grow align="flex-start">
            <NumberInput label="Desconto" suffix="%" min={1} max={100} allowDecimal={false} required value={discountValue} onChange={setDiscountValue} />
            <NumberInput label="Quantidade mínima" min={1} allowDecimal={false} value={minQuantity} onChange={setMinQuantity} />
          </Group>
        )}

        {preview != null && product && (
          <Alert color="grape" variant="light">
            {min}× {product.name}: <s>{formatBRL(product.value * min)}</s> → <b>{formatBRL(preview)}</b>
          </Alert>
        )}

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" loading={pending} disabled={!valid}>Salvar</Button>
        </Group>
      </Stack>
    </form>
  );
}
