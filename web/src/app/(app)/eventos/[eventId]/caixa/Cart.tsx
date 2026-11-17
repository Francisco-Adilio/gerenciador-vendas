'use client';

import { ActionIcon, Button, Chip, Divider, Group, ScrollArea, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconMinus, IconPlus, IconTrash } from '@tabler/icons-react';
import { formatBRL, lineTotal, promotionLabel } from '../../../../lib/pricing';
import { PAYMENT_COLORS, PAYMENT_LABELS, PAYMENT_METHODS, type PaymentMethod, type Promotion } from '../../../../lib/types';
import type { CartLine } from './useCart';

interface Props {
  lines: CartLine[];
  total: number;
  pending: boolean;
  onIncrement: (key: string) => void;
  onDecrement: (key: string) => void;
  onChangePromotion: (key: string, promotion: Promotion | null) => void;
  onClear: () => void;
  onPay: (method: PaymentMethod) => void;
  /** Max height for the scrollable list of lines. */
  listMaxHeight?: string;
}

export function Cart({ lines, total, pending, onIncrement, onDecrement, onChangePromotion, onClear, onPay, listMaxHeight }: Props) {
  const empty = lines.length === 0;

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Text fw={700} size="lg">Venda atual</Text>
        {!empty && (
          <Button variant="subtle" color="gray" size="compact-sm" leftSection={<IconTrash size={14} />} onClick={onClear} disabled={pending}>
            Limpar
          </Button>
        )}
      </Group>

      {empty ? (
        <Text c="dimmed" size="sm" ta="center" py="lg">Toque em um produto para adicionar.</Text>
      ) : (
        <ScrollArea.Autosize mah={listMaxHeight ?? '45vh'} type="auto" offsetScrollbars>
          <Stack gap="xs">
            {lines.map((line) => {
              const value = lineTotal(line.product.value, line.quantity, line.promotion);
              const fullValue = line.product.value * line.quantity;
              return (
                <Stack key={line.key} gap={6} p="xs" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 8 }}>
                  <Group justify="space-between" wrap="nowrap" gap="xs">
                    <Text fw={600} truncate style={{ flex: 1 }}>{line.product.name}</Text>
                    <Stack gap={0} align="flex-end">
                      <Text fw={700}>{formatBRL(value)}</Text>
                      {value < fullValue && <Text size="xs" c="dimmed" td="line-through">{formatBRL(fullValue)}</Text>}
                    </Stack>
                  </Group>

                  <Group justify="space-between" wrap="nowrap" gap="xs">
                    <Group gap={6} wrap="nowrap">
                      <ActionIcon size="lg" variant="light" color="gray" onClick={() => onDecrement(line.key)} disabled={pending} aria-label="Diminuir">
                        <IconMinus size={18} />
                      </ActionIcon>
                      <Text fw={700} w={32} ta="center">{line.quantity}</Text>
                      <ActionIcon size="lg" variant="light" color="orange" onClick={() => onIncrement(line.key)} disabled={pending} aria-label="Aumentar">
                        <IconPlus size={18} />
                      </ActionIcon>
                    </Group>
                    <Text size="xs" c="dimmed">{formatBRL(line.product.value)} un.</Text>
                  </Group>

                  {line.product.promotions.length > 0 && (
                    <Chip.Group
                      multiple={false}
                      value={line.promotion?.id ?? ''}
                      onChange={(id) => onChangePromotion(line.key, line.product.promotions.find((p) => p.id === id) ?? null)}
                    >
                      <Group gap={4}>
                        <Chip value="" size="xs" color="gray" disabled={pending}>Sem promoção</Chip>
                        {line.product.promotions.map((promo) => (
                          <Chip key={promo.id} value={promo.id} size="xs" color="grape" disabled={pending}>
                            {promotionLabel(promo)}
                          </Chip>
                        ))}
                      </Group>
                    </Chip.Group>
                  )}
                </Stack>
              );
            })}
          </Stack>
        </ScrollArea.Autosize>
      )}

      <Divider />
      <Group justify="space-between">
        <Text size="lg" fw={600}>Total</Text>
        <Text size="xl" fw={800} c="orange.8">{formatBRL(total)}</Text>
      </Group>

      {/* One tap = choose payment method and finalize */}
      <SimpleGrid cols={2} spacing="xs">
        {PAYMENT_METHODS.map((method) => (
          <Button
            key={method}
            size="lg"
            h={56}
            color={PAYMENT_COLORS[method]}
            disabled={empty || pending}
            onClick={() => onPay(method)}
          >
            {PAYMENT_LABELS[method]}
          </Button>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
