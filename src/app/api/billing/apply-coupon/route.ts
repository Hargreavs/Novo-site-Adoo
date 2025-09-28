import { NextResponse } from 'next/server';
import { PLANS } from '@/lib/plans';
import { findCoupon } from '@/lib/coupons';
import { CouponValidationRequest, CouponValidationResponse } from '@/types/billing';
import { Coupon } from '@/pricing/coupon';
import { toCents } from '@/utils/money';

function planTotalInCents(planId: keyof typeof PLANS, cycle: 'monthly'|'annual') {
  const p = PLANS[planId];
  if (!p) return 0;
  return cycle === 'annual'
    ? Math.round(p.priceAnnualTotal * 100) // para centavos
    : Math.round(p.priceMonthly * 100);
}

export async function POST(req: Request) {
  const body = await req.json() as CouponValidationRequest;
  const res: CouponValidationResponse = { valid:false };

  const plan = PLANS[body.planId];
  if (!plan) return NextResponse.json({ valid:false, message:'Plano inválido.' });

  const coupon = findCoupon(body.code);
  if (!coupon) return NextResponse.json({ valid:false, message:'Código inválido.' });

  // Regras
  const now = new Date();
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
    return NextResponse.json({ valid:false, message:'Cupom expirado.' });
  }
  if (coupon.appliesToPlans && !coupon.appliesToPlans.includes(plan.id)) {
    return NextResponse.json({ valid:false, message:'Este cupom não é válido para este plano.' });
  }
  if (coupon.appliesToCycle && !coupon.appliesToCycle.includes(body.cycle)) {
    return NextResponse.json({ valid:false, message:'Cupom não se aplica a este ciclo de cobrança.' });
  }

  const original = planTotalInCents(plan.id, body.cycle);
  
  // Usar o novo sistema de cupons
  const simplifiedCoupon: Coupon = coupon.percentOff 
    ? {
        code: coupon.code,
        kind: 'percent',
        value: coupon.percentOff,
      }
    : {
        code: coupon.code,
        kind: 'fixed_cents',
        // amountOff já está em centavos no mock (10_00 = R$ 10,00)
        value: Math.round(coupon.amountOff || 0),
      };
  
  const { getDiscountCents } = await import('@/pricing/coupon');
  const discount = getDiscountCents(original, simplifiedCoupon);
  const finalTotal = Math.max(0, original - discount);

  return NextResponse.json({
    valid: true,
    coupon: simplifiedCoupon,
    breakdown: {
      originalTotal: original,
      discountTotal: discount,
      finalTotal,
      note: coupon.firstChargeOnly ? 'Desconto aplicado só na primeira cobrança' : undefined,
    }
  } satisfies CouponValidationResponse);
}
