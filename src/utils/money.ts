export const toCents = (v: number) => Math.round(v * 100);                // 383.04 → 38304
export const fromCents = (c: number) => c / 100;                          // 38304 → 383.04
export const formatBRL = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(cents / 100);
