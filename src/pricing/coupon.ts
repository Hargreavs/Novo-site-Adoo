export type Coupon = { code: string; kind: 'percent' | 'fixed_cents'; value: number };

export const getDiscountCents = (priceCents: number, coupon: Coupon) => {
  if (coupon.kind === 'percent') {
    return Math.min(priceCents, Math.round(priceCents * (coupon.value / 100)));
  }
  // fixed_cents já vem em centavos
  return Math.min(priceCents, coupon.value);
};

export function applyCoupon(priceCents: number, coupon?: Coupon) {
  if (!coupon) return { discountCents: 0, totalCents: priceCents };
  const discountCents = getDiscountCents(priceCents, coupon);
  const totalCents = Math.max(priceCents - discountCents, 0);
  return { discountCents, totalCents };
}
