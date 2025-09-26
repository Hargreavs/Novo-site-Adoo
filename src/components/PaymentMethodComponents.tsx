'use client';

import { detectBrand, BRAND } from '@/utils/brand';

export function BrandBadge({ brand }: { brand: keyof typeof BRAND }) {
  const b = BRAND[brand] ?? BRAND.unknown;
  
  // Renderizar logo da VISA como imagem PNG
  if (brand === 'visa') {
    return (
      <div className="h-9 w-16 rounded-md bg-white ring-1 ring-white/20
                       grid place-items-center p-1">
        <img 
          src="/images/cards/visa.png" 
          alt="Visa" 
          className="h-6 w-auto object-contain"
        />
      </div>
    );
  }
  
  // Renderizar logo da Mastercard como imagem PNG
  if (brand === 'mastercard') {
    return (
      <div className="h-9 w-16 rounded-md bg-white ring-1 ring-white/20
                       grid place-items-center p-1">
        <img 
          src="/images/cards/mastercard.png" 
          alt="Mastercard" 
          className="h-6 w-auto object-contain"
        />
      </div>
    );
  }
  
  return (
    <div className={`h-9 w-9 rounded-md bg-gradient-to-br ${b.grad} ring-1 ring-white/20
                     grid place-items-center text-[11px] font-bold text-white`}>
      {b.init}
    </div>
  );
}

export function BadgeDefault() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10
                     text-emerald-300 px-2 py-0.5 text-xs ring-1 ring-emerald-500/20">
      <svg width="14" height="14" viewBox="0 0 24 24" className="fill-current">
        <path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20.3 7.7l-1.4-1.4z"/>
      </svg>
      Padrão
    </span>
  );
}

export function PaymentMethodCard({
  panLast4 = "5555",
  exp = "01/26",
  pan = "5555555555554444", // use o real para detectar a bandeira, NÃO renderize completo
  isDefault = true,
}: { panLast4?: string; exp?: string; pan?: string; isDefault?: boolean }) {
  const brand = detectBrand(pan) as keyof typeof BRAND;
  const label = BRAND[brand].label;

  return (
    <section className="rounded-2xl ring-1 ring-white/10 bg-[#0f1623] p-4 md:p-5">
      <div className="rounded-xl ring-1 ring-white/10 bg-white/[0.02] p-4 md:p-5">
        <div className="md:grid md:grid-cols-12 md:gap-6 md:items-center">
          {/* Esquerda: marca + textos */}
          <div className="col-span-7 flex items-center gap-3 min-w-0">
            <BrandBadge brand={brand} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">
                  {label} <span className="font-mono text-slate-300">•••• {panLast4}</span>
                </h3>
                {isDefault && <BadgeDefault />}
              </div>
              <p className="text-sm text-slate-400">Expira em {exp}</p>
            </div>
          </div>

          {/* Direita: CTAs */}
          <div className="col-span-5 mt-3 md:mt-0">
            <div className="flex flex-wrap justify-start md:justify-end gap-2">
              <button className="px-3 py-2 rounded-md ring-1 ring-white/15 text-slate-200 hover:bg-white/5">
                Editar método de pagamento
              </button>
              <button className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium">
                Adicionar novo cartão
              </button>
              <button className="px-3 py-2 rounded-md ring-1 ring-red-400/30 text-red-300 hover:bg-red-500/10">
                Remover
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
