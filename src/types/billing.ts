export type BillingCycle = 'monthly' | 'annual';

export interface Plan {
  id: 'free' | 'basic' | 'premium';
  label: string;
  priceMonthly: number; // preço/mês quando ciclo = monthly
  priceAnnualTotal: number; // total/ano (usado no anual)
}

export interface CouponRule {
  id: string;
  code: string;
  percentOff?: number;   // ex.: 20 = 20%
  amountOff?: number;    // valor fixo em centavos
  freeTrialDays?: number;
  appliesToPlans?: Plan['id'][];
  appliesToCycle?: BillingCycle[];      // ['annual'] por ex.
  firstChargeOnly?: boolean;            // desconto só na 1ª cobrança
  expiresAt?: string;                   // ISO
  maxRedemptions?: number;
}


export interface CouponValidationRequest {
  planId: Plan['id'];
  cycle: BillingCycle;
  code: string;
}

export interface PriceBreakdown {
  originalTotal: number;     // em centavos
  discountTotal: number;     // em centavos
  finalTotal: number;        // em centavos
  note?: string;             // ex.: "first year only"
}

export interface CouponValidationResponse {
  valid: boolean;
  message?: string;
  coupon?: Coupon;
  breakdown?: PriceBreakdown;
}
