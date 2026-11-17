import { useCallback, useMemo, useState } from 'react';
import { lineTotal } from '../../../../lib/pricing';
import type { EventProduct, Promotion } from '../../../../lib/types';

export interface CartLine {
  key: string;
  product: EventProduct;
  promotion: Promotion | null;
  quantity: number;
}

const lineKey = (productId: string, promotionId: string | null) => `${productId}:${promotionId ?? ''}`;
const minFor = (promotion: Promotion | null) => promotion?.minQuantity ?? 1;
/** COMBO lines grow by a whole bundle; everything else by one unit. */
const stepFor = (promotion: Promotion | null) => (promotion?.type === 'COMBO' ? promotion.minQuantity : 1);

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  /** Adds a product (optionally with a promotion). New lines start at the promotion's minimum quantity. */
  const add = useCallback((product: EventProduct, promotion: Promotion | null = null) => {
    setLines((current) => {
      const key = lineKey(product.id, promotion?.id ?? null);
      const existing = current.find((l) => l.key === key);
      if (existing) {
        return current.map((l) => (l.key === key ? { ...l, quantity: l.quantity + stepFor(promotion) } : l));
      }
      return [...current, { key, product, promotion, quantity: minFor(promotion) }];
    });
  }, []);

  const increment = useCallback((key: string) => {
    setLines((current) => current.map((l) => (l.key === key ? { ...l, quantity: l.quantity + stepFor(l.promotion) } : l)));
  }, []);

  /** Decrements; removes the line when it would drop below the promotion's minimum. */
  const decrement = useCallback((key: string) => {
    setLines((current) =>
      current.flatMap((l) => {
        if (l.key !== key) return [l];
        const next = l.quantity - stepFor(l.promotion);
        return next < minFor(l.promotion) ? [] : [{ ...l, quantity: next }];
      }),
    );
  }, []);

  const remove = useCallback((key: string) => setLines((current) => current.filter((l) => l.key !== key)), []);

  /** Switches a line's promotion, merging into an existing line with the same product+promotion. */
  const changePromotion = useCallback((key: string, promotion: Promotion | null) => {
    setLines((current) => {
      const line = current.find((l) => l.key === key);
      if (!line) return current;
      const newKey = lineKey(line.product.id, promotion?.id ?? null);
      if (newKey === key) return current;
      const quantity = Math.max(line.quantity, minFor(promotion));
      const target = current.find((l) => l.key === newKey);
      const rest = current.filter((l) => l.key !== key);
      if (target) return rest.map((l) => (l.key === newKey ? { ...l, quantity: l.quantity + quantity } : l));
      return current.map((l) => (l.key === key ? { ...l, key: newKey, promotion, quantity } : l));
    });
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const totals = useMemo(() => {
    let total = 0;
    let items = 0;
    const quantityByProduct: Record<string, number> = {};
    for (const l of lines) {
      total += lineTotal(l.product.value, l.quantity, l.promotion);
      items += l.quantity;
      quantityByProduct[l.product.id] = (quantityByProduct[l.product.id] ?? 0) + l.quantity;
    }
    return { total: Math.round(total * 100) / 100, items, quantityByProduct };
  }, [lines]);

  return { lines, setLines, add, increment, decrement, remove, changePromotion, clear, ...totals };
}
