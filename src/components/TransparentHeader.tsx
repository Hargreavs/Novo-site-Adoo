'use client';

import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EciooLogo from '@/components/EciooLogo';
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import UserSettingsModal from './UserSettingsModal';

interface TransparentHeaderProps {
  currentPage?: string;
  onTrialClick?: () => void;
}

export default function TransparentHeader({ currentPage = '', onTrialClick }: TransparentHeaderProps) {
  const { isAuthenticated, user, logout, isInitialized } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('tudo');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [dropdownWidth, setDropdownWidth] = useState(80); // Valor padrão mais estável
  const [mobileDropdownWidth, setMobileDropdownWidth] = useState(80); // Valor padrão mais estável
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const mobileDropdownRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Calcular padding do input de forma otimizada
  const desktopInputPadding = useMemo(() => {
    // Usar valor fixo durante hidratação para evitar deslocamento
    if (!isMounted) {
      return 80; // Valor fixo baseado no dropdown "Tudo"
    }
    return Math.max(16, dropdownWidth + 16);
  }, [dropdownWidth, isMounted]);

  const mobileInputPadding = useMemo(() => {
    // Usar valor fixo durante hidratação para evitar deslocamento
    if (!isMounted) {
      return 86; // Valor fixo baseado no dropdown "Tudo"
    }
    return Math.max(80, mobileDropdownWidth + 6);
  }, [mobileDropdownWidth, isMounted]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar menu do usuário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showUserMenu || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showNotifications]);

  // Controlar quando o componente está montado no cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Carregar tipo de busca salvo do localStorage (não o termo)
  useEffect(() => {
    const savedType = localStorage.getItem('searchType');
    if (savedType) {
      setSearchType(savedType);
    }
  }, []);

  // Função estável para medir larguras
  const measureWidths = useCallback(() => {
    if (dropdownRef.current) {
      const width = dropdownRef.current.offsetWidth;
      if (width !== dropdownWidth) {
        setDropdownWidth(width);
      }
    }
    if (mobileDropdownRef.current) {
      const width = mobileDropdownRef.current.offsetWidth;
      if (width !== mobileDropdownWidth) {
        setMobileDropdownWidth(width);
      }
    }
  }, [dropdownWidth, mobileDropdownWidth]);

  // Medir largura do dropdown para ajustar padding do input
  useLayoutEffect(() => {
    measureWidths();
  }, [searchType, showDropdown, measureWidths]);

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

  // Cleanup adicional na desmontagem do componente
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, []);


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

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleUserMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleUserMenuToggle();
    } else if (e.key === 'Escape') {
      setShowUserMenu(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleUserSettings = () => {
    setShowUserSettings(true);
    setShowUserMenu(false);
  };

  const handleNotificationsToggle = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNotificationsToggle();
    } else if (e.key === 'Escape') {
      setShowNotifications(false);
    }
  };

  const handleMarkAllAsRead = () => {
    setIsMarkingAsRead(true);
    // Simular animação de fade-out das notificações
    setTimeout(() => {
      setUnreadCount(0);
      setIsMarkingAsRead(false);
    }, 500);
  };

  const handleNotificationClick = (notificationType: string) => {
    if (notificationType === 'radar-ia') {
      router.push('/radar-ia');
    } else if (notificationType === 'diarios-oficiais') {
      router.push('/diarios-oficiais');
    }
    setShowNotifications(false);
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAbbreviatedName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1][0]}.`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Ativar loading
    setIsSearching(true);

    // Detectar se é "Rafael Ximenes" e sempre redirecionar para "tudo"
    const isRafaelXimenes = searchTerm.toLowerCase().includes('rafael ximenes');
    const finalSearchType = isRafaelXimenes ? 'tudo' : searchType;

    // Salvar busca no localStorage
    localStorage.setItem('globalSearch', searchTerm);
    localStorage.setItem('searchType', finalSearchType);

    // Navegar para página de explorar com parâmetros
    const params = new URLSearchParams({
      q: searchTerm,
      type: finalSearchType
    });
    
    // Limpar o campo imediatamente
    setSearchTerm('');
    setIsSearching(false);
    
    router.push(`/explorar?${params.toString()}`);
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
    'Rafael Ximenes',
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

  // Função para destacar texto nas sugestões
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="text-blue-400 font-medium">{part}</span>
      ) : part
    );
  };

  // Função para selecionar sugestão
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Ativar loading
    setIsSearching(true);

    // Detectar se é "Rafael Ximenes" e sempre redirecionar para "tudo"
    const isRafaelXimenes = suggestion.toLowerCase().includes('rafael ximenes');
    const finalSearchType = isRafaelXimenes ? 'tudo' : searchType;

    // Salvar busca no localStorage
    localStorage.setItem('globalSearch', suggestion);
    localStorage.setItem('searchType', finalSearchType);

    // Navegar para página de explorar com parâmetros
    const params = new URLSearchParams({
      q: suggestion,
      type: finalSearchType
    });
    
    // Limpar o campo imediatamente
    setSearchTerm('');
    setIsSearching(false);
    
    router.push(`/explorar?${params.toString()}`);
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
        <div className="flex items-center py-4">
          {/* Logo */}
          <div className="flex lg:max-w-[180px]">
            <Link href="/" className="-m-1 p-1">
              <span className="sr-only">ecioo</span>
              <EciooLogo className="h-8 w-24" />
            </Link>
          </div>
          
          {/* Barra de busca global - Desktop */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-center lg:px-8">
            <div className="relative w-full max-w-2xl">
              <form onSubmit={handleSearch} className="relative w-full">
                {/* Dropdown de filtro customizado */}
                <div className="absolute left-0 top-0 z-10 dropdown-container">
                  <button
                    ref={dropdownRef}
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="h-10 px-3 pr-6 bg-white/10 border border-white/20 rounded-l-full focus:outline-none focus:ring-1 focus:ring-blue-400/60 focus:border-blue-400/40 text-white text-sm font-medium cursor-pointer backdrop-blur-sm hover:bg-white/15 flex items-center whitespace-nowrap"
                    style={{ minWidth: '64px', width: '64px' }}
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
                          className={`w-full text-left px-4 py-3 text-base transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
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
                    placeholder="Digite um nome, CPF, CNPJ, número de processo..."
                    className="w-full h-10 pr-16 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400/60 focus:border-blue-400/40 focus:shadow-lg focus:shadow-blue-400/20 text-sm backdrop-blur-sm transition-none"
                    style={{ paddingLeft: `${desktopInputPadding}px` }}
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
                      className="absolute top-1/2 right-12 transform -translate-y-1/2 w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full group flex items-center justify-center cursor-pointer"
                      type="button"
                      aria-label="Limpar busca"
                    >
                      <svg className="h-3 w-3 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Botão de busca no lado direito */}
                  <button 
                    type="submit"
                    disabled={isSearching}
                    className="absolute top-1/2 right-1 transform -translate-y-1/2 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full group flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Buscar"
                  >
                    {isSearching ? (
                      <svg className="h-3 w-3 text-gray-300 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-3 w-3 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
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
                        className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 first:rounded-t-2xl last:rounded-b-2xl cursor-pointer flex items-center gap-3 ${
                          index === selectedIndex
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="flex-1">{highlightText(suggestion, searchTerm)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </div>

              {/* Botões de autenticação */}
              <div className="hidden lg:flex lg:items-center lg:max-w-[200px] lg:justify-end">
                {!isMounted ? (
                  // Durante a hidratação, sempre mostrar skeleton para evitar mismatch
                  <div className="flex items-center gap-4 ml-auto">
                    {/* Skeleton do botão de notificações - exato w-8 h-8 */}
                    <div className="w-8 h-8 bg-white/10 border border-white/10 rounded-full animate-pulse"></div>
                    
                    {/* Skeleton do chip do usuário - dimensões exatas */}
                    <div className="flex items-center gap-2 whitespace-nowrap px-2 py-1.5">
                      <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
                      <div className="w-[140px] h-4 bg-white/10 rounded animate-pulse hidden sm:block"></div>
                    </div>
                  </div>
                ) : isAuthenticated ? (
              <div className="flex items-center gap-4 ml-auto">
                {/* Botão de Notificações */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={handleNotificationsToggle}
                    onKeyDown={handleNotificationsKeyDown}
                    className="relative w-8 h-8 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-400/20 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    aria-label="Abrir notificações"
                    aria-expanded={showNotifications}
                    aria-controls="notifications-panel"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                  {showNotifications && (
                    <div
                      id="notifications-panel"
                      className="absolute right-0 mt-2 w-80 max-h-[60vh] bg-gray-900 rounded-lg shadow-xl border border-gray-700 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">Notificações</h3>
                          {unreadCount > 0 && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                              Não lidas ({unreadCount})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="max-h-[50vh] overflow-y-auto">
                        {unreadCount > 0 ? (
                          <div className={`p-2 transition-opacity duration-500 ${isMarkingAsRead ? 'opacity-0' : 'opacity-100'}`}>
                            <div className="p-3 hover:bg-gray-800/50 rounded-lg transition-colors cursor-pointer" onClick={() => handleNotificationClick('radar-ia')}>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-white">Novo edital publicado</h4>
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                                  Radar IA
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">Diário Oficial da União - 18/01</p>
                              <p className="text-xs text-gray-500 mt-1">há 2h</p>
                            </div>
                            <div className="p-3 hover:bg-gray-800/50 rounded-lg transition-colors cursor-pointer" onClick={() => handleNotificationClick('diarios-oficiais')}>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-white">Novo alerta monitorado</h4>
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                                  Diários Oficiais
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">Diário Oficial de SP - 18/01</p>
                              <p className="text-xs text-gray-500 mt-1">há 5h</p>
                            </div>
                            <div className="p-3 hover:bg-gray-800/50 rounded-lg transition-colors cursor-pointer" onClick={() => handleNotificationClick('radar-ia')}>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-white">Processo atualizado</h4>
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                                  Radar IA
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">Diário Oficial da União - 16/01</p>
                              <p className="text-xs text-gray-500 mt-1">há 1d</p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <div className="text-4xl mb-3">🎉</div>
                            <p className="text-gray-400 text-sm">Não há novas notificações disponíveis</p>
                          </div>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <div className="p-3 border-t border-gray-700">
                          <button
                            onClick={handleMarkAllAsRead}
                            className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors cursor-pointer"
                          >
                            Marcar todas como lidas
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Chip do Usuário */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={handleUserMenuToggle}
                    onKeyDown={handleUserMenuKeyDown}
                    className="flex items-center gap-2 whitespace-nowrap px-2 py-1.5 hover:bg-white/5 hover:border-white/10 rounded-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    aria-expanded={showUserMenu}
                    aria-haspopup="menu"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {getUserInitials(user?.name || 'U')}
                    </div>
                    <span className="truncate max-w-[140px] text-sm text-gray-200 hidden sm:block">
                      {user?.name}
                    </span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-lg shadow-xl border border-gray-700 z-50">
                      {/* Cabeçalho com avatar, nome e email */}
                      <div className="px-4 py-4 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {getUserInitials(user?.name || 'U')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {user?.name}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {user?.email}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Itens do menu */}
                      <div className="py-2">
                        <button
                          onClick={handleUserSettings}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Minha conta
                        </button>
                        
                        <Link
                          href="/pagamentos"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Pagamentos
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleTrialClick}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-md text-base font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    Criar conta
                  </button>
                  <Link href="/login" className="cta-secondary text-base font-medium leading-5 text-white hover:text-blue-400 cursor-pointer">
                    Entrar <span aria-hidden="true">→</span>
                  </Link>
                </div>
              )}
          </div>

          {/* Menu mobile */}
          <div className="flex lg:hidden mobile-menu-container">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-300 hover:text-white transition-colors cursor-pointer"
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
        <div className="hidden lg:flex lg:justify-center lg:py-3">
          <div className="flex gap-x-10 -ml-8">
            <Link 
              href="/" 
              className={`text-base font-medium leading-5 transition-colors duration-200 ${
                isActive('') 
                  ? 'text-blue-400' 
                  : 'text-white hover:text-blue-400'
              }`}
            >
              Para você
            </Link>
            <Link 
              href="/diarios-oficiais" 
              className={`text-base font-medium leading-5 transition-colors duration-200 ${
                isActive('diarios-oficiais') 
                  ? 'text-blue-400' 
                  : 'text-white hover:text-blue-400'
              }`}
            >
              Diários Oficiais
            </Link>
            <Link 
              href="/radar-ia" 
              className={`text-base font-medium leading-5 transition-colors duration-200 ${
                isActive('radar-ia') 
                  ? 'text-blue-400' 
                  : 'text-white hover:text-blue-400'
              }`}
            >
              Radar IA
            </Link>
            <Link 
              href="/explorar" 
              className={`text-base font-medium leading-5 transition-colors duration-200 ${
                isActive('explorar') 
                  ? 'text-blue-400' 
                  : 'text-white hover:text-blue-400'
              }`}
            >
              Explorar
            </Link>
            <Link 
              href="/api" 
              className={`text-base font-medium leading-5 transition-colors duration-200 ${
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
                      style={{ minWidth: '60px', width: '60px' }}
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
                          className={`w-full text-left px-3 py-2.5 text-xs transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
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
                    placeholder="Digite um nome, CPF, CNPJ, número de processo..."
                    className="w-full h-10 pr-12 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400/60 focus:border-blue-400/40 focus:shadow-lg focus:shadow-blue-400/20 text-xs backdrop-blur-sm transition-none"
                    style={{ paddingLeft: `${mobileInputPadding}px` }}
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
                      className="absolute top-1/2 right-10 transform -translate-y-1/2 w-5 h-5 bg-white/10 hover:bg-white/20 rounded-full group flex items-center justify-center cursor-pointer"
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
                    disabled={isSearching}
                    className="absolute top-1/2 right-1.5 transform -translate-y-1/2 w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full group flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Buscar"
                  >
                    {isSearching ? (
                      <svg className="h-2.5 w-2.5 text-gray-300 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-2.5 w-2.5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
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
                        className={`w-full text-left px-3 py-2.5 text-sm transition-colors duration-200 first:rounded-t-2xl last:rounded-b-2xl cursor-pointer flex items-center gap-3 ${
                          index === selectedIndex
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="flex-1">{highlightText(suggestion, searchTerm)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* NÍVEL 2 MOBILE: Links de navegação */}
            <Link 
              href="/" 
              className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
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
              className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
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
              className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                isActive('radar-ia') 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-white hover:text-blue-400 hover:bg-white/5'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Radar IA
            </Link>
            <Link 
              href="/explorar" 
              className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                isActive('explorar') 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-white hover:text-blue-400 hover:bg-white/5'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Explorar
            </Link>
            <Link 
              href="/api" 
              className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
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
                {!isMounted ? (
                  // Durante a hidratação, sempre mostrar skeleton para evitar mismatch
                  <div className="space-y-2">
                    {/* Skeleton das notificações mobile */}
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="w-24 h-5 bg-white/10 rounded animate-pulse"></div>
                      <div className="w-8 h-8 bg-white/10 border border-white/10 rounded-full animate-pulse"></div>
                    </div>
                    
                    {/* Skeleton do chip do usuário mobile */}
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="w-32 h-4 bg-white/10 rounded animate-pulse mb-1"></div>
                        <div className="w-24 h-3 bg-white/10 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ) : isAuthenticated ? (
                <>
                  {/* Notificações Mobile */}
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-base font-medium text-white">Notificações</span>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                          {unreadCount} não lidas
                        </span>
                      )}
                      <button
                        onClick={handleNotificationsToggle}
                        className="w-8 h-8 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:border-blue-400/50 transition-all duration-200"
                        aria-label="Abrir notificações"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Chip do Usuário Mobile */}
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getUserInitials(user?.name || 'U')}
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-medium text-white">{user?.name}</div>
                      <div className="text-sm text-gray-400">{user?.email}</div>
                    </div>
                  </div>
                  
                  <Link
                    href="/conta"
                    className="block px-3 py-2 text-base font-medium text-white hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Minha conta
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-base font-medium text-white hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                  >
                    Sair
                  </button>
                </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-3 py-2 text-base font-medium text-white hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Entrar <span aria-hidden="true">→</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleTrialClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-md text-base font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 cursor-pointer"
                    >
                      Criar conta
                    </button>
                  </>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de configurações do usuário */}
      <UserSettingsModal 
        isOpen={showUserSettings} 
        onClose={() => setShowUserSettings(false)} 
      />
      
    </header>
  );
}
