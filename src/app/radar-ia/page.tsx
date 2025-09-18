'use client';

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import TransparentHeader from "@/components/TransparentHeader";
import RevealWrapper from "@/components/RevealWrapper";
import RegisterModal from "@/components/RegisterModal";
import TestModal from "@/components/TestModal";

// Lazy load heavy components
const GuidedOnboarding = lazy(() => import("@/components/onboarding/GuidedOnboarding"));

// Tipos para o sistema de monitoramento
interface MockSummary {
  id: string;
  contextType: 'concursos' | 'licitacoes' | 'leis';
  title: string;
  date: string;
  source: string;
  url: string;
  isRead: boolean;
  details: ConcursoDetails | LicitacaoDetails | LeiDetails;
}

interface ConcursoDetails {
  instituicao: string;
  cargos: string[];
  vagas: number;
  salario: string;
  inscricaoInicio: string;
  inscricaoFim: string;
  taxaInscricao: string;
  dataProva: string;
  linkEdital: string;
  resumo: string;
}

interface LicitacaoDetails {
  orgao: string;
  modalidade: string;
  objeto: string;
  categoria: string;
  valorEstimado: string;
  entregaPropostasAte: string;
  sessaoPublicaEm: string;
  linkEdital: string;
  resumo: string;
}

interface LeiDetails {
  ente: string;
  tipoNorma: string;
  numero: string;
  ano: number;
  ementa: string;
  assuntos: string[];
  dataPublicacao: string;
  linkPublicacao: string;
  resumo: string;
}

interface Monitoring {
  id: string;
  contextId: string;
  contextName: string;
  contextIcon: string;
  contextColor: string;
  createdAt: string;
  status: 'active' | 'inactive';
  totalFound: number;
  lastFound: string;
  configurations: any;
  history: MockSummary[];
  selectedDiarios: string[];
  valorRange: { min: number; max: number };
  valorRangeType: 'predefined' | 'custom';
  selectedPredefinedRange: string;
  newCount: number;
  lastSeenCount: number;
}

