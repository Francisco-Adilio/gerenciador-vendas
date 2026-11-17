import { PromotionType } from '../../generated/prisma/enums.js';

/** Reais (API) -> cents (DB). */
export function toCents(reais: number): number {
  return Math.round(reais * 100);
}

/** Cents (DB) -> reais (API). */
export function fromCents(cents: number): number {
  return cents / 100;
}

type PricedPromotion = {
  type: PromotionType;
  discountValue: number | null;
  totalValue: number | null;
  minQuantity: number;
};

/** Converts a promotion's money fields between API (reais) and DB (cents). PERCENTAGE stays a whole percent. */
function convertPromotionMoney<T extends Partial<PricedPromotion>>(promotion: T, convert: (v: number) => number): T {
  const discountValue =
    promotion.discountValue == null || promotion.type === PromotionType.PERCENTAGE
      ? promotion.discountValue
      : convert(promotion.discountValue);
  const totalValue = promotion.totalValue == null ? promotion.totalValue : convert(promotion.totalValue);
  return { ...promotion, discountValue, totalValue };
}

export const promotionToCents = <T extends Partial<PricedPromotion>>(p: T) => convertPromotionMoney(p, toCents);
export const promotionFromCents = <T extends Partial<PricedPromotion>>(p: T) => convertPromotionMoney(p, fromCents);

/** Total in cents for `quantity` units at `unitValue` cents, applying the promotion if any. Integer math only. */
export function calculateItemTotal(unitValue: number, quantity: number, promotion: PricedPromotion | null): number {
  const base = unitValue * quantity;
  if (!promotion) return base;

  switch (promotion.type) {
    case PromotionType.FIXED:
      return quantity * Math.max(unitValue - (promotion.discountValue ?? 0), 0);

    case PromotionType.PERCENTAGE: {
      const percent = Math.min(Math.max(promotion.discountValue ?? 0, 0), 100);
      return Math.round((base * (100 - percent)) / 100);
    }

    case PromotionType.COMBO: {
      if (promotion.totalValue == null || promotion.minQuantity < 1) return base;
      const bundles = Math.floor(quantity / promotion.minQuantity);
      const rest = quantity % promotion.minQuantity;
      return bundles * promotion.totalValue + rest * unitValue;
    }

    default:
      return base;
  }
}
