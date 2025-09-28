import { CouponRule } from '@/types/billing';

export const COUPONS: CouponRule[] = [
  { id:'c_save20', code:'SAVE20', percentOff:20, appliesToCycle:['annual'] },
  { id:'c_basic10', code:'BASIC10', amountOff:10_00, appliesToPlans:['basic'] },
  { id:'c_pre50', code:'PREMIUM50', percentOff:50, appliesToPlans:['premium'], firstChargeOnly:true },
  { id:'c_free1m', code:'FREE1M', freeTrialDays:30, appliesToCycle:['monthly'] },
];

export function findCoupon(code: string) {
  return COUPONS.find(c => c.code.toLowerCase() === code.trim().toLowerCase());
}
