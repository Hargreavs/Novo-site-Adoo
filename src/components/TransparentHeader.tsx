'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EciooLogo from '@/components/EciooLogo';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface TransparentHeaderProps {
  currentPage?: string;
}

export default function TransparentHeader({ currentPage = '' }: TransparentHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar menu mobile ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => {
    if (path === '/' && currentPage === '') return true;
    return currentPage === path;
  };

  return (
    <header 
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-md bg-white/5 border-b border-white/10' 
          : 'backdrop-blur-none bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">ecioo</span>
            <EciooLogo className="h-8 w-24" />
          </Link>
        </div>
        <div className="flex lg:hidden mobile-menu-container">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-300 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">
              {isMobileMenuOpen ? 'Fechar menu principal' : 'Abrir menu principal'}
            </span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <Link 
            href="/" 
            className={`text-base font-semibold leading-6 transition-colors duration-200 ${
              isActive('') 
                ? 'text-blue-400' 
                : 'text-white hover:text-blue-400'
            }`}
          >
            Apresentação
          </Link>
          <Link 
            href="/diarios-oficiais" 
            className={`text-base font-semibold leading-6 transition-colors duration-200 ${
              isActive('diarios-oficiais') 
                ? 'text-blue-400' 
                : 'text-white hover:text-blue-400'
            }`}
          >
            Diários Oficiais
          </Link>
          <Link 
            href="/radar-ia" 
            className={`text-base font-semibold leading-6 transition-colors duration-200 ${
              isActive('radar-ia') 
                ? 'text-blue-400' 
                : 'text-white hover:text-blue-400'
            }`}
          >
            Radar IA
          </Link>
          <Link 
            href="/api" 
            className={`text-base font-semibold leading-6 transition-colors duration-200 ${
              isActive('api') 
                ? 'text-blue-400' 
                : 'text-white hover:text-blue-400'
            }`}
          >
            API
          </Link>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <a href="#" className="cta-secondary text-base font-semibold leading-6 text-white hover:text-blue-400">
            Entrar <span aria-hidden="true">→</span>
          </a>
        </div>
      </nav>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="lg:hidden mobile-menu-container"
        >
          <div className="px-6 pb-6 pt-2 space-y-1 bg-black/80 backdrop-blur-md border-b border-white/10">
            <Link 
              href="/" 
              className={`block px-3 py-2 text-base font-semibold rounded-md transition-colors duration-200 ${
                isActive('') 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-white hover:text-blue-400 hover:bg-white/5'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Apresentação
            </Link>
            <Link 
              href="/diarios-oficiais" 
              className={`block px-3 py-2 text-base font-semibold rounded-md transition-colors duration-200 ${
                isActive('diarios-oficiais') 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-white hover:text-blue-400 hover:bg-white/5'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Diários Oficiais
            </Link>
            <Link 
              href="/radar-ia" 
              className={`block px-3 py-2 text-base font-semibold rounded-md transition-colors duration-200 ${
                isActive('radar-ia') 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-white hover:text-blue-400 hover:bg-white/5'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Radar IA
            </Link>
            <Link 
              href="/api" 
              className={`block px-3 py-2 text-base font-semibold rounded-md transition-colors duration-200 ${
                isActive('api') 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-white hover:text-blue-400 hover:bg-white/5'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              API
            </Link>
            <div className="pt-4 border-t border-white/10">
              <a 
                href="#" 
                className="block px-3 py-2 text-base font-semibold text-white hover:text-blue-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Entrar <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
