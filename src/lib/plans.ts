import { Plan } from '@/types/billing';

export const PLANS: Record<Plan['id'], Plan> = {
  free:    { id:'free',    label:'Gratuito', priceMonthly: 0,       priceAnnualTotal: 0 },
  basic:   { id:'basic',   label:'Básico',   priceMonthly: 29_90,   priceAnnualTotal: 287_04 },
  premium: { id:'premium', label:'Premium',  priceMonthly: 39_90,   priceAnnualTotal: 383_04 },
};
