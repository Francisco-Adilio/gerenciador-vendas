'use client';

import { Badge, Button, Group, Paper, SimpleGrid, Stack, Text, UnstyledButton } from '@mantine/core';
import { formatBRL, promotionLabel } from '../../../../lib/pricing';
import type { EventProduct, Promotion } from '../../../../lib/types';

interface Props {
  products: EventProduct[];
  quantityByProduct: Record<string, number>;
  onAdd: (product: EventProduct, promotion?: Promotion | null) => void;
}

export function ProductGrid({ products, quantityByProduct, onAdd }: Props) {
  return (
    <SimpleGrid cols={{ base: 2, xs: 3, lg: 4 }} spacing="sm" verticalSpacing="sm">
      {products.map((product) => {
        const inCart = quantityByProduct[product.id] ?? 0;
        return (
          <Paper
            key={product.id}
            withBorder
            radius="md"
            style={{
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              borderColor: inCart ? 'var(--mantine-color-orange-5)' : undefined,
              borderWidth: inCart ? 2 : undefined,
            }}
          >
            {/* Main tap target: +1 without promotion */}
            <UnstyledButton
              onClick={() => onAdd(product)}
              p="sm"
              style={{ flex: 1, minHeight: 92, userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}
              aria-label={`Adicionar ${product.name}`}
            >
              <Stack gap={4} h="100%" justify="space-between">
                <Group justify="space-between" align="flex-start" wrap="nowrap" gap={4}>
                  <Text fw={700} size="md" lh={1.2} lineClamp={2}>{product.name}</Text>
                  {inCart > 0 && <Badge color="orange" size="lg" circle>{inCart}</Badge>}
                </Group>
                <Text size="lg" fw={600} c="orange.8">{formatBRL(product.value)}</Text>
              </Stack>
            </UnstyledButton>

            {/* Promotion chips: add a line with that promotion */}
            {product.promotions.length > 0 && (
              <Stack gap={4} p={6} pt={0}>
                {product.promotions.map((promo) => (
                  <Button
                    key={promo.id}
                    size="compact-sm"
                    variant="light"
                    color="grape"
                    fullWidth
                    onClick={() => onAdd(product, promo)}
                    title={promo.name}
                  >
                    {promotionLabel(promo)}
                  </Button>
                ))}
              </Stack>
            )}
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}
