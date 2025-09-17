'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EciooLogo from '@/components/EciooLogo';
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface TransparentHeaderProps {
  currentPage?: string;
  onTrialClick?: () => void;
}

export default function TransparentHeader({ currentPage = '', onTrialClick }: TransparentHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('tudo');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [dropdownWidth, setDropdownWidth] = useState(0);
  const [mobileDropdownWidth, setMobileDropdownWidth] = useState(0);
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const mobileDropdownRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Medir largura do dropdown para ajustar padding do input
  useEffect(() => {
    if (dropdownRef.current) {
      const width = dropdownRef.current.offsetWidth;
      setDropdownWidth(width);
    }
    if (mobileDropdownRef.current) {
      const width = mobileDropdownRef.current.offsetWidth;
      setMobileDropdownWidth(width);
    }
  }, [searchType, showDropdown]);

  // Carregar busca salva do localStorage
  useEffect(() => {
    const savedSearch = localStorage.getItem('globalSearch');
    const savedType = localStorage.getItem('searchType');
    if (savedSearch) setSearchTerm(savedSearch);
    if (savedType) setSearchType(savedType);
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

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showDropdown && !target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  // Cleanup do timer
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);


  const isActive = (path: string) => {
    if (path === '/' && currentPage === '') return true;
    return currentPage === path;
  };

  const handleTrialClick = () => {
    console.log('Header trial button clicked');
    if (onTrialClick) {
      onTrialClick();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Salvar busca no localStorage
    localStorage.setItem('globalSearch', searchTerm);
    localStorage.setItem('searchType', searchType);

    // Navegar para página de resultados com parâmetros
    const params = new URLSearchParams({
      q: searchTerm,
      type: searchType
    });
    
    router.push(`/resultados?${params.toString()}`);
  };

  // Funções auxiliares para dropdown customizado
  const filterOptions = [
    { value: 'tudo', label: 'Tudo' },
    { value: 'diarios-oficiais', label: 'Diários Oficiais' },
    { value: 'processos', label: 'Processos' }
  ];

  const getSelectedFilterLabel = () => {
    const option = filterOptions.find(opt => opt.value === searchType);
    return option ? option.label : 'Tudo';
  };

  const handleFilterSelect = (value: string) => {
    setSearchType(value);
    setShowDropdown(false);
  };

  // Sugestões mockadas para autocomplete
  const mockSuggestions = [
    'concurso público',
    'concurso TRT',
    'concurso federal',
    'concurso estadual',
    'concurso municipal',
    'licitação pública',
    'licitação federal',
    'licitação estadual',
    'licitação municipal',
    'edital de concurso',
    'edital de licitação',
    'processo administrativo',
    'processo judicial',
    'STF',
    'STJ',
    'TST',
    'TRT',
    'Prefeitura de São Paulo',
    'Governo Federal',
    'Assembleia Legislativa'
  ];

  // Função para filtrar sugestões com debounce
  const filterSuggestions = (term: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      if (term.length >= 2) {
        const filtered = mockSuggestions
          .filter(suggestion => 
            suggestion.toLowerCase().includes(term.toLowerCase())
          )
          .slice(0, 6);
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 150);

    setDebounceTimer(timer);
  };

  // Função para lidar com mudança no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1);
    filterSuggestions(value);
  };

  // Função para lidar com foco no input
  const handleInputFocus = () => {
    if (searchTerm.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Função para fechar sugestões
  const closeSuggestions = () => {
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Função para limpar input
  const clearInput = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Função para selecionar sugestão
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Função para navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        closeSuggestions();
        break;
    }
  };

  return (
    <header 
      className={`fixed inset-x-0 top-0 z-50 ${
        isScrolled 
          ? 'backdrop-blur-md bg-white/5 border-b border-white/10' 
          : 'backdrop-blur-none bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Global">
        {/* NÍVEL 1: Logo + Busca + Botões de Auth */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex lg:flex-1 lg:max-w-[200px]">
            <Link href="/" className="-m-1 p-1">
              <span className="sr-only">ecioo</span>
              <EciooLogo className="h-8 w-24" />
            </Link>
          </div>
          
            {/* Barra de busca global - Desktop */}
            <div className="hidden lg:flex lg:flex-1 lg:justify-center lg:max-w-xl">
            <div className="relative w-full">
              <form onSubmit={handleSearch} className="relative w-full">
                {/* Dropdown de filtro customizado */}
                <div className="absolute left-0 top-0 z-10 dropdown-container">
                  <button
                    ref={dropdownRef}
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="h-10 px-3 pr-6 bg-white/10 border border-white/20 rounded-l-full focus:outline-none focus:ring-1 focus:ring-blue-400/60 focus:border-blue-400/40 text-white text-sm font-medium cursor-pointer backdrop-blur-sm hover:bg-white/15 flex items-center whitespace-nowrap"
                    style={{ minWidth: 'fit-content' }}
                  >
                    {getSelectedFilterLabel()}
                    <svg className="w-3 h-3 ml-1.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Menu dropdown customizado */}
                  {showDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-gray-900/95 backdrop-blur-sm border border-white/30 rounded-lg shadow-2xl z-50 min-w-[150px]">
                      {filterOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleFilterSelect(option.value)}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                            searchType === option.value
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Campo de busca expandido */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    onBlur={() => setTimeout(closeSuggestions, 200)}
                    placeholder="Digite nome, CPF, processo ou termo..."
                    className="w-full h-10 pr-16 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400/60 focus:border-blue-400/40 focus:shadow-lg focus:shadow-blue-400/20 text-sm backdrop-blur-sm"
                    style={{ paddingLeft: `${Math.max(112, dropdownWidth + 8)}px` }}
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={showSuggestions}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                  />
                  
                  {/* Botão de Limpar */}
                  {searchTerm && (
                    <button 
                      onClick={clearInput}
                      className="absolute top-1/2 right-12 transform -translate-y-1/2 w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full group flex items-center justify-center"
                      type="button"
                      aria-label="Limpar busca"
                    >
                      <svg className="h-3 w-3 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Botão de busca - estilo hero section */}
                  <button 
                    type="submit"
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full group flex items-center justify-center"
                    aria-label="Buscar"
                  >
                    <svg className="h-3 w-3 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
                
                {/* Menu Suspenso de Sugestões */}
                {showSuggestions && suggestions.length > 0 && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-2 bg-gray-900/90 backdrop-blur-sm border border-white/30 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto"
                    role="listbox"
                    aria-label="Sugestões de busca"
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 first:rounded-t-2xl last:rounded-b-2xl ${
                          index === selectedIndex
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Botões de autenticação */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:space-x-3 lg:max-w-[300px]">
            <button
              onClick={handleTrialClick}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Criar conta
            </button>
            <a href="#" className="cta-secondary text-sm font-medium leading-5 text-white hover:text-blue-400">
              Entrar <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* Menu mobile */}
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
        </div>

        {/* NÍVEL 2: Links de Navegação */}
        <div className="hidden lg:flex lg:justify-center lg:py-2">
          <div className="flex gap-x-8">
            <Link 
              href="/" 
              className={`text-sm font-medium leading-5 transition-colors duration-200 ${
                isActive('') 
                  ? 'text-blue-400' 
                  : 'text-white hover:text-blue-400'
              }`}
            >
              Para você
            </Link>
            <Link 
              href="/diarios-oficiais" 
              className={`text-sm font-medium leading-5 transition-colors duration-200 ${
                isActive('diarios-oficiais') 
                  ? 'text-blue-400' 
                  : 'text-white hover:text-blue-400'
              }`}
            >
              Diários Oficiais
            </Link>
            <Link 
              href="/radar-ia" 
              className={`text-sm font-medium leading-5 transition-colors duration-200 ${
                isActive('radar-ia') 
                  ? 'text-blue-400' 
                  : 'text-white hover:text-blue-400'
              }`}
            >
              Radar IA
            </Link>
            <Link 
              href="/resultados" 
              className={`text-sm font-medium leading-5 transition-colors duration-200 ${
                isActive('resultados') 
                  ? 'text-blue-400' 
                  : 'text-white hover:text-blue-400'
              }`}
            >
              Resultados
            </Link>
            <Link 
              href="/api" 
              className={`text-sm font-medium leading-5 transition-colors duration-200 ${
                isActive('api') 
                  ? 'text-blue-400' 
                  : 'text-white hover:text-blue-400'
              }`}
            >
              API
            </Link>
          </div>
        </div>
      </nav>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="lg:hidden mobile-menu-container"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6 pt-2 space-y-4 bg-black/80 backdrop-blur-md border-b border-white/10">
            {/* NÍVEL 1 MOBILE: Barra de busca */}
            <div className="relative w-full">
              <form onSubmit={handleSearch} className="relative w-full">
                {/* Dropdown de filtro customizado mobile */}
                <div className="absolute left-0 top-0 z-10 dropdown-container">
                    <button
                      ref={mobileDropdownRef}
                      type="button"
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="h-10 px-2 pr-5 bg-white/10 border border-white/20 rounded-l-full focus:outline-none focus:ring-1 focus:ring-blue-400/60 focus:border-blue-400/40 text-white text-xs font-medium cursor-pointer backdrop-blur-sm hover:bg-white/15 flex items-center whitespace-nowrap"
                      style={{ minWidth: 'fit-content' }}
                    >
                      {getSelectedFilterLabel()}
                      <svg className="w-2.5 h-2.5 ml-1 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                  {/* Menu dropdown customizado mobile */}
                  {showDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-gray-900/95 backdrop-blur-sm border border-white/30 rounded-lg shadow-2xl z-50 min-w-[130px]">
                      {filterOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleFilterSelect(option.value)}
                          className={`w-full text-left px-3 py-2.5 text-xs transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                            searchType === option.value
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Campo de busca expandido mobile */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    onBlur={() => setTimeout(closeSuggestions, 200)}
                    placeholder="Digite nome, CPF, processo ou termo..."
                    className="w-full h-10 pr-12 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400/60 focus:border-blue-400/40 focus:shadow-lg focus:shadow-blue-400/20 text-xs backdrop-blur-sm"
                    style={{ paddingLeft: `${Math.max(80, mobileDropdownWidth + 6)}px` }}
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={showSuggestions}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                  />
                  
                  {/* Botão de Limpar mobile */}
                  {searchTerm && (
                    <button 
                      onClick={clearInput}
                      className="absolute top-1/2 right-10 transform -translate-y-1/2 w-5 h-5 bg-white/10 hover:bg-white/20 rounded-full group flex items-center justify-center"
                      type="button"
                      aria-label="Limpar busca"
                    >
                      <svg className="h-2.5 w-2.5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Botão de busca mobile - estilo hero section */}
                  <button 
                    type="submit"
                    className="absolute top-1/2 right-1.5 transform -translate-y-1/2 w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full group flex items-center justify-center"
                    aria-label="Buscar"
                  >
                    <svg className="h-2.5 w-2.5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
                
                {/* Menu Suspenso de Sugestões mobile */}
                {showSuggestions && suggestions.length > 0 && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-2 bg-gray-900/90 backdrop-blur-sm border border-white/30 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto"
                    role="listbox"
                    aria-label="Sugestões de busca"
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full text-left px-3 py-2.5 text-xs transition-colors duration-200 first:rounded-t-2xl last:rounded-b-2xl ${
                          index === selectedIndex
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* NÍVEL 2 MOBILE: Links de navegação */}
            <Link 
              href="/" 
              className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive('') 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-white hover:text-blue-400 hover:bg-white/5'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Para você
            </Link>
            <Link 
              href="/diarios-oficiais" 
              className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
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
              className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive('radar-ia') 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-white hover:text-blue-400 hover:bg-white/5'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Radar IA
            </Link>
            <Link 
              href="/resultados" 
              className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive('resultados') 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-white hover:text-blue-400 hover:bg-white/5'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Resultados
            </Link>
            <Link 
              href="/api" 
              className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive('api') 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-white hover:text-blue-400 hover:bg-white/5'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              API
            </Link>
            {/* Botões de autenticação mobile */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <a 
                href="#" 
                className="block px-3 py-2 text-sm font-medium text-white hover:text-blue-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Entrar <span aria-hidden="true">→</span>
              </a>
              <button
                onClick={() => {
                  handleTrialClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                Criar conta
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
