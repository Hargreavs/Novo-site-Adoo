export type PlanId = 'free' | 'basic' | 'premium';
export type BillingCycle = 'monthly' | 'annual';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled';

export type Subscription = {
  planId: PlanId;
  cycle: BillingCycle;
  status: SubscriptionStatus;     // 'active' ao ativar
  nextRenewalISO?: string;        // '2025-01-15'
  firstChargeAmountCents?: number; // 19152 se usou cupom
  updatedAtISO: string;
};

const STORAGE_KEY = 'cjo.subscription';

/** Salva e notifica o app inteiro */
export function saveSubscription(sub: Subscription) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sub));
  window.dispatchEvent(new Event('subscription:updated'));
}

/** Lê do storage com fallback seguro */
export function readSubscription(): Subscription | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Subscription;
  } catch {
    return null;
  }
}

/** Remove a assinatura do storage */
export function clearSubscription() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('subscription:updated'));
}
