// Shapes returned by the API. All money values are in reais.

export interface Event {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  value: number;
}

export type PromotionType = 'FIXED' | 'PERCENTAGE' | 'COMBO';

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  /** FIXED: reais off per unit. PERCENTAGE: whole percent (20 = 20%). */
  discountValue: number | null;
  /** COMBO: price in reais for a bundle of `minQuantity` units. */
  totalValue: number | null;
  minQuantity: number;
}

export interface PromotionWithProduct extends Promotion {
  product: Product;
}

export interface EventProduct extends Product {
  promotions: Promotion[];
}

export type PaymentMethod = 'PIX' | 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD';

export const PAYMENT_METHODS: PaymentMethod[] = ['PIX', 'CASH', 'CREDIT_CARD', 'DEBIT_CARD'];

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  PIX: 'Pix',
  CASH: 'Dinheiro',
  CREDIT_CARD: 'Crédito',
  DEBIT_CARD: 'Débito',
};

export const PAYMENT_COLORS: Record<PaymentMethod, string> = {
  PIX: 'teal',
  CASH: 'green',
  CREDIT_CARD: 'indigo',
  DEBIT_CARD: 'blue',
};

export interface SaleItem {
  id: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  product: Product;
  promotion: Promotion | null;
}

export interface Sale {
  id: string;
  createdAt: string;
  paymentMethod: PaymentMethod;
  totalValue: number;
  items: SaleItem[];
}

export interface SalesResponse {
  sales: Sale[];
  totalValue: number;
  totalQuantity: number;
}
