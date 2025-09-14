import { ReactNode } from 'react';

export type Benefit = {
  id: string;
  label: string;       // rótulo do mini-card
  icon: ReactNode;     // ícone do mini-card
  title: string;       // título do card principal
  description: string; // parágrafo curto
  bullets: string[];   // 3 bullets
  media: ReactNode;    // JSX com mock de UI (direita do card principal)
  gradient: { from: string; via?: string; to: string }; // cores do gradiente interno
};

export type GradientLayerProps = {
  from: string;
  via?: string;
  to: string;
  variant?: 'radial' | 'linear';
};
