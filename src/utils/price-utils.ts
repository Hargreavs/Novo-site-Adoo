export type Coupon = {
  code: string;
  type: 'percent' | 'fixed';        // percent = % | fixed = R$
  value: number;                    // ex: 20 (%), ou 50 (reais)
  applies: 'first' | 'all';         // só primeira cobrança ou todas
};

export const toCents = (n: number) => Math.round(n * 100);
export const fromCents = (c: number) => c / 100;
export const formatBRLFromCents = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

export function computeTotals(options: {
  baseCents: number;               // preço do ciclo em centavos (ex: anual)
  cycleMonths: number;             // 12 para anual, 1 para mensal
  coupon?: Coupon | null;
}) {
  const { baseCents, cycleMonths, coupon } = options;
  const discountCents = coupon
    ? coupon.type === 'percent'
      ? Math.floor(baseCents * (coupon.value / 100))
      : toCents(coupon.value)
    : 0;
  const totalCents = Math.max(0, baseCents - discountCents);
  const monthlyCents = Math.floor(totalCents / cycleMonths);
  return { discountCents, totalCents, monthlyCents };
}

// Função para converter strings PT-BR para centavos
export const toCentsFromPtBR = (s: string) => {
  const normalized = s.replace(/\./g, '').replace(',', '.');
  return toCents(Number(normalized || 0));
};

// Função para converter preços dos planos para centavos
export const planPriceToCents = (price: number) => {
  return toCents(price);
};
