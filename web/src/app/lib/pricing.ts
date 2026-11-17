import type { Promotion } from './types';

const toCents = (reais: number) => Math.round(reais * 100);

/**
 * Line total in reais. Mirrors `calculateItemTotal` in server/src/lib/money.ts
 * (integer cents internally) so the cart shows exactly what the server will charge.
 */
export function lineTotal(unitValue: number, quantity: number, promotion: Promotion | null): number {
  const unit = toCents(unitValue);
  const base = unit * quantity;
  let cents = base;

  if (promotion) {
    switch (promotion.type) {
      case 'FIXED':
        cents = quantity * Math.max(unit - toCents(promotion.discountValue ?? 0), 0);
        break;
      case 'PERCENTAGE': {
        const percent = Math.min(Math.max(promotion.discountValue ?? 0, 0), 100);
        cents = Math.round((base * (100 - percent)) / 100);
        break;
      }
      case 'COMBO':
        if (promotion.totalValue != null && promotion.minQuantity >= 1) {
          const bundles = Math.floor(quantity / promotion.minQuantity);
          const rest = quantity % promotion.minQuantity;
          cents = bundles * toCents(promotion.totalValue) + rest * unit;
        }
        break;
    }
  }

  return cents / 100;
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatBRL(value: number): string {
  return brl.format(value);
}

/** Short label for a promotion chip, e.g. "3 por R$ 10,00", "-20%", "-R$ 2,00". */
export function promotionLabel(promotion: Promotion): string {
  const min = promotion.minQuantity > 1 ? ` (mín. ${promotion.minQuantity})` : '';
  switch (promotion.type) {
    case 'COMBO':
      return `${promotion.minQuantity} por ${formatBRL(promotion.totalValue ?? 0)}`;
    case 'PERCENTAGE':
      return `-${promotion.discountValue ?? 0}%${min}`;
    case 'FIXED':
      return `-${formatBRL(promotion.discountValue ?? 0)}${min}`;
  }
}

export const PROMOTION_TYPE_LABELS = {
  FIXED: 'Desconto fixo',
  PERCENTAGE: 'Porcentagem',
  COMBO: 'Combo',
} as const;
