'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import type { PlanId, BillingCycle } from '@/lib/billing/subscription';
import { formatBRL } from '@/utils/money';

const PLAN_LABEL: Record<PlanId, string> = {
  free: 'gratuito',
  basic: 'básico',
  premium: 'premium',
};

export default function AssinaturasTab() {
  const { sub, loaded } = useSubscription();
  const [cycle, setCycle] = useState<BillingCycle>('annual');

  // inicializa o toggle com o ciclo do usuário
  useEffect(() => {
    if (loaded && sub?.cycle) setCycle(sub.cycle);
  }, [loaded, sub?.cycle]);

  // banner dinâmico
  const banner = useMemo(() => {
    if (!loaded) return { title: 'Carregando…', desc: '' };
    if (!sub || sub.planId === 'free' || sub.status !== 'active') {
      return {
        title: 'Você está atualmente no plano gratuito',
        desc: 'Explore nossos planos e escolha o que melhor se adapta às suas necessidades',
      };
    }
    return {
      title: `Você está atualmente no plano ${PLAN_LABEL[sub.planId]} ${sub.cycle === 'annual' ? 'anual' : 'mensal'}`,
      desc: 'Gerencie sua assinatura ou altere seu plano quando quiser',
    };
  }, [loaded, sub]);

  // helper p/ saber se o card é do plano ativo
  function isActive(planId: PlanId) {
    return sub?.status === 'active' && sub?.planId === planId;
  }

  // Exemplo simples de tabela de preços (substitua pelo seu)
  const pricing = {
    basic: { monthly: 2990, annual: 28704 },    // em centavos
    premium: { monthly: 3990, annual: 38304 },
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-white font-medium">{banner.title}</div>
        <div className="text-gray-400 text-sm mt-1">{banner.desc}</div>
        {sub?.status === 'active' && sub?.nextRenewalISO && (
          <div className="text-xs text-gray-400 mt-2">
            Próxima renovação: {new Date(sub.nextRenewalISO).toLocaleDateString('pt-BR')}
          </div>
        )}
      </div>

      {/* Toggle Mensal/Anual */}
      <div className="flex items-center gap-4">
        <button
          className={`px-3 py-1 rounded-lg cursor-pointer ${cycle === 'monthly' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
          onClick={() => setCycle('monthly')}
        >
          Mensal
        </button>
        <button
          className={`px-3 py-1 rounded-lg cursor-pointer ${cycle === 'annual' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
          onClick={() => setCycle('annual')}
        >
          Anual
        </button>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* FREE */}
        <PlanCard
          title="Gratuito"
          priceLabel="R$ 0,00"
          features={['Buscar termos ilimitado', 'Download ilimitado de diários oficiais', '1 alerta', '1 contexto no Radar IA']}
          ctaLabel={(!sub || sub.planId !== 'free') ? 'Mudar para gratuito' : 'Seu plano'}
          ctaDisabled={isActive('free')}
          badge={isActive('free') ? 'Seu plano' : undefined}
          onClick={() => {/* ação p/ migrar p/ free */}}
        />

        {/* BASIC */}
        <PlanCard
          title="Básico"
          priceLabel={`${formatBRL(pricing.basic[cycle])}/mês`}
          subLabel={cycle === 'annual' ? `Cobrado anualmente: ${formatBRL(pricing.basic.annual)} hoje` : undefined}
          features={['Buscar termos ilimitado', 'Download ilimitado', '10 alertas', '1 contexto no Radar IA']}
          badge={isActive('basic') ? `Seu plano • ${sub?.cycle === 'annual' ? 'Anual' : 'Mensal'}` : undefined}
          ctaLabel={isActive('basic') && sub?.cycle === cycle ? 'Seu plano' : 'Assinar plano'}
          ctaDisabled={isActive('basic') && sub?.cycle === cycle}
          onClick={() => {/* abrir fluxo de upgrade/downgrade */}}
        />

        {/* PREMIUM */}
        <PlanCard
          title="Premium"
          priceLabel={`${formatBRL(pricing.premium[cycle])}/mês`}
          subLabel={cycle === 'annual' ? `Cobrado anualmente: ${formatBRL(pricing.premium.annual)} hoje` : undefined}
          features={['Buscar termos ilimitado', 'Download ilimitado', 'Até 20 alertas', '3 contextos no Radar IA', 'Suporte prioritário']}
          badge={isActive('premium') ? `Seu plano • ${sub?.cycle === 'annual' ? 'Anual' : 'Mensal'}` : undefined}
          ctaLabel={isActive('premium') && sub?.cycle === cycle ? 'Seu plano' : 'Assinar plano'}
          ctaDisabled={isActive('premium') && sub?.cycle === cycle}
          onClick={() => {/* abrir fluxo de upgrade */}}
        />
      </div>
    </div>
  );
}

/* --- Card "dumb" e reutilizável --- */
function PlanCard({
  title,
  priceLabel,
  subLabel,
  features,
  badge,
  ctaLabel,
  ctaDisabled,
  onClick,
}: {
  title: string;
  priceLabel: string;
  subLabel?: string;
  features: string[];
  badge?: string;
  ctaLabel: string;
  ctaDisabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">{title}</h3>
        {badge && (
          <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-3 text-2xl font-bold text-white">{priceLabel}</div>
      {subLabel && <div className="text-xs text-gray-400 mt-1">{subLabel}</div>}

      <ul className="mt-4 space-y-2 text-sm text-gray-300">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2">
            <span>✔</span>{f}
          </li>
        ))}
      </ul>

      <button
        disabled={ctaDisabled}
        onClick={onClick}
        className={`mt-5 rounded-xl px-4 py-2 text-sm cursor-pointer ${
          ctaDisabled
            ? 'bg-white/10 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-500'
        }`}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
