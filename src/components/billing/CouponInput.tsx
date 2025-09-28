'use client';
import { useState } from 'react';
import { CouponValidationResponse } from '@/types/billing';
import { Coupon } from '@/pricing/coupon';
import { formatBRL } from '@/utils/money';

// 👇 formatador que sempre recebe centavos (sem depender do @/utils/money aqui)
const formatBRLCents = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// (Opcional, mas recomendado) Prova automática em DEV
if (process.env.NODE_ENV !== 'production') {
  // Estes dois devem logar: R$ 383,04 e R$ 191,52
  console.log('probe format (cents):', formatBRLCents(38304), formatBRLCents(19152));
}

type Props = {
  planId: 'free'|'basic'|'premium';
  cycle: 'monthly'|'annual';
  onApplied: (payload: CouponValidationResponse) => void;
  onRemoved?: () => void;
  className?: string;
};

/** Converte valor possivelmente em reais para CENTAVOS sempre */
function toCents(x: number): number {
  if (!Number.isFinite(x) || x <= 0) return 0;
  // Heurística mais específica: valores < 100 provavelmente estão em reais (ex.: 383.04 -> 38304)
  // Valores >= 100 provavelmente já estão em centavos
  return x < 100 ? Math.round(x * 100) : Math.round(x);
}

/** Calcula desconto em centavos a partir do cupom */
function discountFromCoupon(originalCents: number, coupon: Coupon): number {
  if (originalCents <= 0) return 0;
  if (coupon.kind === 'percent') {
    return Math.min(originalCents, Math.max(0, Math.round(originalCents * (coupon.value / 100))));
  }
  // kind: 'fixed_cents' — valor do cupom DEVE estar em centavos
  return Math.min(originalCents, Math.max(0, Math.round(coupon.value)));
}

export default function CouponInput({ planId, cycle, onApplied, onRemoved, className }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState<CouponValidationResponse | null>(null);
  const [error, setError] = useState('');

  async function apply() {
    setLoading(true); setError('');
    const r = await fetch('/api/billing/apply-coupon', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ planId, cycle, code }),
    });
    const data = await r.json() as CouponValidationResponse;
    setLoading(false);

    if (!data.valid) {
      setApplied(null);
      setError(data.message || 'Cupom inválido.');
      return;
    }

    // ⚙️ NORMALIZAÇÃO: assegura centavos em tudo
    const originalCents = toCents(data.breakdown!.originalTotal);
    let discountCents  = toCents(data.breakdown!.discountTotal);
    const coupon = data.coupon as Coupon;

    // Se veio "inflado" ou maior que o original, corrige
    if (discountCents > originalCents) {
      // 1) Tenta dividir por 100 se parecer x100
      if (Math.round(discountCents / 100) <= originalCents) {
        discountCents = Math.round(discountCents / 100);
      } else {
        // 2) Recalcula pelo cupom
        discountCents = discountFromCoupon(originalCents, coupon);
      }
    }

    // Clamp final
    discountCents = Math.min(discountCents, originalCents);

    // Repassa um payload "limpo" para o resto da UI
    const normalized: CouponValidationResponse = {
      ...data,
      breakdown: {
        ...data.breakdown!,
        originalTotal: originalCents,
        discountTotal: discountCents,
        finalTotal: Math.max(0, originalCents - discountCents),
      }
    };

    setApplied(normalized);
    onApplied(normalized);
  }

  function remove() {
    setApplied(null);
    setCode('');
    setError('');
    onRemoved?.();
  }

  if (applied?.valid) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2">
          <div className="text-sm text-emerald-200">
            <span className="font-semibold">Cupom {applied.coupon!.code} aplicado com sucesso!</span>
          </div>
          <button onClick={remove} className="text-xs text-emerald-300 hover:text-white cursor-pointer">Remover</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${className || ''}`}>
      <div className="relative flex-1">
        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Código promocional"
          className={`w-full rounded-lg bg-white/5 px-3 py-2 pr-8 text-sm placeholder-gray-400 focus:ring-2 focus:border-transparent ${
            error 
              ? 'border border-red-500 focus:ring-red-500' 
              : 'border border-white/10 focus:ring-blue-500'
          }`}
        />
        {/* Ícone de limpar - aparece quando há texto */}
        {code && (
          <button
            onClick={() => {
              setCode('');
              setError('');
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
            type="button"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </div>
      <button
        disabled={!code || loading}
        onClick={apply}
        className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Aplicando…' : 'Aplicar'}
      </button>
      {error && <div className="text-xs text-red-300 self-center">{error}</div>}
    </div>
  );
}