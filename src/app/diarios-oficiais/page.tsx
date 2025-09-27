'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import RegisterModal from '@/components/RegisterModal';
import TransparentHeader from '@/components/TransparentHeader';
import TestModal from '@/components/TestModal';
import DatePicker from '@/components/DatePicker';
import AutocompletePortal from '@/components/AutocompletePortal';

// Tipo para configuração completa de busca
interface SearchConfig {
  id: string;
  term: string;
  selectedDiarios: string[];
  searchPeriod: string;
  customDateRange?: {
    start: Date | undefined;
    end: Date | undefined;
  };
  timestamp: number;
}
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
  CalendarIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export default function DiariosOficiais() {
  const [activeTab, setActiveTab] = useState('buscar');
  
  // Simular usuário logado para testes
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('isLoggedIn')) {
      localStorage.setItem('isLoggedIn', 'true');
    }
  }, []);
  
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [selectedDiarios, setSelectedDiarios] = useState<string[]>([]);
  
  // Estados para busca na subaba monitorar
  const [monitorSearchInput, setMonitorSearchInput] = useState('');
  const [monitorSearchTerms, setMonitorSearchTerms] = useState<string[]>([]);
  const [monitorSelectedDiarios, setMonitorSelectedDiarios] = useState<string[]>([]);
  
  // Estados para o combobox da subaba monitorar
  const [monitorSuggestions, setMonitorSuggestions] = useState<SearchConfig[]>([]);
  const [monitorShowSuggestions, setMonitorShowSuggestions] = useState(false);
  const [monitorSelectedIndex, setMonitorSelectedIndex] = useState(-1);
  const [monitorDebounceTimer, setMonitorDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [monitorSearchHistory, setMonitorSearchHistory] = useState<SearchConfig[]>([]);
  const [monitorIsShowingHistory, setMonitorIsShowingHistory] = useState(false);
  const monitorSearchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchPeriod, setSearchPeriod] = useState('7d');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({ start: undefined as Date | undefined, end: undefined as Date | undefined });
  const [dateValidationError, setDateValidationError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{
    id: number;
    title: string;
    source: string;
    date: string;
    excerpt: string;
    url: string;
    sections?: Array<{
      id: string;
      name: string;
      url: string;
    }>;
  }>>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMonitoringId, setDeletingMonitoringId] = useState<number | null>(null);
  const [diarioSearchTerm, setDiarioSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [showDiarioDropdown, setShowDiarioDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  
  // Estados para o combobox
  const [suggestions, setSuggestions] = useState<SearchConfig[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchConfig[]>([]);
  const [isShowingHistory, setIsShowingHistory] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Carregar histórico de pesquisas do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('searchHistory');
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          // Garantir que seja um array de SearchConfig válidos
          const validHistory = Array.isArray(parsedHistory) 
            ? parsedHistory.filter(item => 
                item && 
                typeof item === 'object' && 
                typeof item.term === 'string' &&
                Array.isArray(item.selectedDiarios) &&
                typeof item.searchPeriod === 'string' &&
                typeof item.timestamp === 'number'
              )
            : [];
          setSearchHistory(validHistory);
        } catch (error) {
          console.error('Erro ao carregar histórico de pesquisas:', error);
          setSearchHistory([]);
        }
      }
    }
  }, []);

  // Carregar histórico de monitoramento do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMonitorHistory = localStorage.getItem('monitorSearchHistory');
      if (savedMonitorHistory) {
        try {
          const parsedHistory = JSON.parse(savedMonitorHistory);
          // Garantir que seja um array de SearchConfig válidos
          const validHistory = Array.isArray(parsedHistory) 
            ? parsedHistory.filter(item => 
                item && 
                typeof item === 'object' && 
                typeof item.term === 'string' &&
                Array.isArray(item.selectedDiarios) &&
                typeof item.searchPeriod === 'string' &&
                typeof item.timestamp === 'number'
              )
            : [];
          setMonitorSearchHistory(validHistory);
        } catch (error) {
          console.error('Erro ao carregar histórico de monitoramento:', error);
          setMonitorSearchHistory([]);
        }
      } else {
        // Dados de exemplo para teste
        const exampleHistory: SearchConfig[] = [
          {
            id: 'monitor-example-1',
            term: 'João da Silva',
            selectedDiarios: ['dou'],
            searchPeriod: '7d',
            customDateRange: undefined,
            timestamp: Date.now() - 86400000 // 1 dia atrás
          },
          {
            id: 'monitor-example-2',
            term: 'Maria Santos',
            selectedDiarios: ['dou', 'dom'],
            searchPeriod: '7d',
            customDateRange: undefined,
            timestamp: Date.now() - 172800000 // 2 dias atrás
          },
          {
            id: 'monitor-example-3',
            term: 'Pedro Oliveira',
            selectedDiarios: ['dou'],
            searchPeriod: '7d',
            customDateRange: undefined,
            timestamp: Date.now() - 259200000 // 3 dias atrás
          }
        ];
        setMonitorSearchHistory(exampleHistory);
      }
    }
  }, []);

  // Cleanup do timer do debounce
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);
  
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
      terms: ['concurso público'],
      diarios: ['dou', 'dosp'],
      isActive: true,
      createdAt: '2024-01-10',
      occurrences: 15
    },
    {
      id: 2,
      terms: ['licitação'],
      diarios: ['dou', 'dom'],
      isActive: true,
      createdAt: '2024-01-08',
      occurrences: 8
    }
  ]);

  // Estados para edição de monitoramento
  const [isEditingMonitor, setIsEditingMonitor] = useState(false);
  const [editingMonitorId, setEditingMonitorId] = useState<number | null>(null);

  const [monitoredTerms, setMonitoredTerms] = useState<Set<string>>(new Set());
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
    'Assembleia Legislativa',
    'Ministério da Educação',
    'Ministério da Saúde',
    'Ministério da Justiça',
    'Tribunal Regional Federal',
    'Tribunal de Justiça',
    'Defensoria Pública',
    'Ministério Público',
    'Receita Federal',
    'INSS',
    'Caixa Econômica Federal'
  ];

  // Função para salvar configuração completa no histórico
  const saveSearchToHistory = (term: string, selectedDiarios: string[], searchPeriod: string, customDateRange?: { start: Date | undefined, end: Date | undefined }) => {
    if (!term.trim() || typeof term !== 'string') return;
    
    const trimmedTerm = term.trim();
    const newSearchConfig: SearchConfig = {
      id: `${trimmedTerm}-${Date.now()}`,
      term: trimmedTerm,
      selectedDiarios: [...selectedDiarios],
      searchPeriod,
      customDateRange: customDateRange ? { ...customDateRange } : undefined,
      timestamp: Date.now()
    };
    
    setSearchHistory(prev => {
      // Remove configurações com o mesmo termo e configurações similares
      const filtered = prev.filter(item => 
        !(item.term === trimmedTerm && 
          JSON.stringify(item.selectedDiarios.sort()) === JSON.stringify(selectedDiarios.sort()) &&
          item.searchPeriod === searchPeriod)
      );
      
      const newHistory = [newSearchConfig, ...filtered].slice(0, 5); // Manter apenas 5 itens
      
      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      }
      
      return newHistory;
    });
  };

  // Função para filtrar sugestões com debounce
  const filterSuggestions = (term: string) => {
    if (!term.trim()) {
      // Mostrar histórico quando campo está vazio
      if (searchHistory.length > 0) {
        setSuggestions(searchHistory.slice(0, 8));
        setShowSuggestions(searchHistory.length > 0);
        setIsShowingHistory(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setIsShowingHistory(false);
      }
      setSelectedIndex(-1);
      return;
    }

    // Filtrar apenas histórico baseado em correspondência sequencial de caracteres
    const filtered = searchHistory.filter(suggestion => {
      const suggestionLower = suggestion.term.toLowerCase();
      const termLower = term.toLowerCase();
      
      // Verificar se o termo digitado corresponde sequencialmente ao início da sugestão
      return suggestionLower.startsWith(termLower);
    }).slice(0, 5); // Limitar a 5 sugestões

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setIsShowingHistory(true);
    setSelectedIndex(-1);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    
    // Limpar timer anterior
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Se campo está vazio, mostrar histórico imediatamente
    if (!value.trim()) {
      filterSuggestions(value);
      setSearchTerms([]);
      setShowDiarioDropdown(false);
      setShowDateFilters(false);
      setHasSearched(false);
      setSearchResults([]);
      return;
    }

    // Filtrar sugestões com debounce
    const timer = setTimeout(() => {
      filterSuggestions(value);
    }, 300);
    setDebounceTimer(timer);

    const terms = value.split(',').map(t => t.trim()).filter(t => t);
    setSearchTerms(terms);
    setShowDiarioDropdown(true);
    
    // Expandir automaticamente Poder Executivo > Federal > DOU
    setExpandedPoderes(prev => ({
      ...prev,
      'Poder Executivo': true
    }));
    setExpandedSubcategorias(prev => ({
      ...prev,
      'Poder Executivo-Federal': true
    }));
  };

  const handleRemoveSearchTerm = (index: number) => {
    const newTerms = searchTerms.filter((_, i) => i !== index);
    setSearchTerms(newTerms);
    if (newTerms.length === 0) {
      setSearchInput('');
      setShowDiarioDropdown(false);
      setShowDateFilters(false);
      setHasSearched(false);
      setSearchResults([]);
    } else {
      setSearchInput(newTerms.join(', '));
    }
  };

  // Funções para busca na subaba monitorar
  const filterMonitorSuggestions = (term: string) => {
    // Filtrar apenas histórico baseado em correspondência sequencial de caracteres
    const filtered = monitorSearchHistory.filter(suggestion => {
      const suggestionLower = suggestion.term.toLowerCase();
      const termLower = term.toLowerCase();
      
      // Verificar se o termo digitado corresponde sequencialmente ao início da sugestão
      return suggestionLower.startsWith(termLower);
    }).slice(0, 5); // Limitar a 5 sugestões

    setMonitorSuggestions(filtered);
    setMonitorShowSuggestions(filtered.length > 0);
    setMonitorIsShowingHistory(true);
    setMonitorSelectedIndex(-1);
  };

  const handleMonitorSearchInputChange = (value: string) => {
    setMonitorSearchInput(value);
    
    // Limpar timer anterior
    if (monitorDebounceTimer) {
      clearTimeout(monitorDebounceTimer);
    }

    // Se campo está vazio, mostrar histórico imediatamente
    if (!value.trim()) {
      filterMonitorSuggestions(value);
      setMonitorSearchTerms([]);
      return;
    }

    // Filtrar sugestões com debounce
    const timer = setTimeout(() => {
      filterMonitorSuggestions(value);
    }, 300);
    setMonitorDebounceTimer(timer);

    // Processar termos automaticamente durante a digitação
    const terms = value.split(',').map(t => t.trim()).filter(t => t);
    setMonitorSearchTerms(terms);
    
    // Se há termos, expandir automaticamente o Poder Executivo > Federal > DOU
    if (terms.length > 0) {
      setMonitorExpandedPoderes(prev => ({
        ...prev,
        'Poder Executivo': true
      }));
      setMonitorExpandedSubcategorias(prev => ({
        ...prev,
        'Poder Executivo-Federal': true
      }));
    }
  };

  const handleMonitorKeyDown = (e: React.KeyboardEvent) => {
    if (!monitorShowSuggestions || monitorSuggestions.length === 0) {
      if (e.key === 'Enter' && monitorSearchInput.trim()) {
        e.preventDefault();
        // Não precisa fazer nada aqui, pois o reconhecimento já é automático
        // Apenas limpar o input se necessário
        setMonitorSearchInput('');
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setMonitorSelectedIndex(prev => 
          prev < monitorSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setMonitorSelectedIndex(prev => 
          prev > 0 ? prev - 1 : monitorSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (monitorSelectedIndex >= 0 && monitorSelectedIndex < monitorSuggestions.length) {
          const selectedSuggestion = monitorSuggestions[monitorSelectedIndex];
          handleMonitorSuggestionSelect(selectedSuggestion);
        } else if (monitorSearchInput.trim()) {
          setMonitorSearchInput('');
        }
        break;
      case 'Escape':
        e.preventDefault();
        setMonitorShowSuggestions(false);
        setMonitorIsShowingHistory(false);
        setMonitorSelectedIndex(-1);
        break;
    }
  };

  const handleRemoveMonitorSearchTerm = (index: number) => {
    const newTerms = monitorSearchTerms.filter((_, i) => i !== index);
    setMonitorSearchTerms(newTerms);
    
    // Atualizar o input com os termos restantes
    if (newTerms.length === 0) {
      setMonitorSearchInput('');
      setMonitorSelectedDiarios([]); // Limpar diários quando não há mais termos
    } else {
      setMonitorSearchInput(newTerms.join(', '));
    }
  };

  // Funções para manipular sugestões do combobox da subaba monitorar
  const handleMonitorSuggestionSelect = (suggestion: SearchConfig) => {
    setMonitorSearchInput(suggestion.term);
    setMonitorShowSuggestions(false);
    setMonitorIsShowingHistory(false);
    setMonitorSelectedIndex(-1);
    
    // Processar como termo de busca
    const terms = suggestion.term.split(',').map(t => t.trim()).filter(t => t);
    setMonitorSearchTerms(terms);
    
    // Expandir automaticamente o Poder Executivo > Federal > DOU
    if (terms.length > 0) {
      setMonitorExpandedPoderes(prev => ({
        ...prev,
        'Poder Executivo': true
      }));
      setMonitorExpandedSubcategorias(prev => ({
        ...prev,
        'Poder Executivo-Federal': true
      }));
    }
  };

  const handleMonitorSuggestionClick = (suggestion: SearchConfig) => {
    handleMonitorSuggestionSelect(suggestion);
  };

  // Handler para quando o input recebe foco
  const handleMonitorInputFocus = () => {
    if (!monitorSearchInput.trim() && monitorSearchHistory.length > 0) {
      setMonitorSuggestions(monitorSearchHistory.slice(0, 8));
      setMonitorShowSuggestions(monitorSearchHistory.length > 0);
      setMonitorIsShowingHistory(true);
      setMonitorSelectedIndex(-1);
    }
  };

  // Handler para quando o input perde foco
  const handleMonitorInputBlur = () => {
    // Delay para permitir clique nas sugestões
    setTimeout(() => {
      setMonitorShowSuggestions(false);
      setMonitorIsShowingHistory(false);
      setMonitorSelectedIndex(-1);
    }, 150);
  };

  // Funções de toggle para poderes e subcategorias da subaba monitorar
  const toggleMonitorPoder = (poder: string) => {
    setMonitorExpandedPoderes(prev => ({
      ...prev,
      [poder]: !prev[poder]
    }));
  };

  const toggleMonitorSubcategoria = (poder: string, subcategoria: string) => {
    const key = `${poder}-${subcategoria}`;
    setMonitorExpandedSubcategorias(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Função para criar alerta de monitoramento com validação
  const handleCreateMonitorAlert = async () => {
    // Verificar se há termos digitados
    if (monitorSearchTerms.length === 0) {
      showToastMessage('Digite pelo menos um termo para monitorar');
      return;
    }

    // Verificar se há diários selecionados
    if (monitorSelectedDiarios.length === 0) {
      // Scroll para a seção de diários
      const diariosSection = document.querySelector('[data-section="monitor-diarios"]');
      if (diariosSection) {
        diariosSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Adicionar spotlight effect
        setTimeout(() => {
          diariosSection.classList.add('spotlight-border');
          setTimeout(() => {
            diariosSection.classList.remove('spotlight-border');
          }, 3000);
        }, 200);
      }
      
      // Mostrar toast
      showToastMessage('Selecione pelo menos um diário oficial');
      return;
    }

    // Se todas as validações passaram, criar o monitoramento
    const newMonitoramento = {
      id: Date.now(),
      terms: monitorSearchTerms,
      diarios: monitorSelectedDiarios,
      isActive: true,
      createdAt: new Date().toISOString(),
      occurrences: 0
    };

    setMonitoramentos(prev => [...prev, newMonitoramento]);
    
    // Salvar no histórico de monitoramento
    const monitorConfig: SearchConfig = {
      id: `monitor-${Date.now()}`,
      term: monitorSearchTerms.join(', '),
      selectedDiarios: monitorSelectedDiarios,
      searchPeriod: '7d', // Padrão para monitoramento
      customDateRange: undefined,
      timestamp: Date.now()
    };
    
    setMonitorSearchHistory(prev => {
      const filtered = prev.filter(item => item.term !== monitorConfig.term);
      const newHistory = [monitorConfig, ...filtered].slice(0, 10); // Manter apenas 10 itens
      
      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('monitorSearchHistory', JSON.stringify(newHistory));
      }
      
      return newHistory;
    });
    
    // Limpar formulário
    setMonitorSearchInput('');
    setMonitorSearchTerms([]);
    setMonitorSelectedDiarios([]);
    
    showToastMessage('Alerta de monitoramento criado com sucesso!');
  };

  // Função para iniciar edição de monitoramento
  const handleEditMonitor = (monitoramento: any) => {
    setIsEditingMonitor(true);
    setEditingMonitorId(monitoramento.id);
    setMonitorSearchInput(monitoramento.terms[0]);
    setMonitorSearchTerms(monitoramento.terms);
    setMonitorSelectedDiarios(monitoramento.diarios);
    
    // Expandir automaticamente os poderes selecionados
    const expandedPoderes: {[key: string]: boolean} = {};
    const expandedSubcategorias: {[key: string]: boolean} = {};
    
    monitoramento.diarios.forEach((diarioId: string) => {
      const diario = diarios.find(d => d.id === diarioId);
      if (diario) {
        expandedPoderes[diario.poder] = true;
        // Verificar se o diário tem subcategoria (alguns diários como MP e DP não têm)
        if ('subcategoria' in diario && diario.subcategoria) {
          expandedSubcategorias[`${diario.poder}-${diario.subcategoria}`] = true;
        }
      }
    });
    
    setMonitorExpandedPoderes(expandedPoderes);
    setMonitorExpandedSubcategorias(expandedSubcategorias);
  };

  // Função para cancelar edição de monitoramento
  const handleCancelMonitorEdit = () => {
    setIsEditingMonitor(false);
    setEditingMonitorId(null);
    setMonitorSearchInput('');
    setMonitorSearchTerms([]);
    setMonitorSelectedDiarios([]);
    setMonitorExpandedPoderes({});
    setMonitorExpandedSubcategorias({});
  };

  // Função para atualizar alerta de monitoramento
  const handleUpdateMonitorAlert = async () => {
    // Verificar se há termos digitados
    if (monitorSearchTerms.length === 0) {
      showToastMessage('Digite pelo menos um termo para monitorar');
      return;
    }

    // Verificar se há diários selecionados
    if (monitorSelectedDiarios.length === 0) {
      const diariosSection = document.querySelector('[data-section="monitor-diarios"]');
      if (diariosSection) {
        diariosSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          diariosSection.classList.add('spotlight-border');
          setTimeout(() => {
            diariosSection.classList.remove('spotlight-border');
          }, 3000);
        }, 200);
      }
      showToastMessage('Selecione pelo menos um diário oficial');
      return;
    }

    // Atualizar o monitoramento
    setMonitoramentos(prev => prev.map(monitoramento => 
      monitoramento.id === editingMonitorId 
        ? {
            ...monitoramento,
            terms: monitorSearchTerms,
            diarios: monitorSelectedDiarios
          }
        : monitoramento
    ));

    // Salvar no histórico
    const monitorConfig: SearchConfig = {
      id: `monitor-${Date.now()}`,
      term: monitorSearchTerms[0],
      selectedDiarios: monitorSelectedDiarios,
      searchPeriod: '7d',
      customDateRange: undefined,
      timestamp: Date.now()
    };
    
    setMonitorSearchHistory(prev => {
      const filtered = prev.filter(item => item.term !== monitorConfig.term);
      const newHistory = [monitorConfig, ...filtered].slice(0, 10);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('monitorSearchHistory', JSON.stringify(newHistory));
      }
      
      return newHistory;
    });

    // Limpar formulário e sair do modo de edição
    handleCancelMonitorEdit();
    
    showToastMessage('Alerta de monitoramento atualizado com sucesso!');
  };

  const handleDiarioSelect = (diarioId: string) => {
    if (selectedDiarios.includes(diarioId)) {
      const newSelectedDiarios = selectedDiarios.filter(id => id !== diarioId);
      setSelectedDiarios(newSelectedDiarios);
      if (newSelectedDiarios.length === 0) {
        setHasSearched(false);
        setSearchResults([]);
      }
    } else {
      setSelectedDiarios([...selectedDiarios, diarioId]);
    }
  };

  // Funções para navegação por teclado do combobox
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionSelect = (suggestion: SearchConfig) => {
    setSearchInput(suggestion.term);
    setShowSuggestions(false);
    setIsShowingHistory(false);
    setSelectedIndex(-1);
    
    // Restaurar configuração completa se for do histórico
    if (suggestion.timestamp > 0) {
      setSelectedDiarios(suggestion.selectedDiarios);
      setSearchPeriod(suggestion.searchPeriod);
      if (suggestion.customDateRange) {
        setCustomDateRange(suggestion.customDateRange);
      }
    }
    
    // Processar como termo de busca
    const terms = suggestion.term.split(',').map(t => t.trim()).filter(t => t);
    setSearchTerms(terms);
    setShowDiarioDropdown(true);
  };

  const handleSuggestionClick = (suggestion: SearchConfig) => {
    handleSuggestionSelect(suggestion);
  };

  // Função para remover item do histórico
  const removeFromHistory = (id: string) => {
    setSearchHistory(prev => {
      const newHistory = prev.filter(item => item.id !== id);
      
      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      }
      
      return newHistory;
    });
  };

  // Handler para quando o input recebe foco
  const handleInputFocus = () => {
    if (!searchInput.trim() && searchHistory.length > 0) {
      setSuggestions(searchHistory.slice(0, 8));
      setShowSuggestions(searchHistory.length > 0);
      setIsShowingHistory(true);
      setSelectedIndex(-1);
    }
  };

  // Handler para quando o input perde foco
  const handleInputBlur = () => {
    // Delay para permitir clique nas sugestões
    setTimeout(() => {
      setShowSuggestions(false);
      setIsShowingHistory(false);
    }, 200);
  };

  const handleDiarioRemove = (diarioId: string) => {
    const newSelectedDiarios = selectedDiarios.filter(id => id !== diarioId);
    setSelectedDiarios(newSelectedDiarios);
    if (newSelectedDiarios.length === 0) {
      setHasSearched(false);
      setSearchResults([]);
    }
  };

  const handlePeriodSelect = (period: string) => {
    setSearchPeriod(period);
    if (period === 'custom') {
      setShowCustomDateRange(true);
    } else {
      setShowCustomDateRange(false);
    }
  };

  // Função para atualizar data inicial com validação
  const handleStartDateChange = (date: Date | undefined) => {
    setDateValidationError(''); // Limpar erro anterior
    
    if (date) {
      // Se a data final existe e é anterior à nova data inicial, resetar a data final
      if (customDateRange.end && customDateRange.end < date) {
        setCustomDateRange({ start: date, end: undefined });
        setDateValidationError('Data final foi resetada pois era anterior à nova data inicial');
      } else {
        setCustomDateRange({ ...customDateRange, start: date });
      }
    } else {
      setCustomDateRange({ ...customDateRange, start: undefined });
    }
  };

  // Função para atualizar data final com validação
  const handleEndDateChange = (date: Date | undefined) => {
    setDateValidationError(''); // Limpar erro anterior
    
    if (date && customDateRange.start && date < customDateRange.start) {
      // Se a data final é anterior à data inicial, mostrar erro
      setDateValidationError('A data final deve ser posterior à data inicial');
      return;
    }
    setCustomDateRange({ ...customDateRange, end: date });
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

  const toggleNavegarCategory = useCallback((category: string) => {
    setNavegarExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

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

  const toggleSections = useCallback((editionId: string) => {
    const isCurrentlyExpanded = expandedSections[editionId];
    
    if (isCurrentlyExpanded) {
      // Se está expandido, colapsar imediatamente
      setExpandedSections(prev => ({
        ...prev,
        [editionId]: false
      }));
      setSectionAnimations(prev => ({
        ...prev,
        [editionId]: ''
      }));
    } else {
      // Se está colapsado, expandir imediatamente com animação
      setExpandedSections(prev => ({
        ...prev,
        [editionId]: true
      }));
      setSectionAnimations(prev => ({
        ...prev,
        [editionId]: 'animate-in slide-in-from-bottom-2 fade-in-0 duration-200'
      }));
    }
  }, [expandedSections]);


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
    setHasSearched(true);
    
    // Simular busca com dados mockados
    setTimeout(() => {
      const mockResults = [
        {
          id: 1,
          title: 'Edital de Concurso Público - Secretaria de Educação',
          source: 'DOU',
          date: '2024-01-15',
          excerpt: 'A Secretaria de Educação torna público o edital de concurso público para provimento de vagas...',
          url: '#',
          sections: [
            { id: 's1', name: 'Seção 1', url: '#' },
            { id: 's2', name: 'Seção 2', url: '#' },
            { id: 's3', name: 'Seção 3', url: '#' }
          ]
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
          url: '#',
          sections: [
            { id: 's1', name: 'Seção 1', url: '#' },
            { id: 's2', name: 'Seção 2', url: '#' },
            { id: 's3', name: 'Seção 3', url: '#' }
          ]
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
      
      // Salvar configuração no histórico
      const searchTerm = searchTerms.join(', ');
      saveSearchToHistory(searchTerm, selectedDiarios, searchPeriod, customDateRange);
      
      setIsSearching(false);
      
      // Scroll automático para os resultados após um pequeno delay
      setTimeout(() => {
        const resultsSection = document.querySelector('[data-section="results"]');
        if (resultsSection) {
          const headerHeight = 80; // Altura aproximada do header
          const elementPosition = resultsSection.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerHeight;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }, 2000);
  };

  const handleSearchWithValidation = async () => {
    // Verificar se há diários selecionados
    if (selectedDiarios.length === 0) {
      // Scroll para a seção de diários
      const diariosSection = document.querySelector('[data-section="diarios"]');
      if (diariosSection) {
        diariosSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Adicionar spotlight effect com delay reduzido
        setTimeout(() => {
          console.log('Aplicando spotlight-border ao elemento:', diariosSection);
          diariosSection.classList.add('spotlight-border');
          console.log('Classes do elemento:', diariosSection.className);
          setTimeout(() => {
            diariosSection.classList.remove('spotlight-border');
            console.log('Removendo spotlight-border');
          }, 3000);
        }, 200);
      }
      
      // Mostrar toast
      showToastMessage('Selecione pelo menos um diário oficial');
      return;
    }
    
    // Se há diários selecionados, executar busca normal
    await handleSearch();
  };

  const handleSaveAsMonitor = async (term: string) => {
    try {
      // Verificar se o termo já foi monitorado
      if (monitoredTerms.has(term)) {
        showToastMessage('Este termo já está sendo monitorado!');
        return;
      }

      // TODO: Implementar chamada para API real
      console.log('Salvando monitoramento:', { term, diarios: selectedDiarios });
      
      const newMonitoramento = {
        id: Date.now(),
        terms: [term],
        diarios: selectedDiarios,
        isActive: true,
        createdAt: new Date().toISOString(),
        occurrences: 0 // Será atualizado pela API
      };
      
      setMonitoramentos([...monitoramentos, newMonitoramento]);
      setMonitoredTerms(prev => new Set([...prev, term]));
      showToastMessage('Monitoramento do termo cadastrado com sucesso');
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

  // Auto-expandir categorias na aba Buscar Termos quando um diário específico é encontrado
  useEffect(() => {
    if (diarioSearchTerm) {
      const searchTerm = diarioSearchTerm.toLowerCase();
      
      // Verificar se o termo corresponde ao DOU
      if (searchTerm.includes('diário oficial da união') || searchTerm.includes('dou')) {
        setExpandedPoderes(prev => ({
          ...prev,
          'Poder Executivo': true
        }));
        setExpandedSubcategorias(prev => ({
          ...prev,
          'Poder Executivo-Federal': true
        }));
      }
      // Verificar outros diários específicos se necessário
      else if (searchTerm.includes('diário oficial sp') || searchTerm.includes('dosp')) {
        setExpandedPoderes(prev => ({
          ...prev,
          'Poder Executivo': true
        }));
        setExpandedSubcategorias(prev => ({
          ...prev,
          'Poder Executivo-Estaduais': true
        }));
      }
      else if (searchTerm.includes('diário oficial rj') || searchTerm.includes('dorj')) {
        setExpandedPoderes(prev => ({
          ...prev,
          'Poder Executivo': true
        }));
        setExpandedSubcategorias(prev => ({
          ...prev,
          'Poder Executivo-Estaduais': true
        }));
      }
      else if (searchTerm.includes('diário oficial mg') || searchTerm.includes('domg')) {
        setExpandedPoderes(prev => ({
          ...prev,
          'Poder Executivo': true
        }));
        setExpandedSubcategorias(prev => ({
          ...prev,
          'Poder Executivo-Estaduais': true
        }));
      }
      // Para outros poderes, expandir baseado no termo
      else if (searchTerm.includes('judiciário') || searchTerm.includes('justiça')) {
        setExpandedPoderes(prev => ({
          ...prev,
          'Poder Judiciário': true
        }));
      }
      else if (searchTerm.includes('legislativo') || searchTerm.includes('congresso')) {
        setExpandedPoderes(prev => ({
          ...prev,
          'Poder Legislativo': true
        }));
      }
      else if (searchTerm.includes('ministério público') || searchTerm.includes('mp')) {
        setExpandedPoderes(prev => ({
          ...prev,
          'Ministério Público': true
        }));
      }
    } else {
      // Limpar expansões quando o campo de busca estiver vazio
      setExpandedPoderes({});
      setExpandedSubcategorias({});
    }
  }, [diarioSearchTerm]);

  // Filtros para aba de monitoramentos
  const filteredMonitorDiariosPorPoder = getFilteredDiariosPorPoder(monitorDiarioSearchTerm);

  // Auto-expandir categorias na aba Monitorar termos quando um diário específico é encontrado
  useEffect(() => {
    if (monitorDiarioSearchTerm) {
      const searchTerm = monitorDiarioSearchTerm.toLowerCase();
      
      // Verificar se o termo corresponde ao DOU
      if (searchTerm.includes('diário oficial da união') || searchTerm.includes('dou')) {
        setMonitorExpandedPoderes(prev => ({
          ...prev,
          'Poder Executivo': true
        }));
        setMonitorExpandedSubcategorias(prev => ({
          ...prev,
          'Poder Executivo-Federal': true
        }));
      }
      // Verificar outros diários específicos se necessário
      else if (searchTerm.includes('diário oficial sp') || searchTerm.includes('dosp')) {
        setMonitorExpandedPoderes(prev => ({
          ...prev,
          'Poder Executivo': true
        }));
        setMonitorExpandedSubcategorias(prev => ({
          ...prev,
          'Poder Executivo-Estaduais': true
        }));
      }
      else if (searchTerm.includes('diário oficial rj') || searchTerm.includes('dorj')) {
        setMonitorExpandedPoderes(prev => ({
          ...prev,
          'Poder Executivo': true
        }));
        setMonitorExpandedSubcategorias(prev => ({
          ...prev,
          'Poder Executivo-Estaduais': true
        }));
      }
      else if (searchTerm.includes('diário oficial mg') || searchTerm.includes('domg')) {
        setMonitorExpandedPoderes(prev => ({
          ...prev,
          'Poder Executivo': true
        }));
        setMonitorExpandedSubcategorias(prev => ({
          ...prev,
          'Poder Executivo-Estaduais': true
        }));
      }
      // Para outros poderes, expandir baseado no termo
      else if (searchTerm.includes('judiciário') || searchTerm.includes('justiça')) {
        setMonitorExpandedPoderes(prev => ({
          ...prev,
          'Poder Judiciário': true
        }));
      }
      else if (searchTerm.includes('legislativo') || searchTerm.includes('congresso')) {
        setMonitorExpandedPoderes(prev => ({
          ...prev,
          'Poder Legislativo': true
        }));
      }
      else if (searchTerm.includes('ministério público') || searchTerm.includes('mp')) {
        setMonitorExpandedPoderes(prev => ({
          ...prev,
          'Ministério Público': true
        }));
      }
    } else {
      // Limpar expansões quando o campo de busca estiver vazio
      setMonitorExpandedPoderes({});
      setMonitorExpandedSubcategorias({});
    }
  }, [monitorDiarioSearchTerm]);

  // Filtros para aba Navegar
  const filteredNavegarDiariosPorPoder = getFilteredDiariosPorPoder(navegarDiarioSearchTerm);

  // Auto-expandir categorias quando um diário específico é encontrado
  useEffect(() => {
    if (navegarDiarioSearchTerm) {
      const searchTerm = navegarDiarioSearchTerm.toLowerCase();
      
      // Verificar se o termo corresponde ao DOU
      if (searchTerm.includes('diário oficial da união') || searchTerm.includes('dou')) {
        setNavegarExpandedPoderes(prev => ({
          ...prev,
          'Poder Executivo': true
        }));
        setNavegarExpandedSubcategorias(prev => ({
          ...prev,
          'Poder Executivo-Federal': true
        }));
      }
      // Verificar outros diários específicos se necessário
      else if (searchTerm.includes('diário oficial sp') || searchTerm.includes('dosp')) {
        setNavegarExpandedPoderes(prev => ({
          ...prev,
          'Poder Executivo': true
        }));
        setNavegarExpandedSubcategorias(prev => ({
          ...prev,
          'Poder Executivo-Estaduais': true
        }));
      }
      else if (searchTerm.includes('diário oficial rj') || searchTerm.includes('dorj')) {
        setNavegarExpandedPoderes(prev => ({
          ...prev,
          'Poder Executivo': true
        }));
        setNavegarExpandedSubcategorias(prev => ({
          ...prev,
          'Poder Executivo-Estaduais': true
        }));
      }
      else if (searchTerm.includes('diário oficial mg') || searchTerm.includes('domg')) {
        setNavegarExpandedPoderes(prev => ({
          ...prev,
          'Poder Executivo': true
        }));
        setNavegarExpandedSubcategorias(prev => ({
          ...prev,
          'Poder Executivo-Estaduais': true
        }));
      }
      // Para outros poderes, expandir baseado no termo
      else if (searchTerm.includes('judiciário') || searchTerm.includes('justiça')) {
        setNavegarExpandedPoderes(prev => ({
          ...prev,
          'Poder Judiciário': true
        }));
      }
      else if (searchTerm.includes('legislativo') || searchTerm.includes('congresso')) {
        setNavegarExpandedPoderes(prev => ({
          ...prev,
          'Poder Legislativo': true
        }));
      }
      else if (searchTerm.includes('ministério público') || searchTerm.includes('mp')) {
        setNavegarExpandedPoderes(prev => ({
          ...prev,
          'Ministério Público': true
        }));
      }
    } else {
      // Limpar expansões quando o campo de busca estiver vazio
      setNavegarExpandedPoderes({});
      setNavegarExpandedSubcategorias({});
    }
  }, [navegarDiarioSearchTerm]);

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
    
    // Validação mais robusta
    const term = monitorTerm?.trim();
    if (!term || term.length === 0) {
      setValidationError('Adicione um termo para monitorar');
      return;
    }
    
    if (!monitorDiarios || monitorDiarios.length === 0) {
      setValidationError('Selecione pelo menos 1 diário oficial');
      return;
    }
    
    // Criar novo monitoramento
    const newMonitoramento = {
      id: Date.now(),
      terms: [term],
      diarios: [...monitorDiarios],
      isActive: true,
      createdAt: new Date().toISOString(),
      occurrences: 0
    };
    
    // Atualizar estado usando função callback para garantir que a atualização seja aplicada
    setMonitoramentos(prev => [...prev, newMonitoramento]);
    
    // Limpar formulário
    setMonitorTerm('');
    setMonitorDiarios([]);
    setMonitorTermInput('');
    setShowCreateForm(false);
    setValidationError('');
    
    showToastMessage('Monitoramento criado com sucesso!');
  };

  // Função de teste para criar monitoramento de contexto
  const handleCreateContextMonitor = () => {
    const newContextMonitor = {
      id: Date.now(),
      terms: ['monitoramento de contexto'],
      diarios: ['dou'],
      isActive: true,
      createdAt: new Date().toISOString(),
      occurrences: Math.floor(Math.random() * 20) + 1
    };
    
    setMonitoramentos(prev => [...prev, newContextMonitor]);
    showToastMessage('Monitoramento de contexto criado com sucesso!');
  };

  const handleToggleMonitoramento = (id: number) => {
    setMonitoramentos(monitoramentos.map(m => 
      m.id === id ? { ...m, isActive: !m.isActive } : m
    ));
  };

  const handleDeleteMonitoramento = (id: number) => {
    setDeletingMonitoringId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deletingMonitoringId) {
      setMonitoramentos(monitoramentos.filter(m => m.id !== deletingMonitoringId));
      showToastMessage('Monitoramento excluído com sucesso!');
      setShowDeleteModal(false);
      setDeletingMonitoringId(null);
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

  return (
    <div className="bg-transparent min-h-screen">
      <TransparentHeader 
        currentPage="diarios-oficiais" 
        onTrialClick={() => setIsTestModalOpen(true)} 
      />

      {/* Hero Section */}
      <section className="relative pt-24 pb-8 sm:pt-28 sm:pb-12 md:pt-32 md:pb-16 lg:pt-36 fade-in-up">
        {/* Gradiente sutil */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
            <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-tight fade-in-delay-1">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300" style={{ lineHeight: '1.2', paddingBottom: '2px' }}>Diários Oficiais</span>
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
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none cursor-pointer ${
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
            <div className="space-y-4 sm:space-y-6 fade-in">
              {/* Header */}
              <div>
                <h3 className="text-base font-semibold text-white sm:text-lg">Buscar Publicações</h3>
                <p className="text-sm text-gray-400 sm:text-base">Digite um termo e filtre por diários e período de publicação</p>
              </div>

              {/* Campo de busca principal */}
              <div className="input-with-icon relative">
                <MagnifyingGlassIcon className="input-icon h-5 w-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="ex.: concurso público"
                  className="input-standard text-base font-medium pr-10"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setShowSuggestions(false);
                      setIsShowingHistory(false);
                      setSearchTerms([]);
                      setShowDiarioDropdown(false);
                      setShowDateFilters(false);
                      setHasSearched(false);
                      setSearchResults([]);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
                
                {/* Componente de Autocomplete */}
                <AutocompletePortal
                  anchorRef={searchInputRef as React.RefObject<HTMLElement>}
                  open={showSuggestions}
                  items={suggestions.map((suggestion, index) => ({
                    id: suggestion.id,
                    text: suggestion.term
                  }))}
                  onSelect={(item) => {
                    const selectedSuggestion = suggestions.find(s => s.id === item.id);
                    if (selectedSuggestion) {
                      handleSuggestionClick(selectedSuggestion);
                    }
                  }}
                  onClose={() => {
                    setShowSuggestions(false);
                    setIsShowingHistory(false);
                  }}
                  selectedIndex={selectedIndex}
                  renderItem={(item, index, isSelected) => {
                    const suggestion = suggestions.find(s => s.id === item.id);
                    const isFromHistory = suggestion?.timestamp && suggestion.timestamp > 0;
                    
                    return (
                      <div
                        key={item.id}
                        className={`w-full px-3 py-2 text-left text-white transition-all duration-200 flex items-center gap-2 first:rounded-t-2xl last:rounded-b-2xl ${
                          isSelected 
                            ? 'bg-blue-500/30 border-l-2 border-blue-400' 
                            : 'hover:bg-blue-500/20'
                        }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <svg className="h-3 w-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            if (suggestion) {
                              handleSuggestionClick(suggestion);
                            }
                          }}
                        >
                          <span className="block text-sm">{item.text}</span>
                          {isFromHistory && suggestion && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              <span className="inline-flex items-center gap-1">
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                {suggestion.selectedDiarios.length} diário(s) • {suggestion.searchPeriod}
                              </span>
                            </div>
                          )}
                        </div>
                        {isFromHistory && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromHistory(suggestion.id);
                            }}
                            className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer p-0.5"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    );
                  }}
                />
              </div>

              {/* Chips de Filtros Ativos */}
              {searchTerms.length > 0 && (selectedDiarios.length > 0 || searchPeriod !== '') && (
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
                        className="ml-1 hover:text-blue-200 transition-colors cursor-pointer"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  
                  {/* Período selecionado */}
                  {searchPeriod && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full border border-blue-500/30 text-sm">
                      <span>📅</span>
                      {searchPeriod === 'custom' ? 'Período personalizado' : periodOptions.find(p => p.value === searchPeriod)?.label}
                      <button
                        onClick={() => setSearchPeriod('')}
                        className="ml-1 hover:text-blue-200 transition-colors cursor-pointer"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  
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
                          className="ml-1 hover:text-green-200 transition-colors cursor-pointer"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
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
                        <div data-section="diarios" className="bg-white/5 border border-white/20 rounded-xl p-4 sm:p-6">
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
                                    className="flex items-center justify-between w-full text-left py-3 px-3 text-gray-300 hover:text-white font-medium bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer"
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
                                              className="flex items-center justify-between w-full text-left py-2 px-3 text-gray-300 hover:text-white font-medium bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer"
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
                  {(selectedDiarios.length > 0 || searchPeriod !== '') && (
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
                              className={`px-3 py-2 sm:px-5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium cursor-pointer ${
                                searchPeriod === option.value
                                  ? 'bg-blue-600 text-white'
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
                                <DatePicker
                                  selectedDate={customDateRange.start}
                                  onChange={handleStartDateChange}
                                  maxDate={customDateRange.end || new Date()}
                                  placeholder="dd/mm/aaaa"
                                  className="w-full"
                                  forcePosition="above"
                                />
                              </div>
                              
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-400 mb-2">Data final</label>
                                <DatePicker
                                  selectedDate={customDateRange.end}
                                  onChange={handleEndDateChange}
                                  minDate={customDateRange.start}
                                  maxDate={new Date()}
                                  placeholder="dd/mm/aaaa"
                                  className="w-full"
                                  forcePosition="above"
                                />
                              </div>
                            </div>
                            
                            {/* Mensagem de erro de validação */}
                            {dateValidationError && (
                              <div className="mt-4 p-3 bg-red-600/10 border border-red-500/20 rounded-lg">
                                <p className="text-sm text-red-300 text-center">
                                  {dateValidationError}
                                </p>
                              </div>
                            )}
                            
                            {/* Exibição do período selecionado */}
                            {customDateRange.start && customDateRange.end && !dateValidationError && (
                              <div className="mt-4 p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                                <p className="text-sm text-blue-300 text-center">
                                  Período selecionado: {customDateRange.start.toLocaleDateString('pt-BR')} a {customDateRange.end.toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                  )}

                  {/* Botão de busca - sempre visível */}
                  <div className="pt-4">
                    <button
                      onClick={handleSearchWithValidation}
                      disabled={isSearching || searchTerms.length === 0}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 text-base shadow-lg hover:shadow-xl disabled:shadow-none"
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
                </div>
              )}
            </div>
          )}


          {/* Monitorar Tab */}
          {activeTab === 'monitorar' && (
            <div className="space-y-6 fade-in">
              {/* Container de busca para monitoramentos */}
              <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div>
                  <h3 className="text-base font-semibold text-white sm:text-lg">Monitoramentos</h3>
                  <p className="text-sm text-gray-400 sm:text-base">Digite o termo que deseja monitorar nos diários oficiais</p>
                </div>

                {/* Campo de busca principal */}
                <div className="input-with-icon relative">
                  <MagnifyingGlassIcon className="input-icon h-5 w-5 text-gray-400" />
                  <input
                    ref={monitorSearchInputRef}
                    type="text"
                    value={monitorSearchInput}
                    onChange={(e) => handleMonitorSearchInputChange(e.target.value)}
                    onKeyDown={handleMonitorKeyDown}
                    onFocus={handleMonitorInputFocus}
                    onBlur={handleMonitorInputBlur}
                    placeholder="Ex:. João da Silva"
                    className="input-standard text-base font-medium pr-10"
                  />
                  {monitorSearchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setMonitorSearchInput('');
                        setMonitorSearchTerms([]);
                        setMonitorSelectedDiarios([]); // Limpar diários selecionados
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Componente de Autocomplete */}
                <AutocompletePortal
                  anchorRef={monitorSearchInputRef as React.RefObject<HTMLElement>}
                  open={monitorShowSuggestions}
                  items={monitorSuggestions.map((suggestion, index) => ({
                    id: suggestion.id,
                    text: suggestion.term
                  }))}
                  onSelect={(item) => {
                    const selectedSuggestion = monitorSuggestions.find(s => s.id === item.id);
                    if (selectedSuggestion) {
                      handleMonitorSuggestionClick(selectedSuggestion);
                    }
                  }}
                  onClose={() => {
                    setMonitorShowSuggestions(false);
                    setMonitorIsShowingHistory(false);
                    setMonitorSelectedIndex(-1);
                  }}
                  renderItem={(item, index, isSelected) => {
                    const suggestion = monitorSuggestions.find(s => s.id === item.id);
                    const isFromHistory = suggestion?.timestamp && suggestion.timestamp > 0;
                    
                    return (
                      <div
                        key={item.id}
                        className={`w-full px-3 py-2 text-left text-white transition-all duration-200 flex items-center gap-2 first:rounded-t-2xl last:rounded-b-2xl ${
                          isSelected 
                            ? 'bg-blue-500/30 border-l-2 border-blue-400' 
                            : 'hover:bg-blue-500/20'
                        }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <svg className="h-3 w-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            if (suggestion) {
                              handleMonitorSuggestionClick(suggestion);
                            }
                          }}
                        >
                          <span className="block text-sm">{item.text}</span>
                        </div>
                        {isFromHistory && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Função para remover do histórico de monitoramento
                              setMonitorSearchHistory(prev => {
                                const filtered = prev.filter(item => item.id !== suggestion.id);
                                if (typeof window !== 'undefined') {
                                  localStorage.setItem('monitorSearchHistory', JSON.stringify(filtered));
                                }
                                return filtered;
                              });
                            }}
                            className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer p-0.5"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    );
                  }}
                />

                {/* Chips de Termos e Diários */}
                {(monitorSearchTerms.length > 0 || monitorSelectedDiarios.length > 0) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Termos de busca */}
                    {monitorSearchTerms.map((term, index) => (
                      <span
                        key={`term-${index}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full border border-blue-500/30 text-sm"
                      >
                        <span>🔍</span>
                        <span>{term}</span>
                        <button
                          onClick={() => handleRemoveMonitorSearchTerm(index)}
                          className="ml-1 text-blue-400 hover:text-blue-200 transition-colors cursor-pointer"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    
                    
                    {/* Diários selecionados */}
                    {monitorSelectedDiarios.map((diarioId, index) => {
                      const diario = diarios.find(d => d.id === diarioId);
                      return (
                        <span
                          key={`diario-${index}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-600/20 text-green-300 rounded-full border border-green-500/30 text-sm"
                        >
                          <span>📰</span>
                          <span>{diario ? diario.name : diarioId}</span>
                          <button
                            onClick={() => {
                              setMonitorSelectedDiarios(prev => prev.filter(id => id !== diarioId));
                            }}
                            className="ml-1 text-green-400 hover:text-green-200 transition-colors cursor-pointer"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Seleção de Diários Oficiais */}
                {monitorSearchTerms.length > 0 && (
                  <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-4">
                        Selecione os diários oficiais
                      </label>
                      
                      {/* Dropdown com busca */}
                      <div data-section="monitor-diarios" className="bg-white/5 border border-white/20 rounded-xl p-4 sm:p-6">
                        {/* Busca global */}
                        <div className="mb-6">
                          <div className="input-with-icon">
                            <MagnifyingGlassIcon className="input-icon h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Buscar diários..."
                              className="input-standard text-sm w-full"
                            />
                          </div>
                        </div>

                        {/* Lista de diários com expansão/colapso */}
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {Object.entries(diariosPorPoder).map(([poder, subcategorias]) => {
                            const totalDiarios = Array.isArray(subcategorias) 
                              ? subcategorias.length 
                              : Object.values(subcategorias as Record<string, any[]>).flat().length;
                            
                            return (
                              <div key={poder}>
                                <button
                                  onClick={() => toggleMonitorPoder(poder)}
                                  className="flex items-center justify-between w-full text-left py-3 px-3 text-gray-300 hover:text-white font-medium bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer"
                                >
                                  <span className="font-semibold text-sm">{poder} ({totalDiarios})</span>
                                  <span className="transform transition-transform duration-200 text-blue-400">
                                    {monitorExpandedPoderes[poder] ? '−' : '+'}
                                  </span>
                                </button>
                                
                                {monitorExpandedPoderes[poder] && (
                                  <div className="ml-4 space-y-3 mt-2">
                                    {Array.isArray(subcategorias) ? (
                                      // Para MP e DP (arrays diretos)
                                      <div className="space-y-2">
                                        {subcategorias.map((diario) => (
                                          <label key={diario.id} className="flex items-center gap-3 py-2 px-3 text-sm text-gray-300 hover:text-white cursor-pointer rounded-lg hover:bg-white/5 transition-all duration-200">
                                            <input
                                              type="checkbox"
                                              checked={monitorSelectedDiarios.includes(diario.id)}
                                              onChange={() => {
                                                if (monitorSelectedDiarios.includes(diario.id)) {
                                                  setMonitorSelectedDiarios(prev => prev.filter(id => id !== diario.id));
                                                } else {
                                                  setMonitorSelectedDiarios(prev => [...prev, diario.id]);
                                                }
                                              }}
                                              className="w-4 h-4 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
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
                                            onClick={() => toggleMonitorSubcategoria(poder, subcategoria)}
                                            className="flex items-center justify-between w-full text-left py-2 px-3 text-gray-300 hover:text-white font-medium bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer"
                                          >
                                            <span className="font-medium text-xs">{subcategoria} ({diariosList.length})</span>
                                            <span className="transform transition-transform duration-200 text-blue-400">
                                              {monitorExpandedSubcategorias[`${poder}-${subcategoria}`] ? '−' : '+'}
                                            </span>
                                          </button>
                                          
                                          {monitorExpandedSubcategorias[`${poder}-${subcategoria}`] && (
                                            <div className="ml-4 space-y-2 mt-2">
                                              {diariosList.map((diario) => (
                                                <label key={diario.id} className="flex items-center gap-3 py-2 px-3 text-sm text-gray-300 hover:text-white cursor-pointer rounded-lg hover:bg-white/5 transition-all duration-200">
                                                  <input
                                                    type="checkbox"
                                                    checked={monitorSelectedDiarios.includes(diario.id)}
                                                    onChange={() => {
                                                      if (monitorSelectedDiarios.includes(diario.id)) {
                                                        setMonitorSelectedDiarios(prev => prev.filter(id => id !== diario.id));
                                                      } else {
                                                        setMonitorSelectedDiarios(prev => [...prev, diario.id]);
                                                      }
                                                    }}
                                                    className="w-4 h-4 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
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

                    {/* Botões de Ação */}
                    <div className="pt-4">
                      {isEditingMonitor ? (
                        <div className="flex gap-3">
                          <button
                            onClick={handleUpdateMonitorAlert}
                            disabled={monitorSearchTerms.length === 0 || monitorSelectedDiarios.length === 0}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 text-base shadow-lg hover:shadow-xl disabled:shadow-none"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Atualizar alerta de monitoramento
                          </button>
                          <button
                            onClick={handleCancelMonitorEdit}
                            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 cursor-pointer text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 text-base shadow-lg hover:shadow-xl"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleCreateMonitorAlert}
                          disabled={monitorSearchTerms.length === 0 || monitorSelectedDiarios.length === 0}
                          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 text-base shadow-lg hover:shadow-xl disabled:shadow-none"
                        >
                          <BellIcon className="h-5 w-5" />
                          Criar alerta de monitoramento
                        </button>
                      )}
                    </div>
                  </div>
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
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Diários Selecionados ({monitorDiarios.length})
                      </label>
                      {monitorDiarios.length > 0 ? (
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
                      ) : (
                        <p className="text-gray-400 text-sm">Nenhum diário selecionado</p>
                      )}
                    </div>
                    
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
                  monitoramentos.map((monitoramento) => {
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
                              <h4 className="text-sm font-semibold text-white sm:text-base">
                                {monitoramento.terms[0]}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                monitoramento.isActive 
                                  ? 'bg-green-600/20 text-green-300 border border-green-500/30' 
                                  : 'bg-red-600/20 text-red-300 border border-red-500/30'
                              }`}>
                                {monitoramento.isActive ? 'Ativo' : 'Pausado'}
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
                              className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-600/10 rounded-lg transition-colors cursor-pointer"
                              title="Ver histórico"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMonitor(monitoramento);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-600/10 rounded-lg transition-colors cursor-pointer"
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
                              className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-600/10 rounded-lg transition-colors cursor-pointer"
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
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-colors cursor-pointer"
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
                  <div className="text-center py-8 sm:py-12">
                    <BellIcon className="h-10 w-10 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h4 className="text-sm font-semibold text-white mb-2 sm:text-base">Nenhum monitoramento ativo</h4>
                    <p className="text-sm text-gray-400 mb-4">Crie alertas para acompanhar termos específicos nos diários oficiais.</p>
                    <p className="text-xs text-gray-500 mt-3">
                      💡 Você pode pausar ou editar o alerta quando quiser
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navegar Tab */}
          {activeTab === 'navegar' && (
            <div className="space-y-4 sm:space-y-6 fade-in">
              {/* Header com botão fixo */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white sm:text-lg">Navegar Diários</h3>
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
                                className="flex items-center justify-between w-full text-left py-3 px-3 text-gray-300 hover:text-white font-medium bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer"
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
                                          className="flex items-center justify-between w-full text-left py-2 px-3 text-gray-300 hover:text-white font-medium bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer"
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
                    
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      Data específica (opcional)
                    </label>
                    
                    <div className="bg-white/5 border border-white/20 rounded-xl p-4 sm:p-6">
                      <DatePicker
                        selectedDate={selectedDate ? new Date(selectedDate) : null}
                        onChange={(date) => setSelectedDate(date ? date.toISOString().split('T')[0] : '')}
                        maxDate={new Date()}
                        placeholder="dd/mm/aaaa"
                        className="w-full"
                      />
                    </div>

                    {/* Chips de períodos pré-definidos */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Períodos pré-definidos
                      </label>
                      
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            // Último disponível - data de hoje
                            const today = new Date();
                            setSelectedDate(today.toISOString().split('T')[0]);
                          }}
                          className={`px-3 py-2 rounded-xl text-sm font-medium cursor-pointer ${
                            selectedDate === new Date().toISOString().split('T')[0]
                              ? 'bg-blue-600 text-white'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/20 hover:border-white/30'
                          }`}
                        >
                          Último disponível
                        </button>
                        
                        <button
                          onClick={() => {
                            // Ontem
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            setSelectedDate(yesterday.toISOString().split('T')[0]);
                          }}
                          className={`px-3 py-2 rounded-xl text-sm font-medium cursor-pointer ${
                            selectedDate === new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                              ? 'bg-blue-600 text-white'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/20 hover:border-white/30'
                          }`}
                        >
                          Ontem
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de edições */}
              <div className="space-y-3 sm:space-y-4">
                {selectedDiario ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white sm:text-base">
                        Edições disponíveis - {diarios.find(d => d.id === selectedDiario)?.name}
                      </h4>
                      <button
                        onClick={() => setSelectedDiario('')}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                        style={{
                          backgroundColor: '#155DFC',
                          color: 'white',
                          border: '1px solid #155DFC'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#0f4bc4';
                          e.currentTarget.style.borderColor = '#0f4bc4';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#155DFC';
                          e.currentTarget.style.borderColor = '#155DFC';
                        }}
                      >
                        Limpar seleção
                      </button>
                    </div>
                    
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
                                className="expand-button px-3 py-1.5 bg-gray-600/20 text-gray-300 hover:bg-gray-600/30 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                              >
                                <span className="transform transition-transform duration-200">
                                  {expandedSections['dou-today'] ? '−' : '+'}
                                </span>
                                {expandedSections['dou-today'] ? 'Ocultar seções' : 'Ver seções'}
                              </button>
                              {/* Botão "Baixar PDF" removido para diários com múltiplas seções */}
                              <div className="px-3 py-1.5 bg-blue-600/20 text-blue-300 rounded-lg text-xs font-medium flex items-center gap-1.5">
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
                                <h6 className="text-xs font-semibold" style={{color: '#86B8ED'}}>1ª Seção</h6>
                                <span className="text-xs text-gray-400">89 páginas</span>
                              </div>
                              <p className="text-xs text-gray-400 mb-3">
                                Atos do Poder Executivo, Leis, Decretos, Portarias, etc.
                              </p>
                              <div className="flex gap-1">
                                <button className="px-2 py-1 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer">
                                  <EyeIcon className="h-2.5 w-2.5" />
                                  Ver
                                </button>
                                <button className="px-2 py-1 bg-green-600/20 text-green-300 hover:bg-green-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer">
                                  <ArrowDownTrayIcon className="h-2.5 w-2.5" />
                                  PDF
                                </button>
                              </div>
                            </div>
                            
                            <div className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="text-xs font-semibold" style={{color: '#86B8ED'}}>2ª Seção</h6>
                                <span className="text-xs text-gray-400">78 páginas</span>
                              </div>
                              <p className="text-xs text-gray-400 mb-3">
                                Atos do Poder Judiciário, Tribunais, Ministério Público, etc.
                              </p>
                              <div className="flex gap-1">
                                <button className="px-2 py-1 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer">
                                  <EyeIcon className="h-2.5 w-2.5" />
                                  Ver
                                </button>
                                <button className="px-2 py-1 bg-green-600/20 text-green-300 hover:bg-green-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer">
                                  <ArrowDownTrayIcon className="h-2.5 w-2.5" />
                                  PDF
                                </button>
                              </div>
                            </div>
                            
                            <div className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="text-xs font-semibold" style={{color: '#86B8ED'}}>3ª Seção</h6>
                                <span className="text-xs text-gray-400">80 páginas</span>
                              </div>
                              <p className="text-xs text-gray-400 mb-3">
                                Atos do Poder Legislativo, Contratos, Licitações, etc.
                              </p>
                              <div className="flex gap-1">
                                <button className="px-2 py-1 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer">
                                  <EyeIcon className="h-2.5 w-2.5" />
                                  Ver
                                </button>
                                <button className="px-2 py-1 bg-green-600/20 text-green-300 hover:bg-green-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer">
                                  <ArrowDownTrayIcon className="h-2.5 w-2.5" />
                                  PDF
                                </button>
                              </div>
                            </div>
                            
                            {/* Seção Extra A */}
                            <div className="bg-white/5 border border-orange-500/30 rounded-lg p-3 hover:bg-white/10 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="text-xs font-semibold" style={{color: '#DFA464'}}>2ª Seção - Extra A</h6>
                                <span className="text-xs text-gray-400">32 páginas</span>
                              </div>
                              <p className="text-xs text-gray-400 mb-3">
                                Atos do Poder Judiciário - Edição Extra, Urgências, etc.
                              </p>
                              <div className="flex gap-1">
                                <button className="px-2 py-1 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer">
                                  <EyeIcon className="h-2.5 w-2.5" />
                                  Ver
                                </button>
                                <button className="px-2 py-1 bg-green-600/20 text-green-300 hover:bg-green-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer">
                                  <ArrowDownTrayIcon className="h-2.5 w-2.5" />
                                  PDF
                                </button>
                              </div>
                            </div>
                            
                            {/* Seção Extra B */}
                            <div className="bg-white/5 border border-orange-500/30 rounded-lg p-3 hover:bg-white/10 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="text-xs font-semibold" style={{color: '#DFA464'}}>3ª Seção - Extra A</h6>
                                <span className="text-xs text-gray-400">33 páginas</span>
                              </div>
                              <p className="text-xs text-gray-400 mb-3">
                                Atos do Poder Legislativo - Edição Extra, Contratos Urgentes, etc.
                              </p>
                              <div className="flex gap-1">
                                <button className="px-2 py-1 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer">
                                  <EyeIcon className="h-2.5 w-2.5" />
                                  Ver
                                </button>
                                <button className="px-2 py-1 bg-green-600/20 text-green-300 hover:bg-green-600/30 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer">
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
                                {/* Botão "Baixar PDF" removido para diários com múltiplas seções */}
                                <div className="px-3 py-1.5 bg-blue-600/20 text-blue-300 rounded-lg text-xs font-medium flex items-center gap-1.5">
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
                              <button className="px-3 py-1.5 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer">
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
                    <h4 className="text-sm font-semibold text-white mb-2 sm:text-base">Selecione um diário oficial</h4>
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

      {/* Seção de Resultados Separada - Fora do container principal */}
      {activeTab === 'buscar' && searchResults.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 md:pb-24 -mt-4">
          <div data-section="results" className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-3 sm:p-4 md:p-6 card-hover-glow">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base font-semibold text-white sm:text-lg">
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
                  setHasSearched(false);
                  // Scroll para o topo da página
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Nova busca
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {searchResults.flatMap((result) => {
                // Se o resultado tem seções, criar um resultado individual para cada seção
                if (result.sections && result.sections.length > 0) {
                  return result.sections.map((section) => (
                    <div
                      key={`${result.id}-${section.id}`}
                      className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-all duration-200 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                            {result.title}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                            <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
                              {result.source} - {section.name}
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
                          <button className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer">
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            PDF
                          </button>
                        </div>
                        <button
                          onClick={() => handleSaveAsMonitor(result.title)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                            monitoredTerms.has(result.title)
                              ? 'bg-green-600/30 text-green-200'
                              : 'bg-green-600/20 text-green-300 hover:bg-green-600/30'
                          }`}
                        >
                          {monitoredTerms.has(result.title) ? (
                            <CheckIcon className="h-4 w-4" />
                          ) : (
                            <BellIcon className="h-4 w-4" />
                          )}
                          {monitoredTerms.has(result.title) && (
                            <span className="text-xs">Termo monitorado</span>
                          )}
                        </button>
                      </div>
                    </div>
                  ));
                } else {
                  // Se não tem seções, renderizar como antes
                  return (
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
                          <button className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer">
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            PDF
                          </button>
                        </div>
                        <button
                          onClick={() => handleSaveAsMonitor(result.title)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                            monitoredTerms.has(result.title)
                              ? 'bg-green-600/30 text-green-200'
                              : 'bg-green-600/20 text-green-300 hover:bg-green-600/30'
                          }`}
                        >
                          {monitoredTerms.has(result.title) ? (
                            <CheckIcon className="h-4 w-4" />
                          ) : (
                            <BellIcon className="h-4 w-4" />
                          )}
                          {monitoredTerms.has(result.title) && (
                            <span className="text-xs">Termo monitorado</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty state separado - Fora do container principal */}
      {activeTab === 'buscar' && searchResults.length === 0 && !isSearching && hasSearched && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 md:pb-24 -mt-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-3 sm:p-4 md:p-6 card-hover-glow">
            <div className="text-center py-8 sm:py-12">
              <DocumentTextIcon className="h-10 w-10 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-sm font-semibold text-white mb-2 sm:text-base">Nenhum resultado encontrado</h3>
              <p className="text-sm text-gray-400">
                Tente ampliar o período de busca, incluir mais diários ou usar termos diferentes.
              </p>
            </div>
          </div>
        </div>
      )}

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
                  <h4 className="text-base font-semibold text-white">{selectedPublication.title}</h4>
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
                        {selectedMonitor.terms[0]}
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
                    <h5 className="text-sm font-semibold text-white">Últimas Ocorrências</h5>
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
                          <button className="px-3 py-1.5 bg-white/10 text-white hover:bg-white/20 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer">
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
        <div className="fixed top-32 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
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

      {/* Test Modal */}
      <TestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-white mb-2">
                Excluir Monitoramento
              </h3>
              <p className="text-sm text-gray-300 mb-6">
                Tem certeza que deseja excluir este monitoramento? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingMonitoringId(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

