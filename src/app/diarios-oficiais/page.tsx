'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import RegisterModal from '@/components/RegisterModal';

// Registrar o locale português brasileiro
registerLocale('pt-BR', ptBR);
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  DocumentTextIcon,
  XMarkIcon,
  PlusIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  LinkIcon,
  TrashIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import TransparentHeader from '@/components/TransparentHeader';

export default function DiariosOficiais() {
  const [activeTab, setActiveTab] = useState('buscar');
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [selectedDiarios, setSelectedDiarios] = useState<string[]>([]);
  const [searchPeriod, setSearchPeriod] = useState('7d');
  const [customDateRange, setCustomDateRange] = useState({ start: undefined as Date | undefined, end: undefined as Date | undefined });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{
    id: number;
    title: string;
    source: string;
    date: string;
    excerpt: string;
    url: string;
  }>>([]);
  const [diarioSearchTerm, setDiarioSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [showDiarioDropdown, setShowDiarioDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [monitorTerm, setMonitorTerm] = useState<string | null>(null);
  const [monitorDiarios, setMonitorDiarios] = useState<string[]>([]);
  const [monitoramentos, setMonitoramentos] = useState<Array<{
    id: number;
    terms: string[];
    diarios: string[];
    isActive: boolean;
    createdAt: string;
    occurrences: number;
  }>>([
    {
      id: 1,
      terms: ['concurso público', 'edital'],
      diarios: ['DOU', 'DOSP'],
      isActive: true,
      createdAt: '2024-01-10',
      occurrences: 15
    },
    {
      id: 2,
      terms: ['licitação', 'pregão'],
      diarios: ['DOU', 'DOM'],
      isActive: true,
      createdAt: '2024-01-08',
      occurrences: 8
    },
    {
      id: 3,
      terms: ['nomeação', 'decreto'],
      diarios: ['DOU'],
      isActive: false,
      createdAt: '2024-01-05',
      occurrences: 3
    }
  ]);
  const [selectedDiario, setSelectedDiario] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [navegarExpandedCategories, setNavegarExpandedCategories] = useState<{[key: string]: boolean}>({});
  const [navegarDiarioSearchTerm, setNavegarDiarioSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const [sectionAnimations, setSectionAnimations] = useState<{[key: string]: string}>({});
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<{
    id: number;
    title: string;
    source: string;
    date: string;
    excerpt: string;
    url: string;
  } | null>(null);
  const [newMonitorTerm, setNewMonitorTerm] = useState('');
  const [monitorTermInput, setMonitorTermInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [editingMonitor, setEditingMonitor] = useState<number | null>(null);
  const [showMonitorDrawer, setShowMonitorDrawer] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [hasClickedCreateMonitor, setHasClickedCreateMonitor] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<{
    id: number;
    terms: string[];
    diarios: string[];
    isActive: boolean;
    createdAt: string;
    occurrences: number;
  } | null>(null);
  const [inputTimeout, setInputTimeout] = useState<NodeJS.Timeout | null>(null);
  const [monitorExpandedCategories, setMonitorExpandedCategories] = useState<{[key: string]: boolean}>({});
  const [monitorDiarioSearchTerm, setMonitorDiarioSearchTerm] = useState('');
  const [drawerAnimation, setDrawerAnimation] = useState<'slide-in' | 'slide-out' | null>(null);
  const [monitorDrawerAnimation, setMonitorDrawerAnimation] = useState<'slide-in' | 'slide-out' | null>(null);
  
  // Estados para nova estrutura hierárquica
  const [expandedPoderes, setExpandedPoderes] = useState<{[key: string]: boolean}>({});
  const [expandedSubcategorias, setExpandedSubcategorias] = useState<{[key: string]: boolean}>({});
  const [monitorExpandedPoderes, setMonitorExpandedPoderes] = useState<{[key: string]: boolean}>({});
  const [monitorExpandedSubcategorias, setMonitorExpandedSubcategorias] = useState<{[key: string]: boolean}>({});
  const [navegarExpandedPoderes, setNavegarExpandedPoderes] = useState<{[key: string]: boolean}>({});
  const [navegarExpandedSubcategorias, setNavegarExpandedSubcategorias] = useState<{[key: string]: boolean}>({});

  const tabs = [
    { id: 'buscar', label: 'Buscar termos', icon: MagnifyingGlassIcon },
    { id: 'monitorar', label: 'Monitorar termos', icon: BellIcon },
    { id: 'navegar', label: 'Navegar entre os diários', icon: DocumentTextIcon }
  ];

  // Nova estrutura organizada por poderes
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
      ],
      'Justiça Estadual': [
        { id: 'dje-sp', name: 'Diário da Justiça SP' },
        { id: 'dje-rj', name: 'Diário da Justiça RJ' },
        { id: 'dje-mg', name: 'Diário da Justiça MG' },
        { id: 'dje-rs', name: 'Diário da Justiça RS' },
      ]
    },
    'Poder Legislativo': {
      'Tribunais de Contas': [
        { id: 'tcu', name: 'Tribunal de Contas da União (TCU)' },
        { id: 'tce-sp', name: 'Tribunal de Contas SP' },
        { id: 'tce-rj', name: 'Tribunal de Contas RJ' },
        { id: 'tce-mg', name: 'Tribunal de Contas MG' },
      ],
      'Assembleias Legislativas': [
        { id: 'al-sp', name: 'Assembleia Legislativa SP' },
        { id: 'al-rj', name: 'Assembleia Legislativa RJ' },
        { id: 'al-mg', name: 'Assembleia Legislativa MG' },
        { id: 'al-rs', name: 'Assembleia Legislativa RS' },
      ],
      'Câmaras de Vereadores': [
        { id: 'cm-sp', name: 'Câmara Municipal SP' },
        { id: 'cm-rj', name: 'Câmara Municipal RJ' },
        { id: 'cm-bh', name: 'Câmara Municipal BH' },
        { id: 'cm-recife', name: 'Câmara Municipal Recife' },
      ]
    },
    'Ministério Público': [
      { id: 'mpu', name: 'Ministério Público da União (MPU)' },
      { id: 'mpsp', name: 'Ministério Público SP' },
      { id: 'mprj', name: 'Ministério Público RJ' },
      { id: 'mpmg', name: 'Ministério Público MG' },
    ],
    'Defensoria Pública': [
      { id: 'dpu', name: 'Defensoria Pública da União (DPU)' },
      { id: 'dpe-sp', name: 'Defensoria Pública SP' },
      { id: 'dpe-rj', name: 'Defensoria Pública RJ' },
      { id: 'dpe-mg', name: 'Defensoria Pública MG' },
    ]
  };

  // Função para converter estrutura hierárquica em lista plana (para compatibilidade)
  const diarios = Object.entries(diariosPorPoder).flatMap(([poder, subcategorias]) => {
    if (Array.isArray(subcategorias)) {
      // Para MP e DP que são arrays diretos
      return subcategorias.map(diario => ({
        ...diario,
        poder,
        category: poder
      }));
    } else {
      // Para poderes com subcategorias
      return Object.entries(subcategorias).flatMap(([subcategoria, diariosList]) =>
        diariosList.map(diario => ({
          ...diario,
          poder,
          subcategoria,
          category: `${poder} - ${subcategoria}`
        }))
      );
    }
  });

  const periodOptions = [
    { value: 'today', label: 'Hoje' },
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: 'custom', label: 'Personalizado' }
  ];

  // Funções auxiliares
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    if (value.trim()) {
      const terms = value.split(',').map(t => t.trim()).filter(t => t);
      setSearchTerms(terms);
      setShowDiarioDropdown(true);
    } else {
      setSearchTerms([]);
      setShowDiarioDropdown(false);
      setShowDateFilters(false);
    }
  };

  const handleRemoveSearchTerm = (index: number) => {
    const newTerms = searchTerms.filter((_, i) => i !== index);
    setSearchTerms(newTerms);
    if (newTerms.length === 0) {
      setSearchInput('');
      setShowDiarioDropdown(false);
      setShowDateFilters(false);
    } else {
      setSearchInput(newTerms.join(', '));
    }
  };

  const handleDiarioSelect = (diarioId: string) => {
    if (selectedDiarios.includes(diarioId)) {
      setSelectedDiarios(selectedDiarios.filter(id => id !== diarioId));
    } else {
      setSelectedDiarios([...selectedDiarios, diarioId]);
    }
  };

  const handleDiarioRemove = (diarioId: string) => {
    setSelectedDiarios(selectedDiarios.filter(id => id !== diarioId));
  };

  const handlePeriodSelect = (period: string) => {
    setSearchPeriod(period);
    if (period === 'custom') {
      setShowCustomDateRange(true);
    } else {
      setShowCustomDateRange(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleMonitorCategory = (category: string) => {
    setMonitorExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleNavegarCategory = (category: string) => {
    setNavegarExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Funções de toggle para nova estrutura hierárquica
  const togglePoder = (poder: string, tab: 'buscar' | 'monitorar' | 'navegar') => {
    const setter = tab === 'buscar' ? setExpandedPoderes : 
                   tab === 'monitorar' ? setMonitorExpandedPoderes : 
                   setNavegarExpandedPoderes;
    
    setter(prev => ({
      ...prev,
      [poder]: !prev[poder]
    }));
  };

  const toggleSubcategoria = (poder: string, subcategoria: string, tab: 'buscar' | 'monitorar' | 'navegar') => {
    const key = `${poder}-${subcategoria}`;
    const setter = tab === 'buscar' ? setExpandedSubcategorias : 
                   tab === 'monitorar' ? setMonitorExpandedSubcategorias : 
                   setNavegarExpandedSubcategorias;
    
    setter(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleSections = (editionId: string) => {
    const isCurrentlyExpanded = expandedSections[editionId];
    
    if (isCurrentlyExpanded) {
      // Se está expandido, iniciar animação de fade-out
      setSectionAnimations(prev => ({
        ...prev,
        [editionId]: 'sections-fade-out'
      }));
      
      // Após a animação, colapsar e limpar a animação
      setTimeout(() => {
        setExpandedSections(prev => ({
          ...prev,
          [editionId]: false
        }));
        setSectionAnimations(prev => ({
          ...prev,
          [editionId]: ''
        }));
      }, 300); // Duração da animação
    } else {
      // Se está colapsado, expandir e iniciar animação de fade-in
      setExpandedSections(prev => ({
        ...prev,
        [editionId]: true
      }));
      
      // Pequeno delay para garantir que o DOM foi atualizado
      setTimeout(() => {
        setSectionAnimations(prev => ({
          ...prev,
          [editionId]: 'sections-fade-in'
        }));
      }, 10);
    }
  };


  // Funções para controlar animações dos drawers
  const openDrawer = () => {
    setDrawerAnimation('slide-in');
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setDrawerAnimation('slide-out');
    setTimeout(() => {
      setShowDrawer(false);
      setDrawerAnimation(null);
    }, 300); // Duração da animação
  };

  const openMonitorDrawer = () => {
    setMonitorDrawerAnimation('slide-in');
    setShowMonitorDrawer(true);
  };

  const closeMonitorDrawer = () => {
    setMonitorDrawerAnimation('slide-out');
    setTimeout(() => {
      setShowMonitorDrawer(false);
      setMonitorDrawerAnimation(null);
    }, 300); // Duração da animação
  };


  const getSelectedDiariosNames = () => {
    return selectedDiarios.map(id => {
      const diario = diarios.find(d => d.id === id);
      return diario ? diario.name : id;
    });
  };

  // Effect para controlar showDateFilters baseado em selectedDiarios
  useEffect(() => {
    if (selectedDiarios.length > 0) {
      setShowDateFilters(true);
    } else {
      setShowDateFilters(false);
    }
  }, [selectedDiarios]);

  // Effect para limpar timeout quando componente for desmontado
  useEffect(() => {
    return () => {
      if (inputTimeout) {
        clearTimeout(inputTimeout);
      }
    };
  }, [inputTimeout]);

  const handleSearch = async () => {
    if (searchTerms.length === 0 || selectedDiarios.length === 0) return;
    
    // Verificar se usuário está logado
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      setIsRegisterModalOpen(true);
      return;
    }
    
    setIsSearching(true);
    
    // Simular busca com dados mockados
    setTimeout(() => {
      const mockResults = [
        {
          id: 1,
          title: 'Edital de Concurso Público - Secretaria de Educação',
          source: 'DOU',
          date: '2024-01-15',
          excerpt: 'A Secretaria de Educação torna público o edital de concurso público para provimento de vagas...',
          url: '#'
        },
        {
          id: 2,
          title: 'Pregão Eletrônico nº 001/2024 - Material de Escritório',
          source: 'DOSP',
          date: '2024-01-14',
          excerpt: 'Pregão eletrônico para aquisição de material de escritório conforme especificações...',
          url: '#'
        },
        {
          id: 3,
          title: 'Nomeação de Servidores - Decreto nº 12345',
          source: 'DOU',
          date: '2024-01-13',
          excerpt: 'O Presidente da República, no uso das atribuições que lhe confere o art. 84...',
          url: '#'
        },
        {
          id: 4,
          title: 'Lei Municipal nº 5.432/2024 - Criação de Cargos',
          source: 'DOM',
          date: '2024-01-12',
          excerpt: 'Dispõe sobre a criação de cargos efetivos na estrutura organizacional da Prefeitura Municipal...',
          url: '#'
        },
        {
          id: 5,
          title: 'Tomada de Preços nº 002/2024 - Serviços de Limpeza',
          source: 'DOSP',
          date: '2024-01-11',
          excerpt: 'Tomada de preços para contratação de serviços de limpeza e conservação de prédios públicos...',
          url: '#'
        },
        {
          id: 6,
          title: 'Concurso Público - Tribunal de Justiça',
          source: 'DOU',
          date: '2024-01-10',
          excerpt: 'Abertura de concurso público para provimento de vagas de Analista Judiciário...',
          url: '#'
        },
        {
          id: 7,
          title: 'Licitação - Aquisição de Medicamentos',
          source: 'DOU',
          date: '2024-01-09',
          excerpt: 'Pregão eletrônico para aquisição de medicamentos para o programa de saúde pública...',
          url: '#'
        },
        {
          id: 8,
          title: 'Portaria nº 789/2024 - Regulamentação',
          source: 'DOU',
          date: '2024-01-08',
          excerpt: 'Regulamenta o funcionamento dos órgãos de fiscalização e controle interno...',
          url: '#'
        }
      ];
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 2000);
  };

  const handleSaveAsMonitor = async () => {
    try {
      // TODO: Implementar chamada para API real
      console.log('Salvando monitoramento:', { terms: searchTerms, diarios: selectedDiarios });
      
      const newMonitoramento = {
        id: Date.now(),
        terms: searchTerms,
        diarios: selectedDiarios,
        isActive: true,
        createdAt: new Date().toISOString(),
        occurrences: 0 // Será atualizado pela API
      };
      setMonitoramentos([...monitoramentos, newMonitoramento]);
      showToastMessage('Monitoramento criado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar monitoramento:', error);
      showToastMessage('Erro ao salvar monitoramento. Tente novamente.');
    }
  };

  // Função para filtrar diários na nova estrutura hierárquica
  const getFilteredDiariosPorPoder = (searchTerm: string) => {
    const filtered = JSON.parse(JSON.stringify(diariosPorPoder)); // Deep clone
    
    if (!searchTerm) return filtered;
    
    const term = searchTerm.toLowerCase();
    
    // Filtrar cada poder
    Object.keys(filtered).forEach(poder => {
      if (Array.isArray(filtered[poder])) {
        // Para MP e DP (arrays diretos)
        filtered[poder] = filtered[poder].filter((diario: { id: string; name: string }) => 
          diario.name.toLowerCase().includes(term)
        );
      } else {
        // Para poderes com subcategorias
        Object.keys(filtered[poder]).forEach(subcategoria => {
          filtered[poder][subcategoria] = filtered[poder][subcategoria].filter((diario: { id: string; name: string }) => 
            diario.name.toLowerCase().includes(term)
          );
        });
      }
    });
    
    return filtered;
  };

  const filteredDiariosPorPoder = getFilteredDiariosPorPoder(diarioSearchTerm);

  // Filtros para aba de monitoramentos
  const filteredMonitorDiariosPorPoder = getFilteredDiariosPorPoder(monitorDiarioSearchTerm);

  // Filtros para aba Navegar
  const filteredNavegarDiariosPorPoder = getFilteredDiariosPorPoder(navegarDiarioSearchTerm);

  // Função para verificar se um diário tem múltiplas seções
  const hasMultipleSections = (diarioId: string) => {
    const diariosComMultiplasSecoes = [
      'dou', // Diário Oficial da União - tem múltiplas seções
      'dju', // Diário da Justiça da União - pode ter múltiplas seções
      'dje', // Diário da Justiça Eleitoral - pode ter múltiplas seções
      'djt'  // Diário da Justiça do Trabalho - pode ter múltiplas seções
    ];
    return diariosComMultiplasSecoes.includes(diarioId);
  };

  // Funções da aba Monitorar
  const processAndAddTerms = (input: string) => {
    if (!input.trim()) return;
    
    // Suporta múltiplos separadores: vírgula, espaço, quebra de linha, ponto e vírgula
    const terms = input.split(/[,\s\n;]+/)
      .map(term => term.trim())
      .filter(term => term && term.length > 1);
    
    if (terms.length > 0) {
      // Para simplificar, vamos usar apenas o primeiro termo
      setMonitorTerm(terms[0]);
      setValidationError('');
    }
    
    setMonitorTermInput('');
  };

  const handleAddMonitorTerm = (term: string) => {
    processAndAddTerms(term);
  };

  const handleRemoveMonitorTerm = () => {
    setMonitorTerm('');
    setValidationError('');
  };

  const handleTermInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const term = e.key === ',' ? monitorTermInput.slice(0, -1) : monitorTermInput;
      handleAddMonitorTerm(term);
    }
  };

  const handleTermInputChange = (value: string) => {
    setMonitorTermInput(value);
    setValidationError('');
    
    // Limpa timeout anterior se existir
    if (inputTimeout) {
      clearTimeout(inputTimeout);
    }
    
    // Adiciona termo imediatamente se detectar separadores
    if (value.includes(',') || value.includes(';') || value.includes('\n')) {
      processAndAddTerms(value);
      return;
    }
    
    // Adiciona termo após pausa de 1.5 segundos (se tiver pelo menos 3 caracteres)
    if (value.trim().length >= 3) {
      const timeout = setTimeout(() => {
        processAndAddTerms(value);
      }, 1500);
      setInputTimeout(timeout);
    }
  };

  const handleCreateMonitoramento = () => {
    setValidationError('');
    setHasClickedCreateMonitor(true);
    
    // Verificar se usuário está logado
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      setIsRegisterModalOpen(true);
      return;
    }
    
    if (!monitorTerm || !monitorTerm.trim()) {
      setValidationError('Adicione um termo para monitorar');
      return;
    }
    
    if (monitorDiarios.length === 0) {
      setValidationError('Selecione pelo menos 1 diário oficial');
      return;
    }
    
    const newMonitoramento = {
      id: Date.now(),
      terms: [monitorTerm!.trim()],
      diarios: [...monitorDiarios],
      isActive: true,
      createdAt: new Date().toISOString(),
      occurrences: 0
    };
    
    setMonitoramentos([...monitoramentos, newMonitoramento]);
    setMonitorTerm('');
    setMonitorDiarios([]);
    setMonitorTermInput('');
    setShowCreateForm(false);
    showToastMessage('Monitoramento criado com sucesso!');
  };

  const handleToggleMonitoramento = (id: number) => {
    setMonitoramentos(monitoramentos.map(m => 
      m.id === id ? { ...m, isActive: !m.isActive } : m
    ));
  };

  const handleDeleteMonitoramento = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este monitoramento?')) {
      setMonitoramentos(monitoramentos.filter(m => m.id !== id));
      showToastMessage('Monitoramento excluído com sucesso!');
    }
  };

  const handleEditMonitoramento = (id: number) => {
    const monitor = monitoramentos.find(m => m.id === id);
    if (monitor) {
      setEditingMonitor(id);
      setMonitorTerm(monitor.terms[0] || '');
      setMonitorDiarios([...monitor.diarios]);
      setMonitorTermInput('');
    }
  };

  const handleSaveEditMonitoramento = () => {
    if (!monitorTerm || !monitorTerm.trim()) {
      setValidationError('Adicione um termo para monitorar');
      return;
    }
    
    if (monitorDiarios.length === 0) {
      setValidationError('Selecione pelo menos 1 diário oficial');
      return;
    }

    setMonitoramentos(monitoramentos.map(m => 
      m.id === editingMonitor 
        ? { ...m, terms: [monitorTerm!.trim()], diarios: [...monitorDiarios] }
        : m
    ));
    
    setEditingMonitor(null);
    setMonitorTerm('');
    setMonitorDiarios([]);
    setMonitorTermInput('');
    setValidationError('');
    setShowCreateForm(false);
    showToastMessage('Monitoramento atualizado com sucesso!');
  };

  const handleCancelEdit = () => {
    setEditingMonitor(null);
    setMonitorTerm('');
    setMonitorDiarios([]);
    setMonitorTermInput('');
    setValidationError('');
    setShowCreateForm(false);
    
    // Se não há monitoramentos, resetar o estado para mostrar a mensagem novamente
    if (monitoramentos.length === 0) {
      setHasClickedCreateMonitor(false);
    }
  };

  const handleInputBlur = () => {
    // Processa termos quando o usuário sai do campo
    if (monitorTermInput.trim().length >= 2) {
      processAndAddTerms(monitorTermInput);
    }
    
    // Limpa timeout se existir
    if (inputTimeout) {
      clearTimeout(inputTimeout);
      setInputTimeout(null);
    }
  };

  const handleInputFocus = () => {
    // Limpa timeout quando o usuário volta ao campo
    if (inputTimeout) {
      clearTimeout(inputTimeout);
      setInputTimeout(null);
    }
  };

  return (
    <div className="bg-transparent min-h-screen">
      <TransparentHeader currentPage="diarios-oficiais" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-8 sm:pt-28 sm:pb-12 md:pt-32 md:pb-16 lg:pt-36 fade-in-up">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
            <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-tight fade-in-delay-1">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400" style={{ lineHeight: '1.2', paddingBottom: '2px' }}>Diários Oficiais</span>
            </h1>
            <p className="mt-3 text-base text-gray-300 max-w-2xl mx-auto sm:text-lg sm:mt-4 fade-in-delay-2">
              Pesquise publicações, crie monitoramentos e navegue pelas edições oficiais.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 md:pb-24 fade-in-delay-3">
        {/* Segmented Control */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-1 inline-flex w-full sm:w-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-3 sm:p-4 md:p-6 card-hover-glow">
          {/* Buscar Tab */}
          {activeTab === 'buscar' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-lg font-semibold text-white sm:text-xl">Buscar Publicações</h3>
                <p className="text-sm text-gray-400 sm:text-base">Digite um termo e filtre por diários e período de publicação</p>
              </div>

              {/* Campo de busca principal */}
              <div className="input-with-icon">
                <MagnifyingGlassIcon className="input-icon h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  placeholder="ex.: concurso público"
                  className="input-standard text-base font-medium"
                  autoFocus
                />
              </div>

              {/* Barra de Filtros Ativos */}
              {(searchTerms.length > 0 || selectedDiarios.length > 0 || searchPeriod !== '') && (
                <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-300">Filtros Ativos</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {/* Termos de busca */}
                          {searchTerms.map((term, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full border border-blue-500/30 text-sm"
                            >
                              <span>🔍</span>
                              {term}
                              <button
                                onClick={() => handleRemoveSearchTerm(index)}
                                className="ml-1 hover:text-blue-200 transition-colors"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                          
                          {/* Diários selecionados */}
                          {selectedDiarios.map((diarioId) => {
                            const diario = diarios.find(d => d.id === diarioId);
                            return (
                              <span
                                key={diarioId}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-600/20 text-green-300 rounded-full border border-green-500/30 text-sm"
                              >
                                <span>📰</span>
                                {diario?.name}
                                <button
                                  onClick={() => handleDiarioRemove(diarioId)}
                                  className="ml-1 hover:text-green-200 transition-colors"
                                >
                                  <XMarkIcon className="h-3 w-3" />
                                </button>
                              </span>
                            );
                          })}
                          
                          {/* Período selecionado */}
                          {searchPeriod && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full border border-purple-500/30 text-sm">
                              <span>📅</span>
                              {searchPeriod === 'custom' ? 'Período personalizado' : periodOptions.find(p => p.value === searchPeriod)?.label}
                              <button
                                onClick={() => setSearchPeriod('')}
                                className="ml-1 hover:text-purple-200 transition-colors"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                  )}

              {/* Filtros com Reveal Animado */}
              {searchTerms.length > 0 && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                  {/* Seleção de Diários */}
                  <div>
                        <label className="block text-sm font-medium text-gray-300 mb-4">
                          Selecione os diários oficiais
                        </label>
                        
                        {/* Dropdown com busca */}
                        <div className="bg-white/5 border border-white/20 rounded-xl p-4 sm:p-6">
                          {/* Busca global */}
                          <div className="mb-6">
                            <div className="input-with-icon">
                              <MagnifyingGlassIcon className="input-icon h-5 w-5 text-gray-400" />
                              <input
                                type="text"
                                value={diarioSearchTerm}
                                onChange={(e) => setDiarioSearchTerm(e.target.value)}
                                placeholder="Buscar em todos os diários..."
                                className="input-standard text-base"
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
                                    onClick={() => togglePoder(poder, 'buscar')}
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
                                                className="w-4 h-4 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
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
                                              onClick={() => toggleSubcategoria(poder, subcategoria, 'buscar')}
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
                                                      className=""
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

                      </div>

                  {/* Filtros de data */}
                  <div>
                        <label className="block text-sm font-medium text-gray-300 mb-4">
                          Período de publicação
                        </label>
                        
                        {/* Botões de período */}
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                          {periodOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handlePeriodSelect(option.value)}
                              className={`px-3 py-2 sm:px-5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                                searchPeriod === option.value
                                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/20 hover:border-white/30'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>

                        {/* Date range picker customizado moderno */}
                        {showCustomDateRange && (
                          <div className="bg-white/5 border border-white/20 rounded-xl p-3 sm:p-4 animate-in slide-in-from-bottom-2 duration-300">
                            <h4 className="text-sm font-medium text-gray-300 mb-4 sm:mb-6 flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              Período personalizado
                            </h4>
                            <div className="flex flex-col sm:flex-row gap-6 items-end">
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-400 mb-2">Data inicial</label>
                                <div className="input-with-icon">
                                  <CalendarIcon className="input-icon h-5 w-5 text-gray-400" />
                                  <DatePicker
                                    selected={customDateRange.start}
                                    onChange={(date) => setCustomDateRange({...customDateRange, start: date || undefined})}
                                    selectsStart
                                    startDate={customDateRange.start}
                                    endDate={customDateRange.end}
                                    maxDate={new Date()}
                                    placeholderText="Selecione a data inicial"
                                    className="input-standard text-base w-full"
                                    dateFormat="dd/MM/yyyy"
                                    locale="pt-BR"
                                    showPopperArrow={false}
                                    popperClassName="react-datepicker-dark"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-400 mb-2">Data final</label>
                                <div className="input-with-icon">
                                  <CalendarIcon className="input-icon h-5 w-5 text-gray-400" />
                                  <DatePicker
                                    selected={customDateRange.end}
                                    onChange={(date) => setCustomDateRange({...customDateRange, end: date || undefined})}
                                    selectsEnd
                                    startDate={customDateRange.start}
                                    endDate={customDateRange.end}
                                    minDate={customDateRange.start}
                                    maxDate={new Date()}
                                    placeholderText="Selecione a data final"
                                    className="input-standard text-base w-full"
                                    dateFormat="dd/MM/yyyy"
                                    locale="pt-BR"
                                    showPopperArrow={false}
                                    popperClassName="react-datepicker-dark"
                                  />
                                </div>
                              </div>
                            </div>
                            {/* Exibição do período selecionado */}
                            {customDateRange.start && customDateRange.end && (
                              <div className="mt-4 p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                                <p className="text-sm text-blue-300 text-center">
                                  Período selecionado: {customDateRange.start.toLocaleDateString('pt-BR')} a {customDateRange.end.toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>


                  {/* Botão de busca - aparece após seleção de data */}
                  {showDateFilters && (
                    <div className="pt-4">
                            <button
                              onClick={handleSearch}
                              disabled={isSearching || searchTerms.length === 0 || selectedDiarios.length === 0}
                              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl disabled:shadow-none"
                            >
                              {isSearching ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  Buscando...
                                </>
                              ) : (
                                <>
                                  <MagnifyingGlassIcon className="h-5 w-5" />
                                  Buscar nos Diários Oficiais
                                </>
                              )}
                            </button>
                    </div>
                  )}
                </div>
              )}

              {/* Resultados em cards organizados */}
              {searchResults.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-lg font-semibold text-white sm:text-xl">
                      Resultados ({searchResults.length})
                    </h3>
                    <button
                      onClick={() => {
                        setSearchInput('');
                        setSearchTerms([]);
                        setSelectedDiarios([]);
                        setSearchResults([]);
                        setShowDiarioDropdown(false);
                        setShowDateFilters(false);
                        setShowCustomDateRange(false);
                      }}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Nova busca
                    </button>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {searchResults.map((result) => (
                          <div
                            key={result.id}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-all duration-200 hover:shadow-lg"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                                  {result.title}
                                </h4>
                                <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                                  <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
                                    {result.source}
                                  </span>
                                  <span>{result.date}</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                              {result.excerpt}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedPublication(result);
                                    openDrawer();
                                  }}
                                  className="px-4 py-2 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                  Ver mais
                                </button>
                                <button className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                  <ArrowDownTrayIcon className="h-4 w-4" />
                                  PDF
                                </button>
                              </div>
                              <button
                                onClick={handleSaveAsMonitor}
                                className="px-4 py-2 bg-green-600/20 text-green-300 hover:bg-green-600/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                              >
                                <BellIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                )}

              {/* Empty state */}
              {searchResults.length === 0 && !isSearching && searchTerms.length > 0 && selectedDiarios.length > 0 && (
                <div className="text-center py-8 sm:py-12">
                  <DocumentTextIcon className="h-10 w-10 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base font-semibold text-white mb-2 sm:text-lg">Nenhum resultado encontrado</h3>
                  <p className="text-sm text-gray-400">
                    Tente ampliar o período de busca, incluir mais diários ou usar termos diferentes.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Monitorar Tab */}
          {activeTab === 'monitorar' && (
            <div className="space-y-6">
              {/* Header com botão de alerta rápido */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white sm:text-xl">Monitoramentos</h3>
                  <p className="text-sm text-gray-400 sm:text-base">Gerencie seus alertas de palavras-chave</p>
                </div>
                {monitoramentos.length > 0 && (
                  <button
                    onClick={() => {
                      setShowCreateForm(true);
                      setMonitorTerm('');
                      setMonitorDiarios([]);
                      setMonitorTermInput('');
                      setValidationError('');
                      setEditingMonitor(null);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                  >
                    <PlusIcon className="h-3 w-3" />
                    <span className="hidden sm:inline">Adicionar novo alerta</span>
                    <span className="sm:hidden">Adicionar</span>
                  </button>
                )}
              </div>

              {/* Formulário de criação rápida */}
              {(showCreateForm || monitorTerm || monitorDiarios.length > 0 || monitorTermInput || editingMonitor !== null) && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    {editingMonitor !== null ? 'Editar monitoramento' : 'Criar monitoramento'}
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Termo
                      </label>
                      <div className="input-with-icon mb-2">
                        <MagnifyingGlassIcon className="input-icon h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={monitorTerm || ''}
                          onChange={(e) => setMonitorTerm(e.target.value)}
                          placeholder="Digite o termo para monitorar. Ex.: licitação, concurso, pregão"
                          className="input-standard text-base w-full"
                        />
                      </div>
                      {validationError && (
                        <p className="text-red-400 text-sm mt-2">{validationError}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Diários Oficiais
                      </label>
                      <div className="bg-white/5 border border-white/20 rounded-xl p-4">
                        {/* Busca global */}
                        <div className="mb-4">
                          <div className="input-with-icon">
                            <MagnifyingGlassIcon className="input-icon h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              value={monitorDiarioSearchTerm}
                              onChange={(e) => setMonitorDiarioSearchTerm(e.target.value)}
                              placeholder="Buscar em todos os diários..."
                              className="input-standard text-sm"
                            />
                          </div>
                        </div>

                        {/* Lista de diários por poder */}
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {Object.entries(filteredMonitorDiariosPorPoder).map(([poder, subcategorias]) => {
                            const totalDiarios = Array.isArray(subcategorias) 
                              ? subcategorias.length 
                              : Object.values(subcategorias as Record<string, any[]>).flat().length;
                            
                            return (
                              <div key={poder}>
                                <button
                                  onClick={() => togglePoder(poder, 'monitorar')}
                                  className="flex items-center justify-between w-full text-left py-2 px-2 text-gray-300 hover:text-white font-medium bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
                                >
                                  <span className="font-semibold text-sm">{poder} ({totalDiarios})</span>
                                  <span className="transform transition-transform duration-200 text-blue-400">
                                    {monitorExpandedPoderes[poder] ? '−' : '+'}
                                  </span>
                                </button>
                                
                                {monitorExpandedPoderes[poder] && (
                                  <div className="ml-3 space-y-2 mt-2">
                                    {Array.isArray(subcategorias) ? (
                                      // Para MP e DP (arrays diretos)
                                      <div className="space-y-1">
                                        {subcategorias.map((diario) => (
                                          <label key={diario.id} className="flex items-center gap-3 py-1.5 px-2 text-sm text-gray-300 hover:text-white cursor-pointer rounded-lg hover:bg-white/5 transition-all duration-200">
                                            <input
                                              type="checkbox"
                                              checked={monitorDiarios.includes(diario.id)}
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  setMonitorDiarios([...monitorDiarios, diario.id]);
                                                } else {
                                                  setMonitorDiarios(monitorDiarios.filter(id => id !== diario.id));
                                                }
                                              }}
                                              className="w-4 h-4 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
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
                                            onClick={() => toggleSubcategoria(poder, subcategoria, 'monitorar')}
                                            className="flex items-center justify-between w-full text-left py-1.5 px-2 text-gray-300 hover:text-white font-medium bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
                                          >
                                            <span className="font-medium text-xs">{subcategoria} ({diariosList.length})</span>
                                            <span className="transform transition-transform duration-200 text-blue-400">
                                              {monitorExpandedSubcategorias[`${poder}-${subcategoria}`] ? '−' : '+'}
                                            </span>
                                          </button>
                                          
                                          {monitorExpandedSubcategorias[`${poder}-${subcategoria}`] && (
                                            <div className="ml-3 space-y-1 mt-1">
                                              {diariosList.map((diario: { id: string; name: string }) => (
                                                <label key={diario.id} className="flex items-center gap-3 py-1 px-2 text-sm text-gray-300 hover:text-white cursor-pointer rounded-lg hover:bg-white/5 transition-all duration-200">
                                                  <input
                                                    type="checkbox"
                                                    checked={monitorDiarios.includes(diario.id)}
                                                    onChange={(e) => {
                                                      if (e.target.checked) {
                                                        setMonitorDiarios([...monitorDiarios, diario.id]);
                                                      } else {
                                                        setMonitorDiarios(monitorDiarios.filter(id => id !== diario.id));
                                                      }
                                                    }}
                                                    className=""
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
                    </div>

                    {/* Diários selecionados */}
                    {monitorDiarios.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Diários Selecionados ({monitorDiarios.length})
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {monitorDiarios.map((diarioId) => {
                            const diario = diarios.find(d => d.id === diarioId);
                            return (
                              <span
                                key={diarioId}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm border border-green-500/30"
                              >
                                <span>📰</span>
                                {diario?.name}
                                <button
                                  onClick={() => {
                                    setMonitorDiarios(monitorDiarios.filter(id => id !== diarioId));
                                  }}
                                  className="ml-1 hover:text-green-200 transition-colors"
                                >
                                  <XMarkIcon className="h-3 w-3" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      {editingMonitor !== null ? (
                        <>
                          <button
                            onClick={handleSaveEditMonitoramento}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
                          >
                            Salvar alterações
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={handleCreateMonitoramento}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            Criar monitoramento
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de monitoramentos */}
              <div className="space-y-4">
                {monitoramentos.length > 0 ? (
                  monitoramentos.filter(monitoramento => monitoramento.id !== editingMonitor).map((monitoramento) => {
                    const diariosNames = monitoramento.diarios.map(id => {
                      const diario = diarios.find(d => d.id === id);
                      return diario ? diario.name : id;
                    });
                    
                    return (
                      <div
                        key={monitoramento.id}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6 hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedMonitor(monitoramento);
                          openMonitorDrawer();
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h4 className="text-base font-semibold text-white sm:text-lg">
                                {monitoramento.terms.join(', ')}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                monitoramento.isActive 
                                  ? 'bg-green-600/20 text-green-300 border border-green-500/30' 
                                  : 'bg-red-600/20 text-red-300 border border-red-500/30'
                              }`}>
                                {monitoramento.isActive ? 'Ativo' : 'Pausado'}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-300 border border-blue-500/30">
                                Diária
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-2">
                              <span className="font-medium">Diários:</span> {diariosNames.join(', ')}
                            </p>
                            <p className="text-gray-400 text-xs">
                              Ocorrências: {monitoramento.occurrences} | Criado em: {new Date(monitoramento.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMonitor(monitoramento);
                                openMonitorDrawer();
                              }}
                              className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-600/10 rounded-lg transition-colors"
                              title="Ver histórico"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMonitoramento(monitoramento.id);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-600/10 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleMonitoramento(monitoramento.id);
                              }}
                              className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-600/10 rounded-lg transition-colors"
                              title={monitoramento.isActive ? 'Pausar' : 'Ativar'}
                            >
                              {monitoramento.isActive ? (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMonitoramento(monitoramento.id);
                              }}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  !hasClickedCreateMonitor && (
                    <div className="text-center py-8 sm:py-12">
                      <BellIcon className="h-10 w-10 text-gray-400 mx-auto mb-3 sm:mb-4" />
                      <h4 className="text-base font-semibold text-white mb-2 sm:text-lg">Você ainda não possui monitoramento de termos cadastrado.</h4>
                      <p className="text-sm text-gray-400 mb-4">Crie alertas para acompanhar termos específicos nos diários oficiais.</p>
                      <button 
                        onClick={() => {
                          setShowCreateForm(true);
                          setMonitorTermInput('');
                          setValidationError('');
                          setEditingMonitor(null);
                          setMonitorTerm('');
                          setHasClickedCreateMonitor(true);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Crie seu primeiro monitoramento
                      </button>
                      <p className="text-xs text-gray-500 mt-3">
                        💡 Você pode pausar ou editar o alerta quando quiser
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Navegar Tab */}
          {activeTab === 'navegar' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Header com botão fixo */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white sm:text-xl">Navegar Diários</h3>
                  <p className="text-sm text-gray-400 sm:text-base">Visualize e baixe edições oficiais</p>
                </div>
              </div>

              {/* Toolbar melhorada */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      Selecione o diário oficial
                    </label>
                    
                    {/* Dropdown com busca */}
                    <div className="bg-white/5 border border-white/20 rounded-xl p-4 sm:p-6">
                      {/* Busca global */}
                      <div className="mb-6">
                        <div className="input-with-icon">
                          <MagnifyingGlassIcon className="input-icon h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={navegarDiarioSearchTerm}
                            onChange={(e) => setNavegarDiarioSearchTerm(e.target.value)}
                            placeholder="Buscar em todos os diários..."
                            className="input-standard text-base"
                          />
                        </div>
                      </div>

                      {/* Lista de diários por poder */}
                      <div className="space-y-4 max-h-64 overflow-y-auto">
                        {Object.entries(filteredNavegarDiariosPorPoder).map(([poder, subcategorias]) => {
                          const totalDiarios = Array.isArray(subcategorias) 
                            ? subcategorias.length 
                            : Object.values(subcategorias as Record<string, any[]>).flat().length;
                          
                          return (
                            <div key={poder}>
                              <button
                                onClick={() => togglePoder(poder, 'navegar')}
                                className="flex items-center justify-between w-full text-left py-3 px-3 text-gray-300 hover:text-white font-medium bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
                              >
                                <span className="font-semibold text-sm">{poder} ({totalDiarios})</span>
                                <span className="transform transition-transform duration-200 text-blue-400">
                                  {navegarExpandedPoderes[poder] ? '−' : '+'}
                                </span>
                              </button>
                              
                              {navegarExpandedPoderes[poder] && (
                                <div className="ml-4 space-y-3 mt-2">
                                  {Array.isArray(subcategorias) ? (
                                    // Para MP e DP (arrays diretos)
                                    <div className="space-y-2">
                                      {subcategorias.map((diario) => (
                                        <label key={diario.id} className="flex items-center gap-3 py-2 px-3 text-sm text-gray-300 hover:text-white cursor-pointer rounded-lg hover:bg-white/5 transition-all duration-200">
                                          <input
                                            type="radio"
                                            name="navegar-diario"
                                            value={diario.id}
                                            checked={selectedDiario === diario.id}
                                            onChange={(e) => setSelectedDiario(e.target.value)}
                                            className="w-4 h-4 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
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
                                          onClick={() => toggleSubcategoria(poder, subcategoria, 'navegar')}
                                          className="flex items-center justify-between w-full text-left py-2 px-3 text-gray-300 hover:text-white font-medium bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
                                        >
                                          <span className="font-medium text-xs">{subcategoria} ({diariosList.length})</span>
                                          <span className="transform transition-transform duration-200 text-blue-400">
                                            {navegarExpandedSubcategorias[`${poder}-${subcategoria}`] ? '−' : '+'}
                                          </span>
                                        </button>
                                        
                                        {navegarExpandedSubcategorias[`${poder}-${subcategoria}`] && (
                                          <div className="ml-4 space-y-1 mt-2">
                                            {diariosList.map((diario: { id: string; name: string }) => (
                                              <label key={diario.id} className="flex items-center gap-3 py-2 px-3 text-sm text-gray-300 hover:text-white cursor-pointer rounded-lg hover:bg-white/5 transition-all duration-200">
                                                <input
                                                  type="radio"
                                                  name="navegar-diario"
                                                  value={diario.id}
                                                  checked={selectedDiario === diario.id}
                                                  onChange={(e) => setSelectedDiario(e.target.value)}
                                                  className=""
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
                    
                    {/* Botão de limpar seleção */}
                    {selectedDiario && (
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => setSelectedDiario('')}
                          className="px-3 py-2 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30 hover:border-gray-500/50 text-gray-300 hover:text-gray-200 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Limpar seleção
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      Data específica (opcional)
                    </label>
                    
                    <div className="bg-white/5 border border-white/20 rounded-xl p-4 sm:p-6">
                      <div className="input-with-icon">
                        <CalendarIcon className="input-icon h-5 w-5 text-gray-400" />
                        <DatePicker
                          selected={selectedDate ? new Date(selectedDate) : null}
                          onChange={(date) => setSelectedDate(date ? date.toISOString().split('T')[0] : '')}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Selecione uma data"
                          className="input-standard text-xs w-full"
                          locale="pt-BR"
                          maxDate={new Date()}
                          isClearable
                          wrapperClassName="w-full"
                          popperClassName="react-datepicker-dark"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de edições */}
              <div className="space-y-3 sm:space-y-4">
                {selectedDiario ? (
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-base font-semibold text-white sm:text-lg">
                      Edições disponíveis - {diarios.find(d => d.id === selectedDiario)?.name}
                    </h4>
                    
                    {/* Verificar se o diário tem múltiplas seções */}
                    {hasMultipleSections(selectedDiario) ? (
                      <div className="space-y-4">
                        {/* Edição de hoje com múltiplas seções */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                              <h5 className="text-sm font-semibold text-white sm:text-base">
                                Edição {String(new Date().getDate()).padStart(2, '0')}/{String(new Date().getMonth() + 1).padStart(2, '0')}/{new Date().getFullYear()}
                              </h5>
                              <p className="text-xs text-gray-400 sm:text-sm">
                                DOU com 5 seções • 312 páginas total
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => toggleSections('dou-today')}
                                className="expand-button px-3 py-1.5 bg-gray-600/20 text-gray-300 hover:bg-gray-600/30 rounded-lg text-xs font-medium flex items-center gap-1.5"
                              >
                                <span className="transform transition-transform duration-200">
                                  {expandedSections['dou-today'] ? '−' : '+'}
                                </span>
                                {expandedSections['dou-today'] ? 'Ocultar seções' : 'Ver seções'}
                              </button>
                              <button className="px-3 py-1.5 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5">
                                <EyeIcon className="h-3 w-3" />
                                Visualizar
                              </button>
                              {/* Botão "Baixar PDF" removido para diários com múltiplas seções */}
                              <div className="px-3 py-1.5 bg-amber-600/20 text-amber-300 rounded-lg text-xs font-medium flex items-center gap-1.5">
                                <span>ℹ️</span>
                                Expanda as seções para baixar
                              </div>
                            </div>
                          </div>
                          
                          {/* Seções do DOU - Mostrar apenas quando expandido */}
                          {expandedSections['dou-today'] && (
                            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${sectionAnimations['dou-today'] || ''}`}>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="text-xs font-semibold text-blue-300">1ª Seção</h6>
                                <span className="text-xs text-gray-400">89 páginas</span>
                              </div>
                              <p className="text-xs text-gray-400 mb-3">
                                Atos do Poder Executivo, Leis, Decretos, Portarias, etc.
                              </p>
                              <div className="flex gap-1">
                                <button className="px-2 py-1 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1">
                                  <EyeIcon className="h-2.5 w-2.5" />
                                  Ver
                                </button>
                                <button className="px-2 py-1 bg-green-600/20 text-green-300 hover:bg-green-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1">
                                  <ArrowDownTrayIcon className="h-2.5 w-2.5" />
                                  PDF
                                </button>
                              </div>
                            </div>
                            
                            <div className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="text-xs font-semibold text-green-300">2ª Seção</h6>
                                <span className="text-xs text-gray-400">78 páginas</span>
                              </div>
                              <p className="text-xs text-gray-400 mb-3">
                                Atos do Poder Judiciário, Tribunais, Ministério Público, etc.
                              </p>
                              <div className="flex gap-1">
                                <button className="px-2 py-1 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1">
                                  <EyeIcon className="h-2.5 w-2.5" />
                                  Ver
                                </button>
                                <button className="px-2 py-1 bg-green-600/20 text-green-300 hover:bg-green-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1">
                                  <ArrowDownTrayIcon className="h-2.5 w-2.5" />
                                  PDF
                                </button>
                              </div>
                            </div>
                            
                            <div className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="text-xs font-semibold text-purple-300">3ª Seção</h6>
                                <span className="text-xs text-gray-400">80 páginas</span>
                              </div>
                              <p className="text-xs text-gray-400 mb-3">
                                Atos do Poder Legislativo, Contratos, Licitações, etc.
                              </p>
                              <div className="flex gap-1">
                                <button className="px-2 py-1 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1">
                                  <EyeIcon className="h-2.5 w-2.5" />
                                  Ver
                                </button>
                                <button className="px-2 py-1 bg-green-600/20 text-green-300 hover:bg-green-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1">
                                  <ArrowDownTrayIcon className="h-2.5 w-2.5" />
                                  PDF
                                </button>
                              </div>
                            </div>
                            
                            {/* Seção Extra A */}
                            <div className="bg-white/5 border border-orange-500/30 rounded-lg p-3 hover:bg-white/10 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="text-xs font-semibold text-orange-300">2ª Seção - Extra A</h6>
                                <span className="text-xs text-gray-400">32 páginas</span>
                              </div>
                              <p className="text-xs text-gray-400 mb-3">
                                Atos do Poder Judiciário - Edição Extra, Urgências, etc.
                              </p>
                              <div className="flex gap-1">
                                <button className="px-2 py-1 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1">
                                  <EyeIcon className="h-2.5 w-2.5" />
                                  Ver
                                </button>
                                <button className="px-2 py-1 bg-green-600/20 text-green-300 hover:bg-green-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1">
                                  <ArrowDownTrayIcon className="h-2.5 w-2.5" />
                                  PDF
                                </button>
                              </div>
                            </div>
                            
                            {/* Seção Extra B */}
                            <div className="bg-white/5 border border-cyan-500/30 rounded-lg p-3 hover:bg-white/10 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="text-xs font-semibold text-cyan-300">3ª Seção - Extra A</h6>
                                <span className="text-xs text-gray-400">33 páginas</span>
                              </div>
                              <p className="text-xs text-gray-400 mb-3">
                                Atos do Poder Legislativo - Edição Extra, Contratos Urgentes, etc.
                              </p>
                              <div className="flex gap-1">
                                <button className="px-2 py-1 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1">
                                  <EyeIcon className="h-2.5 w-2.5" />
                                  Ver
                                </button>
                                <button className="px-2 py-1 bg-green-600/20 text-green-300 hover:bg-green-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1">
                                  <ArrowDownTrayIcon className="h-2.5 w-2.5" />
                                  PDF
                                </button>
                              </div>
                            </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Edições anteriores normais */}
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, index) => (
                          <div
                            key={index}
                            className="bg-white/5 border border-white/10 rounded-lg p-2 sm:p-3 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="text-sm font-semibold text-white sm:text-base">
                                  Edição {String(new Date().getDate() - index - 1).padStart(2, '0')}/{String(new Date().getMonth() + 1).padStart(2, '0')}/{new Date().getFullYear()}
                                </h5>
                                <p className="text-xs text-gray-400 sm:text-sm">
                                  N/A páginas
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button className="px-3 py-1.5 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5">
                                  <EyeIcon className="h-3 w-3" />
                                  Visualizar
                                </button>
                                {/* Botão "Baixar PDF" removido para diários com múltiplas seções */}
                                <div className="px-3 py-1.5 bg-amber-600/20 text-amber-300 rounded-lg text-xs font-medium flex items-center gap-1.5">
                                  <span>ℹ️</span>
                                  Expanda as seções para baixar
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Edições normais para outros diários (sem múltiplas seções) */
                      [1, 2, 3, 4, 5].map((_, index) => (
                        <div
                          key={index}
                          className="bg-white/5 border border-white/10 rounded-lg p-2 sm:p-3 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-sm font-semibold text-white sm:text-base">
                                Edição {String(new Date().getDate() - index).padStart(2, '0')}/{String(new Date().getMonth() + 1).padStart(2, '0')}/{new Date().getFullYear()}
                              </h5>
                              <p className="text-xs text-gray-400 sm:text-sm">
                                N/A páginas
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button className="px-3 py-1.5 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5">
                                <EyeIcon className="h-3 w-3" />
                                Visualizar
                              </button>
                              <button className="px-3 py-1.5 bg-green-600/20 text-green-300 hover:bg-green-600/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5">
                                <ArrowDownTrayIcon className="h-3 w-3" />
                                Baixar PDF
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <DocumentTextIcon className="h-10 w-10 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h4 className="text-base font-semibold text-white mb-2 sm:text-lg">Selecione um diário oficial</h4>
                    <p className="text-xs text-gray-500 sm:text-sm">
                      Escolha um diário oficial acima para visualizar as edições disponíveis.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drawer de Preview */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${drawerAnimation === 'slide-in' ? 'drawer-overlay-fade-in' : drawerAnimation === 'slide-out' ? 'drawer-overlay-fade-out' : ''}`}
            onClick={closeDrawer} 
          />
          <div className={`absolute right-0 top-0 h-full w-full max-w-4xl bg-slate-900 border-l border-white/10 shadow-2xl ${drawerAnimation === 'slide-in' ? 'drawer-slide-in-right' : drawerAnimation === 'slide-out' ? 'drawer-slide-out-right' : ''}`}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Preview da Publicação</h3>
              <button
                onClick={closeDrawer}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto h-full">
              {selectedPublication && (
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-white">{selectedPublication.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
                      {selectedPublication.source}
                    </span>
                    <span>{selectedPublication.date}</span>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed">
                      {selectedPublication.excerpt}
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      Baixar PDF
                    </button>
                    <button className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Copiar link
                    </button>
                  </div>
                </div>
              )}
        </div>
      </div>
        </div>
      )}

      {/* Drawer de Monitoramento */}
      {showMonitorDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${monitorDrawerAnimation === 'slide-in' ? 'drawer-overlay-fade-in' : monitorDrawerAnimation === 'slide-out' ? 'drawer-overlay-fade-out' : ''}`}
            onClick={closeMonitorDrawer} 
          />
          <div className={`absolute right-0 top-0 h-full w-full max-w-4xl bg-slate-900 border-l border-white/10 shadow-2xl ${monitorDrawerAnimation === 'slide-in' ? 'drawer-slide-in-right' : monitorDrawerAnimation === 'slide-out' ? 'drawer-slide-out-right' : ''}`}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Ocorrências do Monitoramento</h3>
              <button
                onClick={closeMonitorDrawer}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto h-full">
              {selectedMonitor && (
                <div className="space-y-6">
                  {/* Header do Monitoramento */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-lg font-semibold text-white">
                        {selectedMonitor.terms.join(', ')}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedMonitor.isActive 
                          ? 'bg-green-600/20 text-green-300 border border-green-500/30' 
                          : 'bg-red-600/20 text-red-300 border border-red-500/30'
                      }`}>
                        {selectedMonitor.isActive ? 'Ativo' : 'Pausado'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      <span className="font-medium">Diários:</span> {selectedMonitor.diarios.map(id => {
                        const diario = diarios.find(d => d.id === id);
                        return diario ? diario.name : id;
                      }).join(', ')}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedMonitor.occurrences} ocorrências encontradas
                    </p>
                  </div>

                  {/* Lista de Ocorrências */}
                  <div className="space-y-4">
                    <h5 className="text-base font-semibold text-white">Últimas Ocorrências</h5>
                    {Array.from({ length: selectedMonitor.occurrences }, (_, index) => (
                      <div
                        key={index}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h6 className="text-sm font-semibold text-white mb-2">
                              Edital de Concurso Público - Secretaria de Educação
                            </h6>
                            <div className="flex items-center gap-3 text-xs mb-2">
                              <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                                DOU
                              </span>
                              <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded font-medium">
                                📅 N/A
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                          A Secretaria de Educação torna público o edital de concurso público para provimento de vagas...
                        </p>
                        <div className="flex gap-2">
                          <button className="px-3 py-1.5 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5">
                            <EyeIcon className="h-3 w-3" />
                            Visualizar
                          </button>
                          <button className="px-3 py-1.5 bg-green-600/20 text-green-300 hover:bg-green-600/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5">
                            <ArrowDownTrayIcon className="h-3 w-3" />
                            PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xs">✓</span>
            </div>
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Register Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Cadastro Rápido"
        subtitle="Crie sua conta para começar a usar os Diários Oficiais"
        onSuccess={() => {
          setIsRegisterModalOpen(false);
          // Após cadastro, continuar com a ação original
          if (searchTerms.length > 0 && selectedDiarios.length > 0) {
            handleSearch();
          } else if (monitorTerm && monitorDiarios.length > 0) {
            handleCreateMonitoramento();
          }
        }}
      />
    </div>
  );
}

