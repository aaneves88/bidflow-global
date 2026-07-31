export type DiscountType = 'fixed' | 'percent';

/** Discount value applied over a subtotal, never larger than the subtotal itself. */
export function discountValue(
  subtotal: number,
  amount: number | string | null | undefined,
  type: DiscountType | string | null | undefined,
): number {
  const sub = Number(subtotal) || 0;
  const raw = Number(amount) || 0;
  if (raw <= 0 || sub <= 0) return 0;
  const value = type === 'percent' ? (sub * Math.min(raw, 100)) / 100 : raw;
  return Math.min(Math.max(value, 0), sub);
}

/** Subtotal minus discount, floored at 0. */
export function applyDiscount(
  subtotal: number,
  amount: number | string | null | undefined,
  type: DiscountType | string | null | undefined,
): number {
  const sub = Number(subtotal) || 0;
  return Math.max(sub - discountValue(sub, amount, type), 0);
}
