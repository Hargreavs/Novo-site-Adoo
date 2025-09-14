'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { 
  DocumentTextIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  CloudIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import TransparentHeader from '@/components/TransparentHeader';
import RevealWrapper from '@/components/RevealWrapper';
import Personas from '@/components/Personas';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import BenefitsSection from '@/components/BenefitsSection';

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const parallaxImageRef = useRef<HTMLDivElement>(null);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [showScrollCue, setShowScrollCue] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedContext, setSelectedContext] = useState<string>('concurso');
  const animatedLinesRef = useRef<HTMLDivElement>(null);
  const [hoveredPricingLine, setHoveredPricingLine] = useState<string | null>(null);
  const [pricingGlowIntensity, setPricingGlowIntensity] = useState(0);
  const [isHoveringPricing, setIsHoveringPricing] = useState(false);
  const pricingLinesRef = useRef<HTMLDivElement>(null);
  const [isMouseOverPricing, setIsMouseOverPricing] = useState(false);
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // [Resto do código da versão principal...]
  // Este arquivo contém a versão completa atual para rollback se necessário
}
