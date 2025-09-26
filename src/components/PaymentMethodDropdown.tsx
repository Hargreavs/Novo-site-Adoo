'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { PaymentMethod } from '@/types/payment';
import { BrandBadge } from '@/components/PaymentMethodComponents';
import { BRAND } from '@/utils/brand';

interface PaymentMethodDropdownProps {
  cards: PaymentMethod[];
  currentId: string | null;
  defaultId: string | null;
  onSelectCard: (id: string) => void;
  onAddNewCard: () => void;
}

// Hook p/ pegar o retângulo do cabeçalho (anchor)
function useAnchorRect(ref: React.RefObject<HTMLElement>) {
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  React.useLayoutEffect(() => {
    const upd = () => ref.current && setRect(ref.current.getBoundingClientRect());
    upd();
    window.addEventListener("resize", upd);
    window.addEventListener("scroll", upd, true);
    return () => { window.removeEventListener("resize", upd); window.removeEventListener("scroll", upd, true); };
  }, [ref]);
  return rect;
}

function brandLabel(brand: string) {
  return BRAND[brand as keyof typeof BRAND]?.label || 'Cartão';
}

export default function PaymentMethodDropdown({ cards, currentId, defaultId, onSelectCard, onAddNewCard }: PaymentMethodDropdownProps) {
  const current = cards.find(c => c.id === currentId);
  const others = cards.filter(c => c.id !== currentId);

  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const rect = useAnchorRect(buttonRef);
  const [open, setOpen] = React.useState(false);

  // fechar em click fora / ESC
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => { 
      if (!open) return;
      // Verificar se o clique foi dentro do dropdown (incluindo o portal)
      const dropdownPanel = document.querySelector('[role="listbox"]');
      if (!buttonRef.current?.contains(e.target as Node) && 
          !dropdownPanel?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  if (!current) return null;

  return (
    <div className="relative">
      {/* Cabeçalho (cartão padrão) */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2
                   ring-1 ring-white/15 bg-white/[0.02] cursor-pointer"
        aria-haspopup="listbox" 
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <BrandBadge brand={current.brand} />
          <div className="text-left">
            <div className="font-medium text-white">
              {brandLabel(current.brand)} <span className="font-mono text-slate-300">•••• {current.last4}</span>
              {currentId === defaultId && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300 ring-1 ring-emerald-500/20">✓ Padrão</span>
              )}
            </div>
            <div className="text-sm text-slate-400">Expira em {current.expiry}</div>
          </div>
        </div>
        <svg className={`h-5 w-5 text-slate-400 transition ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.4a.75.75 0 01-1.08 0l-4.25-4.4a.75.75 0 01.02-1.06z"/></svg>
      </button>

      {/* Painel via Portal (fixed) — sempre abre para baixo */}
      {open && rect && createPortal(
        <div
          role="listbox"
          className="fixed z-[1000] rounded-xl ring-1 ring-white/10 bg-[#0f1623] shadow-xl p-2
                     animate-[fadeIn_.18s_ease-out] overflow-auto"
          style={{
            left: rect.left,                 // alinha à esquerda do cabeçalho
            top: rect.bottom + 8,            // SEMPRE abre para baixo, posição fixa
            width: rect.width,               // mesma largura do cabeçalho
            maxHeight: Math.min(288, window.innerHeight - (rect.bottom + 16)) // corta se precisar
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {others.length > 0 ? (
            others.map((c) => {
              const isSelected = c.id === currentId;
              return (
                <button
                  key={c.id}
                  role="option"
                  onClick={(e) => { 
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('=== DEBUG CLIQUE NO CARTÃO DROPDOWN ===');
                    console.log('ID do cartão clicado:', c.id);
                    console.log('onSelectCard function:', onSelectCard);
                    onSelectCard(c.id); 
                    setOpen(false); 
                    buttonRef.current?.focus(); 
                  }}
                  className={`w-full h-10 px-3 text-sm rounded-md flex items-center justify-between
                             hover:bg-white/6 active:bg-white/8 transition-colors cursor-pointer
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40
                             ${isSelected ? 'ring-1 ring-blue-500/40' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <BrandBadge brand={c.brand} />
                    <div className="text-left">
                      <div className="font-medium text-white">
                        {brandLabel(c.brand)} <span className="font-mono text-slate-300">•••• {c.last4}</span>
                        {c.id === defaultId && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300 ring-1 ring-emerald-500/20">
                            ✓ Padrão
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">Expira em {c.expiry}</div>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            /* Célula quando não há outros cartões disponíveis */
            <div className="w-full h-10 px-3 text-sm rounded-md flex items-center justify-center text-slate-400 bg-white/5 border border-white/10">
              Não há nenhum outro cartão disponível
            </div>
          )}

          <div className="my-2 h-px bg-white/10" />
          <button
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation();
              console.log('=== DEBUG CLIQUE ADICIONAR CARTÃO DROPDOWN ===');
              console.log('onAddNewCard function:', onAddNewCard);
              setOpen(false); 
              onAddNewCard(); 
            }}
            className="w-full h-10 px-3 text-sm rounded-md ring-1 ring-white/15 text-slate-200 hover:bg-white/5 cursor-pointer"
          >
            Adicionar novo cartão
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}