export default function RadarIA() {
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [monitorings, setMonitorings] = useState<Monitoring[]>([
    {
      id: '1',
      contextType: 'concursos',
      title: 'Concursos Públicos - Educação',
      createdAt: '2024-01-10',
      status: 'active',
      totalFound: 12,
      lastFound: '2024-01-15',
      configurations: {
        diarios: ['DOU', 'DOSP'],
        tipo: 'Concursos Públicos'
      },
      history: [
        {
          id: '1',
          contextType: 'concursos',
          title: 'Edital de Concurso Público - Secretaria de Educação',
          date: '2024-01-15',
          source: 'DOU',
          url: '#',
          isRead: false,
          details: {
            instituicao: 'Secretaria de Educação',
            cargos: ['Professor', 'Coordenador'],
            vagas: 50,
            salario: 'R$ 3.500,00',
            inscricaoInicio: '2024-01-20',
            inscricaoFim: '2024-02-20',
            taxaInscricao: 'R$ 80,00',
            dataProva: '2024-03-15',
            linkEdital: '#',
            resumo: 'Concurso para provimento de vagas na área de educação'
          }
        },
        {
          id: '2',
          contextType: 'concursos',
          title: 'Concurso Público - Tribunal de Justiça',
          date: '2024-01-14',
          source: 'DOU',
          url: '#',
          isRead: true,
          details: {
            instituicao: 'Tribunal de Justiça',
            cargos: ['Analista Judiciário'],
            vagas: 20,
            salario: 'R$ 5.000,00',
            inscricaoInicio: '2024-01-18',
            inscricaoFim: '2024-02-18',
            taxaInscricao: 'R$ 120,00',
            dataProva: '2024-03-10',
            linkEdital: '#',
            resumo: 'Concurso para analista judiciário'
          }
        }
      ],
      selectedDiarios: ['DOU', 'DOSP'],
      valorRange: { min: 0, max: 100000 },
      valorRangeType: 'predefined',
      selectedPredefinedRange: 'qualquer',
      newCount: 2,
      lastSeenCount: 10
    },
    {
      id: '2',
      contextType: 'licitacoes',
      title: 'Licitações - Tecnologia',
      createdAt: '2024-01-08',
      status: 'active',
      totalFound: 8,
      lastFound: '2024-01-14',
      configurations: {
        fonte: 'ComprasNet',
        categoria: 'Tecnologia da Informação',
        valorMin: 10000,
        valorMax: 100000,
        valorRangeType: 'custom',
        selectedPredefinedRange: 'custom',
        tipo: 'Licitações'
      },
      history: [
        {
          id: '3',
          contextType: 'licitacoes',
          title: 'Pregão Eletrônico - Equipamentos de TI',
          date: '2024-01-14',
          source: 'ComprasNet',
          url: '#',
          isRead: false,
          details: {
            orgao: 'Ministério da Educação',
            modalidade: 'Pregão Eletrônico',
            objeto: 'Aquisição de equipamentos de informática',
            categoria: 'Tecnologia da Informação',
            valorEstimado: 'R$ 50.000,00',
            entregaPropostasAte: '2024-01-25',
            sessaoPublicaEm: '2024-01-25',
            linkEdital: '#',
            resumo: 'Pregão para aquisição de computadores e periféricos'
          }
        }
      ],
      selectedDiarios: ['DOU'],
      valorRange: { min: 10000, max: 100000 },
      valorRangeType: 'custom',
      selectedPredefinedRange: 'custom',
      newCount: 1,
      lastSeenCount: 7
    },
    {
      id: '3',
      contextType: 'leis',
      title: 'Leis e Legislação - Municipal',
      createdAt: '2024-01-05',
      status: 'inactive',
      totalFound: 5,
      lastFound: '2024-01-12',
      configurations: {
        ente: 'Municipal',
        tipoNorma: 'Lei',
        tipo: 'Leis/Legislação'
      },
      history: [
        {
          id: '4',
          contextType: 'leis',
          title: 'Lei Municipal nº 5.432/2024',
          date: '2024-01-12',
          source: 'DOM',
          url: '#',
          isRead: true,
          details: {
            ente: 'Prefeitura Municipal',
            tipoNorma: 'Lei',
            numero: '5.432',
            ano: 2024,
            ementa: 'Dispõe sobre a criação de cargos efetivos',
            linkNorma: '#',
            resumo: 'Lei que cria novos cargos na estrutura municipal'
          }
        }
      ],
      selectedDiarios: ['DOM'],
      valorRange: { min: 0, max: 100000 },
      valorRangeType: 'predefined',
      selectedPredefinedRange: 'qualquer',
      newCount: 0,
      lastSeenCount: 5
    }
  ]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedMonitoring, setSelectedMonitoring] = useState<Monitoring | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  
  const [drawerAnimation, setDrawerAnimation] = useState<'slide-in' | 'slide-out' | null>(null);
  const [selectedDiarios, setSelectedDiarios] = useState<string[]>([]);
  const [expandedPoderes, setExpandedPoderes] = useState<{[key: string]: boolean}>({});
  const [expandedSubcategorias, setExpandedSubcategorias] = useState<{[key: string]: boolean}>({});
  const [diarioSearchTerm, setDiarioSearchTerm] = useState('');
  const [valorRange, setValorRange] = useState({ min: 0, max: 100000 });
  const [valorRangeType, setValorRangeType] = useState<'predefined' | 'custom'>('predefined');
  const [selectedPredefinedRange, setSelectedPredefinedRange] = useState<string>('qualquer');
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});
  const [selectedItems, setSelectedItems] = useState<{[key: string]: boolean}>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTiposNorma, setSelectedTiposNorma] = useState<string[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedFonte, setSelectedFonte] = useState<string>('');
  
  console.log('Current form state:', {
    selectedContext,
    selectedDiarios: selectedDiarios.length,
    selectedCategoria,
    selectedFonte,
    selectedTiposNorma: selectedTiposNorma.length
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);

  // Função para ativar spotlight nos contextos
  const handleCreateMonitoringClick = () => {
    setShowSpotlight(true);
    // Remover spotlight após 5 segundos
    setTimeout(() => {
      setShowSpotlight(false);
    }, 5000);
  };

  // Funções para localStorage
  const getLastSeenCount = (monitoringId: string): number => {
    const stored = localStorage.getItem(`ad_radar_last_seen_${monitoringId}`);
    return stored ? parseInt(stored, 10) : 0;
  };

  const setLastSeenCount = (monitoringId: string, count: number) => {
    localStorage.setItem(`ad_radar_last_seen_${monitoringId}`, count.toString());
  };

  const updateNewCounts = (monitorings: Monitoring[]): Monitoring[] => {
    return monitorings.map(monitoring => ({
      ...monitoring,
      lastSeenCount: getLastSeenCount(monitoring.id),
      newCount: Math.max(0, monitoring.totalFound - getLastSeenCount(monitoring.id))
    }));
  };

  const contexts = [
    {
      id: 'concursos',
      title: 'Concursos Públicos',
      description: 'Monitore novos editais de concursos públicos',
      icon: '🎯',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'licitacoes',
      title: 'Licitações',
      description: 'Acompanhe editais de licitações e pregões',
      icon: '📋',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'leis',
      title: 'Leis / Legislação',
      description: 'Identifique novas leis e alterações legislativas',
      icon: '⚖️',
      color: 'from-purple-500 to-violet-600'
    }
  ];

  // Estrutura de diários oficiais (mesma da aba Diários Oficiais)
  const diariosPorPoder = {
    'Poder Executivo': {
      'Federal': [
        { id: 'dou', name: 'Diário Oficial da União (DOU)' },
      ],
      'Estaduais': [
        { id: 'dosp', name: 'Diário Oficial SP' },
        { id: 'dorj', name: 'Diário Oficial RJ' },
        { id: 'domg', name: 'Diário Oficial MG' },
        { id: 'dors', name: 'Diário Oficial RS' },
        { id: 'dopr', name: 'Diário Oficial PR' },
        { id: 'dosc', name: 'Diário Oficial SC' },
        { id: 'doba', name: 'Diário Oficial BA' },
        { id: 'dogo', name: 'Diário Oficial GO' },
      ],
      'Municipais': [
        { id: 'domsaopaulo', name: 'DOM São Paulo' },
        { id: 'domrio', name: 'DOM Rio de Janeiro' },
        { id: 'dombh', name: 'DOM Belo Horizonte' },
        { id: 'domrecife', name: 'DOM Recife' },
        { id: 'domfortaleza', name: 'DOM Fortaleza' },
        { id: 'domsalvador', name: 'DOM Salvador' },
        { id: 'dombrasilia', name: 'DOM Brasília' },
        { id: 'domcuritiba', name: 'DOM Curitiba' },
      ]
    },
    'Poder Judiciário': {
      'Justiça Eleitoral': [
        { id: 'dje', name: 'Diário da Justiça Eleitoral (DJE)' },
      ],
      'Justiça do Trabalho': [
        { id: 'djt', name: 'Diário da Justiça do Trabalho (DJT)' },
      ],
      'Justiça Federal': [
        { id: 'dju', name: 'Diário da Justiça da União (DJU)' },
      ]
    },
    'Poder Legislativo': [
      { id: 'dleg', name: 'Diário do Congresso Nacional' },
    ],
    'Ministério Público': [
      { id: 'dmpu', name: 'Diário do Ministério Público da União' },
    ],
    'Defensoria Pública': [
      { id: 'ddpu', name: 'Diário da Defensoria Pública da União' },
    ]
  };

  // Filtrar diários baseado na busca
  const filteredDiariosPorPoder = Object.entries(diariosPorPoder).reduce((acc, [poder, subcategorias]) => {
    if (Array.isArray(subcategorias)) {
      const filtered = subcategorias.filter(diario => 
        diario.name.toLowerCase().includes(diarioSearchTerm.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[poder] = filtered;
      }
    } else {
      const filteredSubcategorias = Object.entries(subcategorias).reduce((subAcc, [subcategoria, diariosList]) => {
        const filtered = diariosList.filter(diario => 
          diario.name.toLowerCase().includes(diarioSearchTerm.toLowerCase())
        );
        if (filtered.length > 0) {
          subAcc[subcategoria] = filtered;
        }
        return subAcc;
      }, {} as Record<string, any[]>);
      
      if (Object.keys(filteredSubcategorias).length > 0) {
        acc[poder] = filteredSubcategorias;
      }
    }
    return acc;
  }, {} as Record<string, any>);

  // Funções para controle de expansão
  const togglePoder = (poder: string) => {
    setExpandedPoderes(prev => ({
      ...prev,
      [poder]: !prev[poder]
    }));
  };

  const toggleSubcategoria = (poder: string, subcategoria: string) => {
    const key = `${poder}-${subcategoria}`;
    setExpandedSubcategorias(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDiarioSelect = (diarioId: string) => {
    setSelectedDiarios(prev => 
      prev.includes(diarioId) 
        ? prev.filter(id => id !== diarioId)
        : [...prev, diarioId]
    );
  };

  // Funções para formatação de moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/[^\d]/g, '')) || 0;
  };

  // Faixas pré-definidas
  const predefinedRanges = [
    { id: 'qualquer', label: 'Qualquer valor', min: 0, max: 10000000 },
    { id: 'ate-10k', label: 'Até R$ 10.000', min: 0, max: 10000 },
    { id: '10k-50k', label: 'R$ 10.000 - R$ 50.000', min: 10000, max: 50000 },
    { id: '50k-200k', label: 'R$ 50.000 - R$ 200.000', min: 50000, max: 200000 },
    { id: '200k-500k', label: 'R$ 200.000 - R$ 500.000', min: 200000, max: 500000 },
    { id: 'acima-500k', label: 'Acima de R$ 500.000', min: 500000, max: 10000000 },
    { id: 'custom', label: 'Personalizado', min: 0, max: 0 }
  ];

  const handlePredefinedRangeChange = (rangeId: string) => {
    setSelectedPredefinedRange(rangeId);
    if (rangeId === 'custom') {
      setValorRangeType('custom');
    } else {
      setValorRangeType('predefined');
      const range = predefinedRanges.find(r => r.id === rangeId);
      if (range) {
        setValorRange({ min: range.min, max: range.max });
      }
    }
  };

  const handleCustomRangeChange = (field: 'min' | 'max', value: string) => {
    const numericValue = parseCurrency(value);
    setValorRange(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  const handleContextClick = (contextId: string) => {
    console.log('Context clicked:', contextId);
    setSelectedContext(contextId);
    setShowForm(true);
    
    // Limpar campos específicos quando muda de contexto
    if (contextId === 'licitacoes') {
      setSelectedCategoria('');
      setSelectedFonte('');
      setSelectedPredefinedRange('qualquer');
    } else if (contextId === 'leis') {
      setSelectedTiposNorma([]);
    }
    
    // Sempre limpar diários para forçar nova seleção
    setSelectedDiarios([]);
    
    // Scroll automático para a caixa de configuração após um pequeno delay
    setTimeout(() => {
      const configPanel = document.querySelector('#context-config-panel');
      if (configPanel) {
        configPanel.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    }, 100);
  };

  const handleCreateMonitoring = async () => {
    // Verificar se usuário está logado
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
      // Abrir modal de cadastro se não estiver logado
      setIsRegisterModalOpen(true);
      return;
    }
    
    try {
      setIsLoading(true);
      const configurations = getMockConfigurations(selectedContext!);
      const result = await createMonitoring(selectedContext!, configurations);
      
      if (result.success) {
        // Recarregar lista de monitoramentos
        const updatedMonitorings = await fetchMonitorings();
        setMonitorings(updateNewCounts(updatedMonitorings));
        
        setShowForm(false);
        setSelectedContext(null);
        setSelectedDiarios([]);
        setValorRange({ min: 0, max: 100000 });
        setValorRangeType('predefined');
        setSelectedPredefinedRange('10k-50k');
        
        showToast('Monitoramento criado com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao criar monitoramento:', error);
      showToast('Erro ao criar monitoramento. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMonitoringStatus = (monitoringId: string) => {
    setMonitorings(prev => prev.map(m => 
      m.id === monitoringId 
        ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' }
        : m
    ));
  };

  const getMockConfigurations = (contextId: string) => {
    const getDiarioNames = (ids: string[]) => {
      const allDiarios = Object.values(diariosPorPoder).flatMap(poder => 
        Array.isArray(poder) ? poder : Object.values(poder).flat()
      );
      return ids.map(id => allDiarios.find(d => d.id === id)?.name || id);
    };

    switch (contextId) {
      case 'concursos':
        return {
          diarios: selectedDiarios.length > 0 ? getDiarioNames(selectedDiarios) : ['DOU - Diário Oficial da União'],
          tipo: 'Concursos Públicos'
        };
      case 'licitacoes':
        return {
          fonte: selectedFonte || 'ComprasNet',
          categoria: selectedCategoria || 'Tecnologia da Informação',
          valorMin: valorRange.min,
          valorMax: valorRange.max,
          valorRangeType: valorRangeType,
          selectedPredefinedRange: selectedPredefinedRange,
          tipo: 'Licitações'
        };
      case 'leis':
        return {
          fonte: 'DOU - Diário Oficial da União',
          tiposNorma: ['Lei', 'Decreto', 'Portaria'],
          tipo: 'Leis/Legislação'
        };
      default:
        return {};
    }
  };

  // Funções para integração com API real
  const createMonitoring = async (contextId: string, configurations: any) => {
    // TODO: Implementar chamada para API real
    console.log('Criando monitoramento:', { contextId, configurations });
    return { success: true, id: Date.now().toString() };
  };

  const fetchMonitorings = async () => {
    // TODO: Implementar chamada para API real
    console.log('Buscando monitoramentos...');
    return [];
  };

  const fetchMonitoringHistory = async (monitoringId: string) => {
    // TODO: Implementar chamada para API real
    console.log('Buscando histórico do monitoramento:', monitoringId);
    return [];
  };

  const handleViewDetails = (monitoring: any) => {
    setSelectedMonitoring(monitoring);
    setDrawerAnimation('slide-in');
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setDrawerAnimation('slide-out');
    setTimeout(() => {
      setShowDrawer(false);
      setSelectedMonitoring(null);
      setDrawerAnimation(null);
    }, 300);
  };


  const handleEditMonitoring = (monitoring: any) => {
    setSelectedContext(monitoring.contextId);
    setShowForm(true);
    closeDrawer();
  };

  const handleDeleteMonitoring = (monitoringId: string) => {
    setMonitorings(prev => prev.filter(m => m.id !== monitoringId));
  };

  // Funções para expansão de itens
  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Função para marcar item como lido
  const markItemAsRead = (monitoringId: string, itemId: string) => {
    setMonitorings(prev => {
      const updated = prev.map(monitoring => {
        if (monitoring.id === monitoringId) {
          const updatedHistory = monitoring.history.map(item => 
            item.id === itemId ? { ...item, isRead: true } : item
          );
          
          // Contar itens lidos
          const readCount = updatedHistory.filter(item => item.isRead).length;
          setLastSeenCount(monitoringId, readCount);
          
          return {
            ...monitoring,
            history: updatedHistory,
            lastSeenCount: readCount,
            newCount: Math.max(0, monitoring.totalFound - readCount)
          };
        }
        return monitoring;
      });
      
      return updateNewCounts(updated);
    });
  };

  // Função para copiar resumo
  const copySummary = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Aqui você pode adicionar uma notificação de sucesso
    } catch (err) {
      console.error('Erro ao copiar texto:', err);
    }
  };

  // Funções para filtros e seleções
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const selectAllItems = (monitoringId: string) => {
    const monitoring = monitorings.find(m => m.id === monitoringId);
    if (!monitoring) return;

    const newSelections: {[key: string]: boolean} = {};
    monitoring.history.forEach(item => {
      newSelections[item.id] = true;
    });
    setSelectedItems(prev => ({ ...prev, ...newSelections }));
  };

  const clearSelection = () => {
    setSelectedItems({});
  };

  const deleteSelectedItems = (monitoringId: string) => {
    const selectedItemIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
    const count = selectedItemIds.length;
    
    setMonitorings(prev => {
      const updated = prev.map(monitoring => {
        if (monitoring.id === monitoringId) {
          const updatedHistory = monitoring.history.filter(item => !selectedItemIds.includes(item.id));
          const newTotalFound = updatedHistory.length;
          const readCount = updatedHistory.filter(item => item.isRead).length;
          
          setLastSeenCount(monitoringId, readCount);
          
          return {
            ...monitoring,
            history: updatedHistory,
            totalFound: newTotalFound,
            lastSeenCount: readCount,
            newCount: Math.max(0, newTotalFound - readCount)
          };
        }
        return monitoring;
      });
      
      setSelectedItems({});
      return updateNewCounts(updated);
    });

    // Mostrar toast de confirmação
    showToast(`${count} item(s) excluído(s) com sucesso!`, 'success');
  };

  const getSelectedCount = (monitoringId: string) => {
    const monitoring = monitorings.find(m => m.id === monitoringId);
    if (!monitoring) return 0;
    
    return monitoring.history.filter(item => selectedItems[item.id]).length;
  };

  const getTotalSelectedCount = () => {
    return Object.values(selectedItems).filter(Boolean).length;
  };

  // Função para mostrar toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Função para filtrar itens do histórico
  const getFilteredHistory = (history: MockSummary[]) => {
    let filtered = history;

    // Filtro por status (lido/não lido)
    if (filterStatus === 'read') {
      filtered = filtered.filter(item => item.isRead);
    } else if (filterStatus === 'unread') {
      filtered = filtered.filter(item => !item.isRead);
    }

    // Filtro por data
    const now = new Date();
    if (filterDateRange === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(item => new Date(item.date) >= today);
    } else if (filterDateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(item => new Date(item.date) >= weekAgo);
    } else if (filterDateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(item => new Date(item.date) >= monthAgo);
    }

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.details.resumo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // useEffect para carregar monitoramentos reais
  useEffect(() => {
    const loadMonitorings = async () => {
      try {
        const data = await fetchMonitorings();
        setMonitorings(updateNewCounts(data));
      } catch (error) {
        console.error('Erro ao carregar monitoramentos:', error);
        showToast('Erro ao carregar monitoramentos', 'error');
      }
    };

    loadMonitorings();
  }, []);


  // Função para lidar com conclusão do onboarding
  const handleOnboardingComplete = () => {
    // Recarregar monitoramentos após onboarding
    const loadMonitorings = async () => {
      try {
        const data = await fetchMonitorings();
        setMonitorings(updateNewCounts(data));
      } catch (error) {
        console.error('Erro ao carregar monitoramentos:', error);
      }
    };
    loadMonitorings();
  };

  const handleClearSelections = () => {
    console.log('Clearing selections...');
    // Limpar todas as seleções do formulário
    setSelectedDiarios([]);
    setSelectedTiposNorma([]);
    setSelectedCategoria('');
    setSelectedFonte('');
    setValorRange({ min: 0, max: 10000000 });
    setValorRangeType('predefined');
    setSelectedPredefinedRange('qualquer');
    console.log('Selections cleared');
  };

  const handleCloseConfig = () => {
    // Fechar janela de configuração e limpar contexto selecionado
    setShowForm(false);
    setSelectedContext(null);
    
    // Scroll automático para centralizar os cards de contexto
    setTimeout(() => {
      const contextCards = document.querySelector('#context-cards-container');
      if (contextCards) {
        contextCards.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    }, 100);
  };

  return (
    <div className="bg-transparent min-h-screen">
      <TransparentHeader 
        currentPage="radar-ia" 
        onTrialClick={() => setIsTestModalOpen(true)} 
      />

      <div className="relative isolate px-6 pt-14 lg:px-8 fade-in-up">
        {/* Gradiente sutil */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        {/* Hero Section */}
        <div className="mx-auto max-w-6xl py-16 sm:py-24">
          <div className="text-center mb-16">
            <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-tight fade-in-delay-1">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300" style={{ lineHeight: '1.2', paddingBottom: '2px' }}>Radar IA</span>
            </h1>
            <p className="mt-3 text-base text-gray-300 max-w-2xl mx-auto sm:text-lg sm:mt-4 fade-in-delay-2">
              Configure seu monitoramento inteligente e receba apenas as publicações que importam para você
            </p>
          </div>

          {/* Contextos Disponíveis */}
          <div className="mb-12 fade-in-delay-3">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Escolha o contexto para monitorar
                </h2>
              </div>
            </div>
            <div id="context-cards-container" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contexts.map((context, index) => (
                <div
                  key={context.id}
                  id={`context-card-${context.id}`}
                  onClick={() => handleContextClick(context.id)}
                  className={`relative bg-white/5 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-6 cursor-pointer hover:border-blue-400/50 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04),0_0_20px_rgba(59,130,246,0.1)] group ${
                    showSpotlight ? 'animate-pulse ring-2 ring-blue-400/40 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : ''
                  }`}
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">{context.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {context.title}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {context.description}
                    </p>
                    <div className={`mt-4 h-1 bg-gradient-to-r ${context.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulário de Configuração */}
          {showForm && selectedContext && (
            <div id="context-config-panel" className="bg-white/5 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-8 mb-8 fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Configurar {contexts.find(c => c.id === selectedContext)?.title}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setSelectedContext(null);
                    setSelectedDiarios([]);
                    setSelectedTiposNorma([]);
                    setSelectedCategoria('');
                    setSelectedFonte('');
                    setValorRange({ min: 0, max: 10000000 });
                    setValorRangeType('predefined');
                    setSelectedPredefinedRange('qualquer');
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Formulário para Concursos Públicos */}
              {selectedContext === 'concursos' && (
                <div className="space-y-6">
                  {/* Painel de Seleções Ativas */}
                  {selectedDiarios.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="text-sm font-medium text-blue-300">
                          Diários Selecionados ({selectedDiarios.length})
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedDiarios.map((diarioId) => {
                          const allDiarios = Object.values(diariosPorPoder).flatMap(poder => 
                            Array.isArray(poder) ? poder : Object.values(poder).flat()
                          );
                          const diario = allDiarios.find(d => d.id === diarioId);
                          return (
                            <div
                              key={diarioId}
                              className="flex items-center gap-2 bg-blue-600/20 text-blue-200 px-3 py-1 rounded-full text-sm"
                            >
                              <span>{diario?.name || diarioId}</span>
                              <button
                                onClick={() => handleDiarioSelect(diarioId)}
                                className="text-blue-400 hover:text-blue-200 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setSelectedDiarios([])}
                        className="mt-3 text-xs text-gray-400 hover:text-white transition-colors"
                      >
                        Limpar todas as seleções
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      Selecione os diários oficiais
                    </label>
                    
                    {/* Dropdown com busca */}
                    <div className="bg-white/5 border border-white/20 rounded-xl p-4 sm:p-6">
                      {/* Busca global */}
                      <div className="mb-6">
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            value={diarioSearchTerm}
                            onChange={(e) => setDiarioSearchTerm(e.target.value)}
                            placeholder="Buscar em todos os diários..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Lista de diários por poder */}
                      <div className="space-y-4 max-h-64 overflow-y-auto">
                        {Object.entries(filteredDiariosPorPoder).map(([poder, subcategorias]) => {
                          const totalDiarios = Array.isArray(subcategorias) 
                            ? subcategorias.length 
                            : Object.values(subcategorias as Record<string, any[]>).flat().length;
                          
                          return (
                            <div key={poder}>
                              <button
                                onClick={() => togglePoder(poder)}
                                className="flex items-center justify-between w-full text-left py-3 px-3 text-gray-300 hover:text-white font-medium bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
                              >
                                <span className="font-semibold text-sm">{poder} ({totalDiarios})</span>
                                <span className="transform transition-transform duration-200 text-blue-400">
                                  {expandedPoderes[poder] ? '−' : '+'}
                                </span>
                              </button>
                              
                              {expandedPoderes[poder] && (
                                <div className="ml-4 space-y-3 mt-2">
                                  {Array.isArray(subcategorias) ? (
                                    // Para MP e DP (arrays diretos)
                                    <div className="space-y-2">
                                      {subcategorias.map((diario) => (
                                        <label key={diario.id} className="flex items-center gap-3 py-2 px-3 text-sm text-gray-300 hover:text-white cursor-pointer rounded-lg hover:bg-white/5 transition-all duration-200">
                                          <input
                                            type="checkbox"
                                            checked={selectedDiarios.includes(diario.id)}
                                            onChange={() => handleDiarioSelect(diario.id)}
                                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                          />
                                          <span className="flex-1">{diario.name}</span>
                                        </label>
                                      ))}
                                    </div>
                                  ) : (
                                    // Para poderes com subcategorias
                                    Object.entries(subcategorias as Record<string, any[]>).map(([subcategoria, diariosList]) => (
                                      <div key={subcategoria}>
                                        <button
                                          onClick={() => toggleSubcategoria(poder, subcategoria)}
                                          className="flex items-center justify-between w-full text-left py-2 px-3 text-gray-300 hover:text-white font-medium bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
                                        >
                                          <span className="font-medium text-xs">{subcategoria} ({diariosList.length})</span>
                                          <span className="transform transition-transform duration-200 text-blue-400">
                                            {expandedSubcategorias[`${poder}-${subcategoria}`] ? '−' : '+'}
                                          </span>
                                        </button>
                                        
                                        {expandedSubcategorias[`${poder}-${subcategoria}`] && (
                                          <div className="ml-4 space-y-1 mt-2">
                                            {diariosList.map((diario: { id: string; name: string }) => (
                                              <label key={diario.id} className="flex items-center gap-3 py-2 px-3 text-sm text-gray-300 hover:text-white cursor-pointer rounded-lg hover:bg-white/5 transition-all duration-200">
                                                <input
                                                  type="checkbox"
                                                  checked={selectedDiarios.includes(diario.id)}
                                                  onChange={() => handleDiarioSelect(diario.id)}
                                                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                                />
                                                <span className="flex-1">{diario.name}</span>
                                              </label>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Serão monitorados novos editais de concursos públicos nos diários selecionados
                    </p>
                  </div>
                </div>
              )}

              {/* Formulário para Licitações */}
              {selectedContext === 'licitacoes' && (
                <div className="space-y-6">
                  {/* Painel de Seleções Ativas para Licitações */}
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-sm font-medium text-green-300">
                        Configurações Selecionadas
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Fonte:</span>
                        <span className="text-sm text-white">{selectedFonte}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Categoria:</span>
                        <span className="text-sm text-white">{selectedCategoria}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Faixa de Valor:</span>
                        <span className="text-sm text-white">
                          {valorRangeType === 'predefined' 
                            ? predefinedRanges.find(r => r.id === selectedPredefinedRange)?.label || 'Personalizado'
                            : `${formatCurrency(valorRange.min)} - ${formatCurrency(valorRange.max)}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fonte
                    </label>
                    <select 
                      value={selectedFonte}
                      onChange={(e) => setSelectedFonte(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="" disabled>Selecione a fonte</option>
                      <option value="ComprasNet">ComprasNet</option>
                      <option value="BEC/SP - Bolsa Eletrônica de Compras">BEC/SP - Bolsa Eletrônica de Compras</option>
                      <option value="Portal de Compras do Estado">Portal de Compras do Estado</option>
                      <option value="Portal de Compras do Município">Portal de Compras do Município</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Categoria do Contrato
                    </label>
                    <select 
                      value={selectedCategoria}
                      onChange={(e) => setSelectedCategoria(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="" disabled>Selecione a categoria</option>
                      <option value="Engenharia">Engenharia</option>
                      <option value="Tecnologia da Informação">Tecnologia da Informação</option>
                      <option value="Saúde">Saúde</option>
                      <option value="Educação">Educação</option>
                      <option value="Segurança">Segurança</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      Faixa de Valor
                    </label>
                    
                    {/* Container principal com blur e gradiente */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                      {/* Seleção de tipo de faixa */}
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {predefinedRanges.map((range) => (
                            <button
                              key={range.id}
                              onClick={() => handlePredefinedRangeChange(range.id)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                selectedPredefinedRange === range.id
                                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                              }`}
                            >
                              {range.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Campos personalizados (quando selecionado) */}
                      {valorRangeType === 'custom' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-2">
                                Valor Mínimo
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                  R$
                                </span>
                                <input
                                  type="text"
                                  value={formatCurrency(valorRange.min)}
                                  onChange={(e) => handleCustomRangeChange('min', e.target.value)}
                                  placeholder="0,00"
                                  className="w-full pl-8 pr-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-2">
                                Valor Máximo
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                  R$
                                </span>
                                <input
                                  type="text"
                                  value={formatCurrency(valorRange.max)}
                                  onChange={(e) => handleCustomRangeChange('max', e.target.value)}
                                  placeholder="0,00"
                                  className="w-full pl-8 pr-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Exibição da faixa selecionada */}
                      {valorRangeType === 'predefined' && (
                        <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/30 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-purple-300">
                                Faixa Selecionada
                              </p>
                              <p className="text-lg font-bold text-white">
                                {formatCurrency(valorRange.min)} - {formatCurrency(valorRange.max)}
                              </p>
                            </div>
                            <div className="text-purple-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <p className="mt-3 text-xs text-gray-400">
                      Serão monitorados novos editais de licitação conforme os critérios selecionados
                    </p>
                  </div>
                </div>
              )}

              {/* Formulário para Leis/Legislação */}
              {selectedContext === 'leis' && (
                <div className="space-y-6">
                  {/* Painel de Seleções Ativas para Leis */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-400/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-sm font-medium text-purple-300">
                        Configurações Selecionadas
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Fonte:</span>
                        <span className="text-sm text-white">DOU - Diário Oficial da União</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Tipos de Norma:</span>
                        <span className="text-sm text-white">
                          {selectedTiposNorma.length > 0 
                            ? selectedTiposNorma.join(', ') 
                            : 'Nenhum selecionado'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fonte
                    </label>
                    <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>DOU - Diário Oficial da União</option>
                      <option>Assembleias Legislativas</option>
                      <option>Câmaras Municipais</option>
                      <option>Ministérios e Órgãos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Norma
                    </label>
                    <div className="space-y-3">
                      {['Lei', 'Decreto', 'Portaria', 'Instrução Normativa', 'Resolução'].map((tipo, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedTiposNorma.includes(tipo)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTiposNorma(prev => [...prev, tipo]);
                              } else {
                                setSelectedTiposNorma(prev => prev.filter(t => t !== tipo));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="ml-3 text-sm text-gray-300">{tipo}</span>
                        </label>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Serão identificadas novas leis e alterações legislativas conforme os critérios selecionados
                    </p>
                  </div>
                </div>
              )}

              {/* Botão de Criação */}
              <div className="mt-8 pt-6 border-t border-gray-600">
                <button
                  id="btn-criar-monitoramento"
                  onClick={handleCreateMonitoring}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Criando monitoramento...' : 'Criar monitoramento de contexto'}
                </button>
              </div>
            </div>
          )}

          {/* Monitoramentos Ativos */}
          <div className="mb-12 fade-in-delay-3">
            <RevealWrapper>
              {monitorings.length > 0 && (
                <h2 className="text-xl font-bold text-white mb-6">Monitoramentos Ativos</h2>
              )}
              {monitorings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Nenhum monitoramento ativo</h3>
                  <p className="text-gray-400 mb-6">Crie seu primeiro monitoramento para começar a receber alertas</p>
                  <button
                    onClick={handleCreateMonitoringClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Criar Monitoramento
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {monitorings.map((monitoring) => (
                    <div key={monitoring.id} className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/10 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{monitoring.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              monitoring.isActive 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                              {monitoring.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-3">{monitoring.description}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                              {monitoring.contextType === 'concursos' ? 'Concursos' : 
                               monitoring.contextType === 'licitacoes' ? 'Licitações' : 'Leis'}
                            </span>
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded border border-purple-500/30">
                              {monitoring.selectedDiarios.length} diário(s)
                            </span>
                            {monitoring.selectedCategoria && (
                              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded border border-orange-500/30">
                                {monitoring.selectedCategoria}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            Criado em {new Date(monitoring.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleViewDetails(monitoring.id)}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Ver detalhes"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditMonitoring(monitoring.id)}
                            className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setMonitorings(prev => prev.filter(m => m.id !== monitoring.id))}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <button
                            onClick={() => toggleMonitoringStatus(monitoring.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              monitoring.isActive
                                ? 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
                                : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'
                            }`}
                            title={monitoring.isActive ? 'Desativar' : 'Ativar'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </RevealWrapper>
          </div>


        </div>
      </div>

      {/* Drawer de Detalhes */}
      {showDrawer && selectedMonitoring && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${drawerAnimation === 'slide-in' ? 'drawer-overlay-fade-in' : drawerAnimation === 'slide-out' ? 'drawer-overlay-fade-out' : ''}`}
            onClick={closeDrawer}
          ></div>
          <div className={`absolute right-0 top-0 h-full w-full max-w-4xl bg-gray-900/95 backdrop-blur-sm border-l border-blue-400/30 shadow-2xl ${drawerAnimation === 'slide-in' ? 'drawer-slide-in-right' : drawerAnimation === 'slide-out' ? 'drawer-slide-out-right' : ''}`}>
            <div className="flex flex-col h-full">
              {/* Header do Drawer */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{selectedMonitoring.contextIcon}</div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedMonitoring.contextName}</h2>
                    <p className="text-sm text-gray-400">Detalhes do Monitoramento</p>
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Conteúdo do Drawer */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Estatísticas */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Estatísticas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-400">{selectedMonitoring.totalFound}</div>
                      <div className="text-sm text-gray-300">Total Encontrado</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400">
                        {new Date(selectedMonitoring.lastFound).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-sm text-gray-300">Última Descoberta</div>
                    </div>
                  </div>
                </div>

                {/* Configurações */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Configurações</h3>
                  <div className="bg-white/5 rounded-lg p-4">
                    {selectedMonitoring.contextId === 'concursos' && (
                      <div className="space-y-2">
                        <div><span className="text-gray-300">Diários:</span> <span className="text-white">{selectedMonitoring.configurations.diarios.join(', ')}</span></div>
                        <div><span className="text-gray-300">Tipo:</span> <span className="text-white">{selectedMonitoring.configurations.tipo}</span></div>
                      </div>
                    )}
                    {selectedMonitoring.contextId === 'licitacoes' && (
                      <div className="space-y-2">
                        <div><span className="text-gray-300">Fonte:</span> <span className="text-white">{selectedMonitoring.configurations.fonte}</span></div>
                        <div><span className="text-gray-300">Categoria:</span> <span className="text-white">{selectedMonitoring.configurations.categoria}</span></div>
                        <div>
                          <span className="text-gray-300">Faixa de Valor:</span> 
                          <span className="text-white ml-2">
                            {selectedMonitoring.configurations.valorRangeType === 'predefined' 
                              ? predefinedRanges.find(r => r.id === selectedMonitoring.configurations.selectedPredefinedRange)?.label || 'Personalizado'
                              : `${formatCurrency(selectedMonitoring.configurations.valorMin)} - ${formatCurrency(selectedMonitoring.configurations.valorMax)}`
                            }
                          </span>
                        </div>
                      </div>
                    )}
                    {selectedMonitoring.contextId === 'leis' && (
                      <div className="space-y-2">
                        <div><span className="text-gray-300">Fonte:</span> <span className="text-white">{selectedMonitoring.configurations.fonte}</span></div>
                        <div><span className="text-gray-300">Tipos de Norma:</span> <span className="text-white">{selectedMonitoring.configurations.tiposNorma.join(', ')}</span></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Histórico */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Histórico de Descobertas</h3>
                    <div className="flex items-center gap-2">
                      {/* Mostrar botão de filtros apenas quando não há seleções */}
                      {getTotalSelectedCount() === 0 && (
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            showFilters 
                              ? 'bg-blue-600/40 text-blue-200 border border-blue-500/50' 
                              : 'bg-blue-600/20 text-blue-300 hover:bg-blue-600/30'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                          </svg>
                          Filtros
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Barra de ações - aparece sempre que há itens no histórico, mas não quando filtros estão abertos */}
                  {selectedMonitoring.history.length > 0 && !showFilters && (
                    <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">
                            {getTotalSelectedCount()} item(s) selecionado(s)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Botão "Selecionar todos" - sempre visível quando há itens */}
                          <button
                            onClick={() => {
                              const allItemIds = selectedMonitoring.history.map(item => item.id);
                              const newSelection: {[key: string]: boolean} = {};
                              allItemIds.forEach(id => {
                                newSelection[id] = true;
                              });
                              setSelectedItems(newSelection);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg text-sm transition-colors border border-white/20"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Selecionar todos
                          </button>
                          
                          {/* Botões de ação - só aparecem quando há seleções */}
                          {getTotalSelectedCount() > 0 && (
                            <>
                              <button
                                onClick={clearSelection}
                                className="flex items-center gap-2 px-3 py-2 bg-white/5 text-gray-300 hover:bg-white/10 rounded-lg text-sm transition-colors border border-white/10"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Limpar seleção
                              </button>
                              <button
                                onClick={() => {
                                  const selectedIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
                                  selectedIds.forEach(id => markItemAsRead(id));
                                  clearSelection();
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-green-600/30 text-green-200 hover:bg-green-600/40 rounded-lg text-sm transition-colors border border-green-500/30"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Marcar como lido
                              </button>
                              <button
                                onClick={() => deleteSelectedItems(selectedMonitoring.id)}
                                className="flex items-center gap-2 px-3 py-2 bg-red-600/30 text-red-200 hover:bg-red-600/40 rounded-lg text-sm transition-colors border border-red-500/30"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Excluir
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Painel de Filtros */}
                  {showFilters && (
                    <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Busca por texto */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Buscar
                          </label>
                          <div className="relative group">
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Buscar por título"
                              className="w-full bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/50 rounded-2xl pl-4 pr-12 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/70 transition-all duration-300 hover:from-gray-700/60 hover:to-gray-600/60 hover:border-gray-500/70 shadow-lg hover:shadow-xl"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Filtro por status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Status
                          </label>
                          <div className="relative group">
                            <select
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'read' | 'unread')}
                              className="w-full bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/50 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/70 transition-all duration-300 appearance-none cursor-pointer hover:from-gray-700/60 hover:to-gray-600/60 hover:border-gray-500/70 shadow-lg hover:shadow-xl"
                            >
                              <option value="all" className="bg-gray-800 text-white">Todos</option>
                              <option value="unread" className="bg-gray-800 text-white">Não lidos</option>
                              <option value="read" className="bg-gray-800 text-white">Lidos</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Filtro por data */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Período
                          </label>
                          <div className="relative group">
                            <select
                              value={filterDateRange}
                              onChange={(e) => setFilterDateRange(e.target.value as 'all' | 'today' | 'week' | 'month')}
                              className="w-full bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/50 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/70 transition-all duration-300 appearance-none cursor-pointer hover:from-gray-700/60 hover:to-gray-600/60 hover:border-gray-500/70 shadow-lg hover:shadow-xl"
                            >
                              <option value="all" className="bg-gray-800 text-white">Todos</option>
                              <option value="today" className="bg-gray-800 text-white">Hoje</option>
                              <option value="week" className="bg-gray-800 text-white">Última semana</option>
                              <option value="month" className="bg-gray-800 text-white">Último mês</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Botões de ação dos filtros */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                        <button
                          onClick={() => {
                            setFilterStatus('all');
                            setFilterDateRange('all');
                            setSearchTerm('');
                            clearSelection();
                          }}
                          className="px-4 py-2 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded-lg text-sm transition-colors"
                        >
                          Limpar filtros
                        </button>
                        <button
                          onClick={() => setShowFilters(false)}
                          className="px-4 py-2 bg-gray-600/20 text-gray-300 hover:bg-gray-600/30 rounded-lg text-sm transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Contador de resultados */}
                  <div className="mb-4 text-sm text-gray-400">
                    Mostrando {getFilteredHistory(selectedMonitoring.history).length} de {selectedMonitoring.history.length} itens
                    {(filterStatus !== 'all' || filterDateRange !== 'all' || searchTerm) && (
                      <span className="ml-2 text-blue-400">(filtrados)</span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {getFilteredHistory(selectedMonitoring.history).length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-lg font-medium mb-2">Nenhum item encontrado</p>
                        <p className="text-sm">
                          {searchTerm || filterStatus !== 'all' || filterDateRange !== 'all' 
                            ? 'Tente ajustar os filtros para ver mais resultados'
                            : 'Não há descobertas neste monitoramento ainda'
                          }
                        </p>
                      </div>
                    ) : (
                      getFilteredHistory(selectedMonitoring.history).map((item: MockSummary, index: number) => (
                      <div key={item.id} className="bg-white/5 rounded-lg transition-all duration-300 hover:bg-white/10">
                        {/* Header do item */}
                        <div className="p-4 flex items-center gap-3">
                          {/* Checkbox de seleção */}
                          <input
                            type="checkbox"
                            checked={selectedItems[item.id] || false}
                            onChange={() => toggleItemSelection(item.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          
                          {/* Conteúdo principal */}
                          <button
                            onClick={() => toggleItemExpansion(item.id)}
                            className="flex-1 text-left flex items-center justify-between hover:bg-white/5 rounded-lg transition-colors p-2 -m-2"
                            aria-expanded={expandedItems[item.id] || false}
                            aria-controls={`item-${item.id}`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-white font-medium truncate">{item.title}</h4>
                                {!item.isRead && (
                                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                            <div className="flex items-center text-xs text-gray-400">
                              <span className="mr-4">Fonte: {item.source}</span>
                              <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                            <div className="ml-4 flex items-center gap-2">
                              <span className="text-sm text-gray-400">Ver conteúdo</span>
                              <svg 
                                className={`w-4 h-4 text-blue-400 transition-transform duration-200 ${
                                  expandedItems[item.id] ? 'rotate-180' : ''
                                }`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>
                        </div>

                        {/* Conteúdo expandido */}
                        {expandedItems[item.id] && (
                          <div 
                            id={`item-${item.id}`}
                            className="px-4 pb-4 border-t border-white/10 animate-in slide-in-from-top-2 duration-300"
                          >
                            <div className="pt-4">
                              {/* Grid de metadados responsivo */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {item.contextType === 'concursos' && (
                                  <>
                                    <div><span className="text-gray-400 text-sm">Instituição:</span> <span className="text-white text-sm">{item.details.instituicao}</span></div>
                                    <div><span className="text-gray-400 text-sm">Cargos:</span> <span className="text-white text-sm">{item.details.cargos.join(', ')}</span></div>
                                    <div><span className="text-gray-400 text-sm">Vagas:</span> <span className="text-white text-sm">{item.details.vagas}</span></div>
                                    <div><span className="text-gray-400 text-sm">Salário:</span> <span className="text-white text-sm">{item.details.salario}</span></div>
                                    <div><span className="text-gray-400 text-sm">Inscrições:</span> <span className="text-white text-sm">{item.details.inscricaoInicio} a {item.details.inscricaoFim}</span></div>
                                    <div><span className="text-gray-400 text-sm">Taxa:</span> <span className="text-white text-sm">{item.details.taxaInscricao}</span></div>
                                    <div><span className="text-gray-400 text-sm">Data da Prova:</span> <span className="text-white text-sm">{item.details.dataProva}</span></div>
                                  </>
                                )}
                                {item.contextType === 'licitacoes' && (
                                  <>
                                    <div><span className="text-gray-400 text-sm">Órgão:</span> <span className="text-white text-sm">{item.details.orgao}</span></div>
                                    <div><span className="text-gray-400 text-sm">Modalidade:</span> <span className="text-white text-sm">{item.details.modalidade}</span></div>
                                    <div><span className="text-gray-400 text-sm">Objeto:</span> <span className="text-white text-sm">{item.details.objeto}</span></div>
                                    <div><span className="text-gray-400 text-sm">Categoria:</span> <span className="text-white text-sm">{item.details.categoria}</span></div>
                                    <div><span className="text-gray-400 text-sm">Valor Estimado:</span> <span className="text-white text-sm">{item.details.valorEstimado}</span></div>
                                    <div><span className="text-gray-400 text-sm">Entrega Propostas:</span> <span className="text-white text-sm">{item.details.entregaPropostasAte}</span></div>
                                    <div><span className="text-gray-400 text-sm">Sessão Pública:</span> <span className="text-white text-sm">{item.details.sessaoPublicaEm}</span></div>
                                  </>
                                )}
                                {item.contextType === 'leis' && (
                                  <>
                                    <div><span className="text-gray-400 text-sm">Ente:</span> <span className="text-white text-sm">{item.details.ente}</span></div>
                                    <div><span className="text-gray-400 text-sm">Tipo:</span> <span className="text-white text-sm">{item.details.tipoNorma}</span></div>
                                    <div><span className="text-gray-400 text-sm">Número:</span> <span className="text-white text-sm">{item.details.numero}/{item.details.ano}</span></div>
                                    <div><span className="text-gray-400 text-sm">Ementa:</span> <span className="text-white text-sm">{item.details.ementa}</span></div>
                                    <div><span className="text-gray-400 text-sm">Assuntos:</span> <span className="text-white text-sm">{item.details.assuntos.join(', ')}</span></div>
                                    <div><span className="text-gray-400 text-sm">Publicação:</span> <span className="text-white text-sm">{item.details.dataPublicacao}</span></div>
                                  </>
                                )}
                              </div>

                              {/* Resumo da IA */}
                              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-lg p-4 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  <span className="text-sm font-medium text-blue-300">Resumo da IA</span>
                                </div>
                                <p className="text-sm text-gray-200 leading-relaxed">{item.details.resumo}</p>
                              </div>

                              {/* Botões de ação */}
                              <div className="flex flex-wrap gap-2">
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded-lg text-sm transition-colors"
                                >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                                  Visualizar fonte
                                </a>
                                <button
                                  onClick={() => copySummary(item.details.resumo)}
                                  className="flex items-center gap-2 px-3 py-2 bg-green-600/20 text-green-300 hover:bg-green-600/30 rounded-lg text-sm transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  Copiar resumo
                          </button>
                                {!item.isRead && (
                                  <button
                                    onClick={() => markItemAsRead(selectedMonitoring.id, item.id)}
                                    className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 rounded-lg text-sm transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Marcar como lido
                                  </button>
                                )}
                        </div>
                      </div>
                  </div>
                        )}
                      </div>
                    ))
                    )}
                  </div>
                </div>
              </div>

              {/* Footer do Drawer */}
              <div className="p-6 border-t border-gray-700">
                <div className="flex justify-center">
                  <button
                    onClick={closeDrawer}
                    className="w-full bg-gray-600 text-white hover:bg-gray-500 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast de notificação */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-2 duration-300">
          <div className={`px-6 py-4 rounded-lg shadow-lg border backdrop-blur-sm ${
            toast.type === 'success' 
              ? 'bg-green-600/20 border-green-500/30 text-green-300' 
              : toast.type === 'error'
              ? 'bg-red-600/20 border-red-500/30 text-red-300'
              : 'bg-blue-600/20 border-blue-500/30 text-blue-300'
          }`}>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {toast.type === 'success' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {toast.type === 'error' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {toast.type === 'info' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="flex-shrink-0 ml-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Cadastro Rápido"
        subtitle="Crie sua conta para começar a usar o Radar IA"
        onSuccess={() => {
          setIsRegisterModalOpen(false);
          // Após cadastro, criar o monitoramento
          handleCreateMonitoring();
        }}
      />

      <Suspense fallback={<div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div></div>}>
        <GuidedOnboarding
          hasExistingMonitorings={monitorings.length > 0}
          onComplete={handleOnboardingComplete}
          onCreateMonitoring={handleCreateMonitoring}
          onClearSelections={handleClearSelections}
          onCloseConfig={handleCloseConfig}
          isConfigValid={useCallback(() => {
            let isValid = false;
            
            if (selectedContext === 'concursos') {
              isValid = selectedDiarios.length > 0;
              console.log('Concursos validation:', { selectedDiarios: selectedDiarios.length, isValid });
            } else if (selectedContext === 'licitacoes') {
              const hasDiarios = selectedDiarios.length > 0;
              const hasCategoria = selectedCategoria && selectedCategoria !== '';
              const hasFonte = selectedFonte && selectedFonte !== '';
              isValid = hasDiarios && hasCategoria && hasFonte;
              
              console.log('Licitações validation:', { 
                hasDiarios, 
                hasCategoria, 
                hasFonte,
                selectedCategoria: `"${selectedCategoria}"`,
                selectedFonte: `"${selectedFonte}"`,
                isValid 
              });
            } else if (selectedContext === 'leis') {
              const hasDiarios = selectedDiarios.length > 0;
              const hasTiposNorma = selectedTiposNorma.length > 0;
              isValid = hasDiarios && hasTiposNorma;
              
              console.log('Leis validation:', { 
                hasDiarios, 
                hasTiposNorma,
                selectedTiposNorma,
                isValid 
              });
            }
            
            return isValid;
          }, [selectedContext, selectedDiarios, selectedCategoria, selectedFonte, selectedTiposNorma])}
        />
      </Suspense>

      {/* Test Modal */}
      <TestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
      
    </div>
  );
}


