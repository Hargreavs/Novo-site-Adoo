'use client';

import { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import TransparentHeader from '@/components/TransparentHeader';
import TestModal from '@/components/TestModal';
import EditaisDouHoje from '@/components/EditaisDouHoje';
import AutocompletePortal from '@/components/AutocompletePortal';

// Componente memoizado para botão de Poder
const PoderButton = memo(({ 
  poder, 
  isDisabled, 
  onClick, 
  className 
}: { 
  poder: string; 
  isDisabled: boolean; 
  onClick: () => void; 
  className: string; 
}) => {
  return (
    <button
      onClick={onClick}
      className={className}
      disabled={isDisabled}
    >
      {poder}
    </button>
  );
});

PoderButton.displayName = 'PoderButton';

// Componente memoizado para botão de Esfera
const EsferaButton = memo(({ 
  esfera, 
  onClick, 
  className 
}: { 
  esfera: string; 
  onClick: () => void; 
  className: string; 
}) => {
  return (
    <button
      onClick={onClick}
      className={className}
    >
      {esfera}
    </button>
  );
});

EsferaButton.displayName = 'EsferaButton';

export default function ExplorarPage() {
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const searchParams = useSearchParams();
  
  // Determinar aba inicial baseada no parâmetro 'type' da URL
  const getInitialTab = () => {
    const type = searchParams.get('type') || 'dashboard';
    return type;
  };
  
  // Verificar se deve mostrar a aba "Tudo"
  const shouldShowTudoTab = () => {
    return searchParams.get('type') === 'tudo';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  
  // Atualizar aba quando os parâmetros da URL mudarem
  useEffect(() => {
    const type = searchParams.get('type') || 'dashboard';
    setActiveTab(type);
  }, [searchParams]);
  
  // Preencher campo de busca com termo da URL
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      // Preencher o campo de busca de diários se estivermos na aba diários
      if (activeTab === 'diarios') {
        setDiarioOficialSearchTerm(urlQuery);
        // Executar busca automaticamente
        executeDiarioOficialSearch(urlQuery);
      }
      // Preencher o campo de busca de processos se estivermos na aba processos
      if (activeTab === 'processos') {
        setProcessoSearchTerm(urlQuery);
        // Executar busca automaticamente
        handleProcessoSearch(urlQuery);
      }
      // Para a aba "Tudo", não precisamos preencher campos específicos
      // pois ela mostra resultados mistos automaticamente
    }
  }, [activeTab, searchParams]);
  
  const [expandedDou, setExpandedDou] = useState<string | null>(null);
  const [selectedDiario, setSelectedDiario] = useState('Diário Oficial da União');
  const [selectedPoder, setSelectedPoder] = useState('Executivo');
  const [selectedEsfera, setSelectedEsfera] = useState('Federal');
  const [showDiarioDropdown, setShowDiarioDropdown] = useState(false);
  const [diarioSearchTerm, setDiarioSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState('diarios');
  const [selectedPeriodo, setSelectedPeriodo] = useState('hoje');
  const [revealedLicitacoes, setRevealedLicitacoes] = useState(0);
  const [showMoreLicitacoes, setShowMoreLicitacoes] = useState(false);
  const [showMoreConcursos, setShowMoreConcursos] = useState(false);
  const [expandedConcurso, setExpandedConcurso] = useState<string | null>(null);
  const [expandedLicitacao, setExpandedLicitacao] = useState<string | null>(null);
  
  // Estados para busca de processos
  const [processoSearchTerm, setProcessoSearchTerm] = useState('');
  const [showProcessoSuggestions, setShowProcessoSuggestions] = useState(false);
  const [processoSuggestions, setProcessoSuggestions] = useState<string[]>([]);
  const [selectedProcessoIndex, setSelectedProcessoIndex] = useState(-1);
  const [isProcessoLoading, setIsProcessoLoading] = useState(false);
  const [processoSearchResults, setProcessoSearchResults] = useState<any[]>([]);
  const [processoDebounceTimer, setProcessoDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [selectedProcessoId, setSelectedProcessoId] = useState<number | null>(null);
  const [showProcessoModal, setShowProcessoModal] = useState(false);
  const [showProcessoDetails, setShowProcessoDetails] = useState(false);
  const [currentProcessoPage, setCurrentProcessoPage] = useState(1);
  const [processosPerPage] = useState(5);
  
  // Refs para autocomplete portal
  const processoAnchorRef = useRef<HTMLDivElement>(null);
  
  // Estados para busca de Diários Oficiais
  const [diarioOficialSearchTerm, setDiarioOficialSearchTerm] = useState('');
  const [showDiarioOficialSuggestions, setShowDiarioOficialSuggestions] = useState(false);
  const [diarioOficialSuggestions, setDiarioOficialSuggestions] = useState<string[]>([]);
  const [selectedDiarioOficialIndex, setSelectedDiarioOficialIndex] = useState(-1);
  const [diarioOficialSearchResults, setDiarioOficialSearchResults] = useState<any[]>([]);
  const [isDiarioOficialLoading, setIsDiarioOficialLoading] = useState(false);
  const [diarioOficialDebounceTimer, setDiarioOficialDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [showDiarioOficialDetails, setShowDiarioOficialDetails] = useState(false);
  const [selectedDiarioOficialId, setSelectedDiarioOficialId] = useState<number | null>(null);
  
  // Refs para autocomplete portal
  const diarioOficialAnchorRef = useRef<HTMLDivElement>(null);
  const [currentDiarioOficialPage, setCurrentDiarioOficialPage] = useState(1);
  const [diariosOficiaisPerPage] = useState(5);
  
  // Estados para aba Tudo
  const [currentTudoPage, setCurrentTudoPage] = useState(1);
  const [tudoPerPage] = useState(10);
  const [selectedTudoItem, setSelectedTudoItem] = useState<any>(null);
  const [showTudoDetails, setShowTudoDetails] = useState(false);
  
  // Estados para paginação dos detalhes de processos na aba Tudo
  const [currentProcessoDetailsPage, setCurrentProcessoDetailsPage] = useState(1);
  const [processosDetailsPerPage] = useState(10);
  
  // Converter sugestões para formato do portal
  const processoSuggestionsForPortal = processoSuggestions.map((suggestion, index) => ({
    id: `${suggestion}-${index}`,
    text: suggestion,
    highlighted: suggestion.toLowerCase().includes(processoSearchTerm.toLowerCase())
  }));

  const diarioOficialSuggestionsForPortal = diarioOficialSuggestions.map((suggestion, index) => ({
    id: `${suggestion}-${index}`,
    text: suggestion,
    highlighted: suggestion.toLowerCase().includes(diarioOficialSearchTerm.toLowerCase())
  }));

  // Função para ajustar filtros quando mudar de aba
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Preservar o termo pesquisado da URL
    const urlQuery = searchParams.get('q');
    
    if (tab === 'processos') {
      // Ajustar filtros para Diários de Justiça
      setSelectedDiario('Todos');
      setSelectedPoder('Judiciário');
      setSelectedEsfera('Federal');
      
      // Preencher e executar busca se houver termo da URL
      if (urlQuery) {
        setProcessoSearchTerm(urlQuery);
        handleProcessoSearch(urlQuery);
      }
    } else if (tab === 'diarios') {
      // Ajustar filtros para Diários Oficiais
      setSelectedDiario('Todos');
      setSelectedPoder('Executivo');
      setSelectedEsfera('Federal');
      
      // Preencher e executar busca se houver termo da URL
      if (urlQuery) {
        setDiarioOficialSearchTerm(urlQuery);
        executeDiarioOficialSearch(urlQuery);
      }
    } else if (tab === 'dashboard') {
      // Ajustar filtros para Diários Oficiais
      setSelectedDiario('Todos');
      setSelectedPoder('Executivo');
      setSelectedEsfera('Federal');
    }
    // Para a aba 'tudo', não precisamos fazer nada especial
    // pois ela mostra resultados mistos automaticamente
  };
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'tudo';

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDiarioDropdown(false);
        setDiarioSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Função para revelar licitações
  const handleRevealLicitacao = () => {
    setIsTestModalOpen(true);
  };

  // Função para mostrar mais concursos com scroll
  const handleShowMoreConcursos = () => {
    setShowMoreConcursos(true);
    // Scroll para centralizar a seção de concursos
    setTimeout(() => {
      const element = document.getElementById('concursos-section');
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  // Função para mostrar menos concursos com scroll
  const handleShowLessConcursos = () => {
    setShowMoreConcursos(false);
    // Scroll para o topo da seção de concursos
    setTimeout(() => {
      const element = document.getElementById('concursos-section');
      if (element) {
        // Usar scrollIntoView com block: 'start' para ir para o topo
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 200); // Aumentar o delay para garantir que o estado foi atualizado
  };

  // Função para mostrar mais licitações com scroll
  const handleShowMoreLicitacoes = () => {
    setShowMoreLicitacoes(true);
    // Scroll para centralizar a seção de licitações
    setTimeout(() => {
      const element = document.getElementById('licitacoes-section');
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  // Função para mostrar menos licitações com scroll
  const handleShowLessLicitacoes = () => {
    setShowMoreLicitacoes(false);
    // Scroll para o topo da seção de licitações
    setTimeout(() => {
      const element = document.getElementById('licitacoes-section');
      if (element) {
        // Usar scrollIntoView com block: 'start' para ir para o topo
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 200); // Aumentar o delay para garantir que o estado foi atualizado
  };

  // Funções para busca de processos
  const mockProcessoSuggestions = [
    'Rafael Ximenes',
    'Rafael Ximenes Santos',
    'Rafael Ximenes Lima',
    'Rafael Ximenes Oliveira',
    'João da Silva',
    'João da Silva Lima',
    'João da Silva Santos',
    'Maria da Silva',
    'José da Silva',
    '0001234-56.2024.5.10.0000',
    '0001234-56.2024.5.10.0001',
    '0001234-56.2024.5.10.0002',
    '0001234-56.2024.5.11.0000',
    '0001234-56.2024.5.12.0000'
  ];

  const mockProcessoResults = [
    {
      id: 1,
      nome: 'Rafael Ximenes',
      totalProcessos: 19,
      diario: 'Diário da Justiça do Estado de São Paulo',
      data: '18/01/2024'
    },
    {
      id: 2,
      nome: 'Rafael Ximenes Santos',
      totalProcessos: 22,
      diario: 'Diário da Justiça do Estado do Rio de Janeiro',
      data: '17/01/2024'
    },
    {
      id: 3,
      nome: 'Rafael Ximenes Lima',
      totalProcessos: 35,
      diario: 'Diário da Justiça do Estado de Minas Gerais',
      data: '16/01/2024'
    },
    {
      id: 4,
      nome: 'Rafael Ximenes Oliveira',
      totalProcessos: 14,
      diario: 'Diário da Justiça do Estado do Paraná',
      data: '15/01/2024'
    },
    {
      id: 5,
      nome: 'Rafael Ximenes Mattos',
      totalProcessos: 11,
      diario: 'Diário da Justiça do Estado de Santa Catarina',
      data: '14/01/2024'
    }
  ];

  // Mock data para detalhes dos processos individuais
  const mockProcessoDetalhes = {
    1: [ // Rafael Ximenes - 19 processos
      {
        id: 'proc_1_1',
        numero: '1512345-28.2018.8.26.0577',
        partes: 'Prefeitura Municipal de São José dos Campos x Rafael Ximenes e outros',
        tribunal: 'TJSP',
        dataPublicacao: '15/09/2024',
        movimentacao: 'Audiência de Conciliação',
        instancia: 'Primeiro Grau',
        status: 'Em andamento',
        ultimaMovimentacao: '25/09/2024'
      },
      {
        id: 'proc_1_2',
        numero: '1523456-28.2019.8.26.0577',
        partes: 'Rafael Ximenes x Estado de São Paulo',
        tribunal: 'TJSP',
        dataPublicacao: '14/09/2024',
        movimentacao: 'Sentença',
        instancia: 'Primeiro Grau',
        status: 'Julgado',
        ultimaMovimentacao: '20/09/2024'
      },
      {
        id: 'proc_1_3',
        numero: '1534567-28.2020.8.26.0577',
        partes: 'Rafael Ximenes x Prefeitura Municipal de Campinas',
        tribunal: 'TJSP',
        dataPublicacao: '13/09/2024',
        movimentacao: 'Recurso',
        instancia: 'Segundo Grau',
        status: 'Em recurso',
        ultimaMovimentacao: '18/09/2024'
      },
      {
        id: 'proc_1_4',
        numero: '1545678-28.2021.8.26.0577',
        partes: 'Rafael Ximenes x Banco do Brasil S.A.',
        tribunal: 'TJSP',
        dataPublicacao: '12/09/2024',
        movimentacao: 'Citação',
        instancia: 'Primeiro Grau',
        status: 'Em andamento',
        ultimaMovimentacao: '17/09/2024'
      },
      {
        id: 'proc_1_5',
        numero: '1556789-28.2022.8.26.0577',
        partes: 'Rafael Ximenes x Caixa Econômica Federal',
        tribunal: 'TJSP',
        dataPublicacao: '11/09/2024',
        movimentacao: 'Despacho',
        instancia: 'Primeiro Grau',
        status: 'Em andamento',
        ultimaMovimentacao: '16/09/2024'
      },
      {
        id: 'proc_1_6',
        numero: '1567890-28.2023.8.26.0577',
        partes: 'Rafael Ximenes x INSS',
        tribunal: 'TRF3',
        dataPublicacao: '10/09/2024',
        movimentacao: 'Audiência de Instrução',
        instancia: 'Primeiro Grau',
        status: 'Em andamento',
        ultimaMovimentacao: '15/09/2024'
      },
      {
        id: 'proc_1_7',
        numero: '1578901-28.2024.8.26.0577',
        partes: 'Rafael Ximenes x União Federal',
        tribunal: 'TRF3',
        dataPublicacao: '09/09/2024',
        movimentacao: 'Sentença',
        instancia: 'Primeiro Grau',
        status: 'Julgado',
        ultimaMovimentacao: '14/09/2024'
      },
      {
        id: 'proc_1_8',
        numero: '1589012-28.2025.8.26.0577',
        partes: 'Rafael Ximenes x Prefeitura Municipal de Santos',
        tribunal: 'TJSP',
        dataPublicacao: '08/09/2024',
        movimentacao: 'Recurso',
        instancia: 'Segundo Grau',
        status: 'Em recurso',
        ultimaMovimentacao: '13/09/2024'
      },
      {
        id: 'proc_1_9',
        numero: '1590123-28.2026.8.26.0577',
        partes: 'Rafael Ximenes x Estado de São Paulo',
        tribunal: 'TJSP',
        dataPublicacao: '07/09/2024',
        movimentacao: 'Citação',
        instancia: 'Primeiro Grau',
        status: 'Em andamento',
        ultimaMovimentacao: '12/09/2024'
      },
      {
        id: 'proc_1_10',
        numero: '1601234-28.2027.8.26.0577',
        partes: 'Rafael Ximenes x Banco Itaú S.A.',
        tribunal: 'TJSP',
        dataPublicacao: '06/09/2024',
        movimentacao: 'Despacho',
        instancia: 'Primeiro Grau',
        status: 'Em andamento',
        ultimaMovimentacao: '11/09/2024'
      },
      {
        id: 'proc_1_11',
        numero: '1612345-28.2028.8.26.0577',
        partes: 'Rafael Ximenes x Prefeitura Municipal de Guarulhos',
        tribunal: 'TJSP',
        dataPublicacao: '05/09/2024',
        movimentacao: 'Audiência de Conciliação',
        instancia: 'Primeiro Grau',
        status: 'Conciliação',
        ultimaMovimentacao: '10/09/2024'
      },
      {
        id: 'proc_1_12',
        numero: '1623456-28.2029.8.26.0577',
        partes: 'Rafael Ximenes x Caixa Econômica Federal',
        tribunal: 'TJSP',
        dataPublicacao: '04/09/2024',
        movimentacao: 'Sentença',
        instancia: 'Primeiro Grau',
        status: 'Julgado',
        ultimaMovimentacao: '09/09/2024'
      },
      {
        id: 'proc_1_13',
        numero: '1634567-28.2030.8.26.0577',
        partes: 'Rafael Ximenes x Estado de São Paulo',
        tribunal: 'TJSP',
        dataPublicacao: '03/09/2024',
        movimentacao: 'Recurso',
        instancia: 'Segundo Grau',
        status: 'Em recurso',
        ultimaMovimentacao: '08/09/2024'
      },
      {
        id: 'proc_1_14',
        numero: '1645678-28.2031.8.26.0577',
        partes: 'Rafael Ximenes x Banco Bradesco S.A.',
        tribunal: 'TJSP',
        dataPublicacao: '02/09/2024',
        movimentacao: 'Citação',
        instancia: 'Primeiro Grau',
        status: 'Em andamento',
        ultimaMovimentacao: '07/09/2024'
      },
      {
        id: 'proc_1_15',
        numero: '1656789-28.2032.8.26.0577',
        partes: 'Rafael Ximenes x Prefeitura Municipal de São Bernardo do Campo',
        tribunal: 'TJSP',
        dataPublicacao: '01/09/2024',
        movimentacao: 'Despacho',
        instancia: 'Primeiro Grau',
        status: 'Em andamento',
        ultimaMovimentacao: '06/09/2024'
      },
      {
        id: 'proc_1_16',
        numero: '1667890-28.2033.8.26.0577',
        partes: 'Rafael Ximenes x INSS',
        tribunal: 'TRF3',
        dataPublicacao: '31/08/2024',
        movimentacao: 'Audiência de Instrução',
        instancia: 'Primeiro Grau',
        status: 'Em andamento',
        ultimaMovimentacao: '05/09/2024'
      },
      {
        id: 'proc_1_17',
        numero: '1678901-28.2034.8.26.0577',
        partes: 'Rafael Ximenes x União Federal',
        tribunal: 'TRF3',
        dataPublicacao: '30/08/2024',
        movimentacao: 'Sentença',
        instancia: 'Primeiro Grau',
        status: 'Julgado',
        ultimaMovimentacao: '04/09/2024'
      },
      {
        id: 'proc_1_18',
        numero: '1689012-28.2035.8.26.0577',
        partes: 'Rafael Ximenes x Prefeitura Municipal de Osasco',
        tribunal: 'TJSP',
        dataPublicacao: '29/08/2024',
        movimentacao: 'Recurso',
        instancia: 'Segundo Grau',
        status: 'Em recurso',
        ultimaMovimentacao: '03/09/2024'
      },
      {
        id: 'proc_1_19',
        numero: '1690123-28.2036.8.26.0577',
        partes: 'Rafael Ximenes x Estado de São Paulo',
        tribunal: 'TJSP',
        dataPublicacao: '28/08/2024',
        movimentacao: 'Citação',
        instancia: 'Primeiro Grau',
        status: 'Em andamento',
        ultimaMovimentacao: '02/09/2024'
      }
    ],
    2: [ // Rafael Ximenes Santos - 22 processos
      {
        id: 'proc_2_1',
        numero: '1612345-28.2018.8.26.0577',
        partes: 'Rafael Ximenes Santos x União Federal',
        tribunal: 'TRF3',
        dataPublicacao: '14/09/2024',
        movimentacao: 'Audiência de Instrução',
        instancia: 'Primeiro Grau',
        status: 'Em andamento',
        ultimaMovimentacao: '22/09/2024'
      },
      {
        id: 'proc_2_2',
        numero: '1623456-28.2019.8.26.0577',
        partes: 'Rafael Ximenes Santos x INSS',
        tribunal: 'TRF3',
        dataPublicacao: '13/09/2024',
        movimentacao: 'Sentença',
        instancia: 'Primeiro Grau',
        status: 'Julgado',
        ultimaMovimentacao: '21/09/2024'
      }
      // ... mais 20 processos
    ],
    3: [ // Rafael Ximenes Lima - 35 processos
      {
        id: 'proc_3_1',
        numero: '1712345-28.2018.8.26.0577',
        partes: 'Rafael Ximenes Lima x Banco do Brasil',
        tribunal: 'TJSP',
        dataPublicacao: '13/09/2024',
        movimentacao: 'Citação',
        instancia: 'Primeiro Grau',
        status: 'Em andamento',
        ultimaMovimentacao: '19/09/2024'
      },
      {
        id: 'proc_3_2',
        numero: '1723456-28.2019.8.26.0577',
        partes: 'Rafael Ximenes Lima x Estado de São Paulo',
        tribunal: 'TJSP',
        dataPublicacao: '12/09/2024',
        movimentacao: 'Audiência de Conciliação',
        instancia: 'Primeiro Grau',
        status: 'Conciliação',
        ultimaMovimentacao: '18/09/2024'
      }
      // ... mais 33 processos
    ],
    4: [ // Rafael Ximenes Oliveira - 14 processos
      {
        id: 'proc_4_1',
        numero: '1812345-28.2018.8.26.0577',
        partes: 'Rafael Ximenes Oliveira x Caixa Econômica Federal',
        tribunal: 'TJSP',
        dataPublicacao: '12/09/2024',
        movimentacao: 'Despacho',
        instancia: 'Primeiro Grau',
        status: 'Em andamento',
        ultimaMovimentacao: '17/09/2024'
      },
      {
        id: 'proc_4_2',
        numero: '1823456-28.2019.8.26.0577',
        partes: 'Rafael Ximenes Oliveira x Prefeitura Municipal de Santos',
        tribunal: 'TJSP',
        dataPublicacao: '11/09/2024',
        movimentacao: 'Recurso',
        instancia: 'Segundo Grau',
        status: 'Em recurso',
        ultimaMovimentacao: '16/09/2024'
      }
      // ... mais 12 processos
    ],
    5: [ // Rafael Ximenes Mattos - 11 processos
      {
        id: 'proc_5_1',
        numero: '1912345-28.2018.8.26.0577',
        partes: 'Rafael Ximenes Mattos x INSS',
        tribunal: 'TRF3',
        dataPublicacao: '11/09/2024',
        movimentacao: 'Audiência de Conciliação',
        instancia: 'Primeiro Grau',
        status: 'Conciliação',
        ultimaMovimentacao: '16/09/2024'
      },
      {
        id: 'proc_5_2',
        numero: '1923456-28.2019.8.26.0577',
        partes: 'Rafael Ximenes Mattos x União Federal',
        tribunal: 'TRF3',
        dataPublicacao: '10/09/2024',
        movimentacao: 'Sentença',
        instancia: 'Primeiro Grau',
        status: 'Julgado',
        ultimaMovimentacao: '15/09/2024'
      }
      // ... mais 9 processos
    ]
  };

  // Função para filtrar sugestões
  const filterProcessoSuggestions = (value: string) => {
    if (value.length < 2) {
      setProcessoSuggestions([]);
      return;
    }
    
    const filtered = mockProcessoSuggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    );
    setProcessoSuggestions(filtered);
  };

  // Função para lidar com mudança no input
  const handleProcessoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProcessoSearchTerm(value);
    
    // Limpar resultados sempre que o texto for alterado
    setProcessoSearchResults([]);
    setSelectedProcessoId(null);
    setShowProcessoDetails(false);
    setCurrentProcessoPage(1);
    
    // Mostrar sugestões imediatamente se tiver 2+ caracteres
    if (value.length >= 2) {
      filterProcessoSuggestions(value);
      setShowProcessoSuggestions(true);
    } else {
      setProcessoSuggestions([]);
      setShowProcessoSuggestions(false);
    }
    
    // Limpar timer anterior
    if (processoDebounceTimer) {
      clearTimeout(processoDebounceTimer);
    }
    
    // Timer removido - busca só acontece ao selecionar sugestão
  };

  // Função para lidar com foco no input
  const handleProcessoInputFocus = () => {
    if (processoSearchTerm.length >= 2) {
      filterProcessoSuggestions(processoSearchTerm);
      setShowProcessoSuggestions(true);
    }
  };

  // Função para fechar sugestões
  const closeProcessoSuggestions = () => {
    setShowProcessoSuggestions(false);
    setSelectedProcessoIndex(-1);
  };

  // Função para limpar input
  const clearProcessoInput = () => {
    setProcessoSearchTerm('');
    setProcessoSuggestions([]);
    setShowProcessoSuggestions(false);
    setProcessoSearchResults([]);
    setSelectedProcessoIndex(-1);
    setSelectedProcessoId(null);
    setShowProcessoDetails(false);
    setCurrentProcessoPage(1);
  };

  // Função para selecionar sugestão
  const handleProcessoSuggestionClick = (suggestion: string) => {
    setProcessoSearchTerm(suggestion);
    setShowProcessoSuggestions(false);
    setSelectedProcessoIndex(-1);
    // Executar busca automaticamente
    handleProcessoSearch(suggestion);
  };

  // Função para lidar com teclas
  const handleProcessoKeyDown = (e: React.KeyboardEvent) => {
    if (!showProcessoSuggestions || processoSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedProcessoIndex(prev => 
          prev < processoSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedProcessoIndex(prev => 
          prev > 0 ? prev - 1 : processoSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedProcessoIndex >= 0) {
          handleProcessoSuggestionClick(processoSuggestions[selectedProcessoIndex]);
        } else if (processoSearchTerm.trim()) {
          handleProcessoSearch();
        }
        break;
      case 'Escape':
        closeProcessoSuggestions();
        break;
    }
  };

  // Função de busca
  const handleProcessoSearch = (term?: string) => {
    const searchTerm = term || processoSearchTerm;
    console.log('Buscando por:', searchTerm);
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
      setIsProcessoLoading(true);
      setShowProcessoSuggestions(false);
      
      // Simular busca
      setTimeout(() => {
        const results = mockProcessoResults.filter(processo =>
          processo.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
        console.log('Resultados encontrados:', results);
        setProcessoSearchResults(results);
        setIsProcessoLoading(false);
      }, 1500);
    }
  };

  // Função para ver detalhes do processo
  const handleProcessoDetails = (processoId: number) => {
    setSelectedProcessoId(processoId);
    setShowProcessoDetails(true);
  };

  // Função para voltar à lista de processos
  const backToProcessoList = () => {
    setShowProcessoDetails(false);
    setSelectedProcessoId(null);
    setCurrentProcessoPage(1); // Reset para primeira página
  };

  // Funções de paginação
  const getCurrentProcessos = () => {
    if (!selectedProcessoId) return [];
    const processos = mockProcessoDetalhes[selectedProcessoId as keyof typeof mockProcessoDetalhes] || [];
    const startIndex = (currentProcessoPage - 1) * processosPerPage;
    const endIndex = startIndex + processosPerPage;
    return processos.slice(startIndex, endIndex);
  };

  const getTotalProcessosPages = () => {
    if (!selectedProcessoId) return 0;
    const processos = mockProcessoDetalhes[selectedProcessoId as keyof typeof mockProcessoDetalhes] || [];
    return Math.ceil(processos.length / processosPerPage);
  };

  const handleProcessoPageChange = (page: number) => {
    setCurrentProcessoPage(page);
  };

  // Mock data para resultados de Diários Oficiais
  const mockDiarioResults = {
    'Rafael Ximenes': [
      {
        id: 1,
        titulo: 'EDITAL DE CONCURSO PÚBLICO Nº 001/2024 - PREFEITURA MUNICIPAL',
        diario: 'Diário Oficial da União',
        data: '18/01/2024',
        secao: 'Seção 3 - Concursos e Licitações',
        edicao: '12348',
        conteudo: 'Abertura de concurso público para diversos cargos, incluindo vagas para Rafael Ximenes e outros candidatos.'
      },
      {
        id: 2,
        titulo: 'EDITAL DE LICITAÇÃO Nº 045/2024 - CONTRATAÇÃO DE SERVIÇOS',
        diario: 'Diário Oficial do Estado de São Paulo',
        data: '17/01/2024',
        secao: 'Seção 2 - Licitações',
        edicao: '45678',
        conteudo: 'Licitação para contratação de serviços de consultoria, com participação de Rafael Ximenes e outras empresas.'
      },
      {
        id: 3,
        titulo: 'PORTARIA Nº 123/2024 - NOMEAÇÃO DE SERVIDORES',
        diario: 'Diário Oficial da União',
        data: '16/01/2024',
        secao: 'Seção 1 - Atos do Poder Executivo',
        edicao: '12347',
        conteudo: 'Nomeação de Rafael Ximenes para cargo público em órgão federal.'
      }
    ],
    'João da Silva': [
      {
        id: 1,
        titulo: 'CONCURSO PÚBLICO Nº 001/2024 - PREFEITURA MUNICIPAL DE SÃO PAULO',
        diario: 'Diário Oficial da União',
        data: '18/01/2024',
        secao: 'Seção 3 - Concursos e Licitações',
        edicao: '12348',
        conteudo: 'Abertura de concurso público para diversos cargos na Prefeitura Municipal de São Paulo, incluindo vagas para João da Silva e outros candidatos.'
      },
      {
        id: 2,
        titulo: 'EDITAL DE LICITAÇÃO Nº 045/2024 - CONTRATAÇÃO DE SERVIÇOS',
        diario: 'Diário Oficial do Estado de São Paulo',
        data: '17/01/2024',
        secao: 'Seção 2 - Licitações',
        edicao: '45678',
        conteudo: 'Licitação para contratação de serviços de consultoria, com participação de João da Silva e outras empresas.'
      },
      {
        id: 3,
        titulo: 'PORTARIA Nº 123/2024 - NOMEAÇÃO DE SERVIDORES',
        diario: 'Diário Oficial da União',
        data: '16/01/2024',
        secao: 'Seção 1 - Atos do Poder Executivo',
        edicao: '12347',
        conteudo: 'Nomeação de João da Silva para o cargo de Analista Administrativo na Secretaria de Estado.'
      }
    ],
    'Rafael Ximenes': [
      {
        id: 10,
        nome: 'Rafael Ximenes',
        diario: 'Diário Oficial da União',
        data: '18/01/2024',
        resultados: 21,
        conteudo: 'Mencionado em edital de concurso público para provimento de vagas na Prefeitura Municipal de São Paulo.'
      },
      {
        id: 11,
        nome: 'Rafael Ximenes da Silva',
        diario: 'Diário Oficial do Estado de São Paulo',
        data: '17/01/2024',
        resultados: 8,
        conteudo: 'Citado em processo licitatório para contratação de serviços de manutenção predial.'
      },
      {
        id: 12,
        nome: 'Rafael Ximenes Santos',
        diario: 'Diário Oficial da União',
        data: '16/01/2024',
        resultados: 15,
        conteudo: 'Mencionado em portaria da Secretaria de Educação estabelecendo diretrizes para políticas públicas.'
      },
      {
        id: 13,
        nome: 'Rafael Ximenes Oliveira',
        diario: 'Diário Oficial do Estado do Rio de Janeiro',
        data: '15/01/2024',
        resultados: 3,
        conteudo: 'Referenciado em decreto governamental sobre políticas de desenvolvimento regional.'
      },
      {
        id: 14,
        nome: 'Rafael Ximenes Costa',
        diario: 'Diário Oficial da União',
        data: '14/01/2024',
        resultados: 12,
        conteudo: 'Aparece em resolução do Conselho Federal de Administração sobre diretrizes profissionais.'
      }
    ],
    'Licitação': [
      {
        id: 4,
        titulo: 'EDITAL DE LICITAÇÃO Nº 001/2024 - AQUISIÇÃO DE EQUIPAMENTOS',
        diario: 'Diário Oficial da União',
        data: '18/01/2024',
        secao: 'Seção 3 - Concursos e Licitações',
        edicao: '12348',
        conteudo: 'Licitação para aquisição de equipamentos de informática para órgãos públicos federais.'
      },
      {
        id: 5,
        titulo: 'PREGÃO ELETRÔNICO Nº 045/2024 - CONTRATAÇÃO DE SERVIÇOS',
        diario: 'Diário Oficial do Estado de São Paulo',
        data: '17/01/2024',
        secao: 'Seção 2 - Licitações',
        edicao: '45678',
        conteudo: 'Pregão eletrônico para contratação de serviços de manutenção predial.'
      },
      {
        id: 6,
        titulo: 'TOMADA DE PREÇOS Nº 012/2024 - OBRAS DE INFRAESTRUTURA',
        diario: 'Diário Oficial do Município de São Paulo',
        data: '16/01/2024',
        secao: 'Seção 1 - Licitações',
        edicao: '78901',
        conteudo: 'Tomada de preços para execução de obras de infraestrutura urbana.'
      }
    ],
    'Concurso Público': [
      {
        id: 7,
        titulo: 'CONCURSO PÚBLICO Nº 002/2024 - MINISTÉRIO DA EDUCAÇÃO',
        diario: 'Diário Oficial da União',
        data: '18/01/2024',
        secao: 'Seção 3 - Concursos e Licitações',
        edicao: '12348',
        conteudo: 'Concurso público para provimento de vagas em cargos de nível superior no Ministério da Educação.'
      },
      {
        id: 8,
        titulo: 'CONCURSO PÚBLICO Nº 003/2024 - POLÍCIA CIVIL DO ESTADO',
        diario: 'Diário Oficial do Estado de São Paulo',
        data: '17/01/2024',
        secao: 'Seção 1 - Concursos',
        edicao: '45679',
        conteudo: 'Concurso público para ingresso na carreira policial civil do estado de São Paulo.'
      },
      {
        id: 9,
        titulo: 'CONCURSO PÚBLICO Nº 004/2024 - PREFEITURA MUNICIPAL',
        diario: 'Diário Oficial do Município de São Paulo',
        data: '16/01/2024',
        secao: 'Seção 2 - Concursos',
        edicao: '78902',
        conteudo: 'Concurso público para provimento de vagas na administração municipal.'
      }
    ]
  };

  // Mock data para detalhes dos diários individuais
  const mockDiarioDetalhes = {
    1: [ // João da Silva - 3 resultados
      {
        id: 'diario_1_1',
        titulo: 'CONCURSO PÚBLICO Nº 001/2024 - PREFEITURA MUNICIPAL DE SÃO PAULO',
        diario: 'Diário Oficial da União',
        data: '18/01/2024',
        secao: 'Seção 3 - Concursos e Licitações',
        edicao: '12348',
        conteudo: 'Abertura de concurso público para diversos cargos na Prefeitura Municipal de São Paulo, incluindo vagas para João da Silva e outros candidatos.',
        orgao: 'Prefeitura Municipal de São Paulo',
        cargo: 'Analista Administrativo',
        salario: 'R$ 8.500,00',
        requisitos: 'Ensino superior completo em Administração ou áreas afins',
        prazoInscricao: '15/02/2024',
        dataProva: '10/03/2024'
      }
    ],
    4: [ // Licitação - 3 resultados
      {
        id: 'diario_4_1',
        titulo: 'EDITAL DE LICITAÇÃO Nº 001/2024 - AQUISIÇÃO DE EQUIPAMENTOS',
        diario: 'Diário Oficial da União',
        data: '18/01/2024',
        secao: 'Seção 3 - Concursos e Licitações',
        edicao: '12348',
        conteudo: 'Licitação para aquisição de equipamentos de informática para órgãos públicos federais.',
        orgao: 'Ministério da Ciência e Tecnologia',
        modalidade: 'Pregão Eletrônico',
        valorEstimado: 'R$ 2.500.000,00',
        prazoEntrega: '90 dias',
        dataAbertura: '25/02/2024'
      }
    ],
    7: [ // Concurso Público - 3 resultados
      {
        id: 'diario_7_1',
        titulo: 'CONCURSO PÚBLICO Nº 002/2024 - MINISTÉRIO DA EDUCAÇÃO',
        diario: 'Diário Oficial da União',
        data: '18/01/2024',
        secao: 'Seção 3 - Concursos e Licitações',
        edicao: '12348',
        conteudo: 'Concurso público para provimento de vagas em cargos de nível superior no Ministério da Educação.',
        orgao: 'Ministério da Educação',
        cargo: 'Professor de Matemática',
        salario: 'R$ 12.000,00',
        requisitos: 'Licenciatura em Matemática e experiência docente',
        prazoInscricao: '20/02/2024',
        dataProva: '15/03/2024'
      }
    ],
    10: [ // Rafael Ximenes - 21 resultados
      {
        id: 'diario_10_1',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial da União',
        trecho: 'Presidente do Tribunal Superior do Trabalho convoca RAFAEL XIMENES para assumir cargo de Analista em Tecnologia da Informação do...',
        data: '24/11/2024'
      },
      {
        id: 'diario_10_2',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial do Estado de São Paulo',
        trecho: 'Secretaria de Estado da Educação nomeia RAFAEL XIMENES para o cargo de Coordenador de Projetos Educacionais...',
        data: '23/11/2024'
      },
      {
        id: 'diario_10_3',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial da União',
        trecho: 'Ministério da Ciência e Tecnologia publica edital de licitação com participação de RAFAEL XIMENES como consultor técnico...',
        data: '22/11/2024'
      },
      {
        id: 'diario_10_4',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial do Estado do Rio de Janeiro',
        trecho: 'Prefeitura do Rio de Janeiro convoca RAFAEL XIMENES para prestar depoimento em processo administrativo...',
        data: '21/11/2024'
      },
      {
        id: 'diario_10_5',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial da União',
        trecho: 'Tribunal Regional do Trabalho publica sentença em processo trabalhista envolvendo RAFAEL XIMENES...',
        data: '20/11/2024'
      },
      {
        id: 'diario_10_6',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial do Estado de Minas Gerais',
        trecho: 'Governo de Minas Gerais nomeia RAFAEL XIMENES para comissão de avaliação de projetos de inovação...',
        data: '19/11/2024'
      },
      {
        id: 'diario_10_7',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial da União',
        trecho: 'Ministério da Educação publica portaria reconhecendo curso de pós-graduação coordenado por RAFAEL XIMENES...',
        data: '18/11/2024'
      },
      {
        id: 'diario_10_8',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial do Estado de São Paulo',
        trecho: 'Assembleia Legislativa de São Paulo convida RAFAEL XIMENES para audiência pública sobre tecnologia...',
        data: '17/11/2024'
      },
      {
        id: 'diario_10_9',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial da União',
        trecho: 'Receita Federal publica despacho sobre declaração de imposto de renda de RAFAEL XIMENES...',
        data: '16/11/2024'
      },
      {
        id: 'diario_10_10',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial do Estado do Paraná',
        trecho: 'Governo do Paraná contrata RAFAEL XIMENES para consultoria em projeto de digitalização...',
        data: '15/11/2024'
      },
      {
        id: 'diario_10_11',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial da União',
        trecho: 'Tribunal Superior Eleitoral publica resolução sobre sistema de votação eletrônica desenvolvido por RAFAEL XIMENES...',
        data: '14/11/2024'
      },
      {
        id: 'diario_10_12',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial do Estado de Santa Catarina',
        trecho: 'Prefeitura de Florianópolis nomeia RAFAEL XIMENES para comissão de licitação de serviços de TI...',
        data: '13/11/2024'
      },
      {
        id: 'diario_10_13',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial da União',
        trecho: 'Ministério da Saúde publica edital de pesquisa com participação de RAFAEL XIMENES como pesquisador...',
        data: '12/11/2024'
      },
      {
        id: 'diario_10_14',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial do Estado de Goiás',
        trecho: 'Secretaria de Estado de Goiás contrata RAFAEL XIMENES para desenvolvimento de sistema de gestão...',
        data: '11/11/2024'
      },
      {
        id: 'diario_10_15',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial da União',
        trecho: 'Banco Central do Brasil publica circular sobre sistema de pagamentos desenvolvido por RAFAEL XIMENES...',
        data: '10/11/2024'
      },
      {
        id: 'diario_10_16',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial do Estado de Bahia',
        trecho: 'Governo da Bahia nomeia RAFAEL XIMENES para comissão de modernização administrativa...',
        data: '09/11/2024'
      },
      {
        id: 'diario_10_17',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial da União',
        trecho: 'Ministério da Justiça publica portaria sobre sistema de segurança digital coordenado por RAFAEL XIMENES...',
        data: '08/11/2024'
      },
      {
        id: 'diario_10_18',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial do Estado de Pernambuco',
        trecho: 'Prefeitura do Recife contrata RAFAEL XIMENES para consultoria em projeto de smart city...',
        data: '07/11/2024'
      },
      {
        id: 'diario_10_19',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial da União',
        trecho: 'Tribunal de Contas da União publica relatório de auditoria com participação de RAFAEL XIMENES...',
        data: '06/11/2024'
      },
      {
        id: 'diario_10_20',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial do Estado do Ceará',
        trecho: 'Secretaria de Estado do Ceará nomeia RAFAEL XIMENES para coordenação de projeto de inovação...',
        data: '05/11/2024'
      },
      {
        id: 'diario_10_21',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial da União',
        trecho: 'Ministério da Defesa publica edital de contratação de serviços de TI com participação de RAFAEL XIMENES...',
        data: '04/11/2024'
      }
    ]
  };

  // Função para fechar o modal (mantida para compatibilidade)
  const closeProcessoModal = () => {
    setShowProcessoModal(false);
    setSelectedProcessoId(null);
  };

  // Funções para busca de Diários Oficiais
  const mockDiarioOficialSuggestions = ['João da Silva', 'Rafael Ximenes', 'Licitação', 'Concurso Público', 'Prefeitura', 'Ministério', 'Secretaria'];

  const filterDiarioOficialSuggestions = (term: string) => {
    const filtered = mockDiarioOficialSuggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(term.toLowerCase())
    );
    setDiarioOficialSuggestions(filtered);
  };

  const handleDiarioOficialInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDiarioOficialSearchTerm(value);
    
    // Limpar resultados sempre que o texto for alterado
    setDiarioOficialSearchResults([]);
    setSelectedDiarioOficialId(null);
    setShowDiarioOficialDetails(false);
    setCurrentDiarioOficialPage(1);
    
    // Mostrar sugestões imediatamente se tiver 2+ caracteres
    if (value.length >= 2) {
      filterDiarioOficialSuggestions(value);
      setShowDiarioOficialSuggestions(true);
    } else {
      setDiarioOficialSuggestions([]);
      setShowDiarioOficialSuggestions(false);
    }
    
    // Limpar timer anterior
    if (diarioOficialDebounceTimer) {
      clearTimeout(diarioOficialDebounceTimer);
    }
  };

  const handleDiarioOficialInputFocus = () => {
    if (diarioOficialSearchTerm.length >= 2) {
      setShowDiarioOficialSuggestions(true);
    }
  };

  const closeDiarioOficialSuggestions = () => {
    setShowDiarioOficialSuggestions(false);
  };

  const clearDiarioOficialInput = () => {
    setDiarioOficialSearchTerm('');
    setDiarioOficialSuggestions([]);
    setShowDiarioOficialSuggestions(false);
    setDiarioOficialSearchResults([]);
    setSelectedDiarioOficialIndex(-1);
    setSelectedDiarioOficialId(null);
    setShowDiarioOficialDetails(false);
    setCurrentDiarioOficialPage(1);
  };

  const handleDiarioOficialSuggestionClick = (suggestion: string) => {
    setDiarioOficialSearchTerm(suggestion);
    setShowDiarioOficialSuggestions(false);
    setSelectedDiarioOficialIndex(-1);
    
    // Executar busca automaticamente
    executeDiarioOficialSearch(suggestion);
  };

  const handleDiarioOficialKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedDiarioOficialIndex(prev => 
        prev < diarioOficialSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedDiarioOficialIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedDiarioOficialIndex >= 0 && selectedDiarioOficialIndex < diarioOficialSuggestions.length) {
        handleDiarioOficialSuggestionClick(diarioOficialSuggestions[selectedDiarioOficialIndex]);
      } else if (diarioOficialSearchTerm.trim()) {
        executeDiarioOficialSearch(diarioOficialSearchTerm);
      }
    } else if (e.key === 'Escape') {
      setShowDiarioOficialSuggestions(false);
      setSelectedDiarioOficialIndex(-1);
    }
  };

  const executeDiarioOficialSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setIsDiarioOficialLoading(true);
    setDiarioOficialSearchResults([]);
    
    // Simular busca com delay
    setTimeout(() => {
      const results = mockDiarioResults[searchTerm as keyof typeof mockDiarioResults] || [];
      console.log('Resultados de diários encontrados:', results);
      setDiarioOficialSearchResults(results);
      setIsDiarioOficialLoading(false);
    }, 1500);
  };

  // Função para ver detalhes do diário
  const handleDiarioOficialDetails = (diarioId: number) => {
    setSelectedDiarioOficialId(diarioId);
    setShowDiarioOficialDetails(true);
  };

  // Função para voltar à lista de diários
  const backToDiarioOficialList = () => {
    setShowDiarioOficialDetails(false);
    setSelectedDiarioOficialId(null);
    setCurrentDiarioOficialPage(1);
  };

  // Funções de paginação para diários
  const getCurrentDiariosOficiais = () => {
    if (!selectedDiarioOficialId) return [];
    const diarios = mockDiarioDetalhes[selectedDiarioOficialId as keyof typeof mockDiarioDetalhes] || [];
    const startIndex = (currentDiarioOficialPage - 1) * diariosOficiaisPerPage;
    const endIndex = startIndex + diariosOficiaisPerPage;
    return diarios.slice(startIndex, endIndex);
  };

  const getTotalDiariosOficiaisPages = () => {
    if (!selectedDiarioOficialId) return 0;
    const diarios = mockDiarioDetalhes[selectedDiarioOficialId as keyof typeof mockDiarioDetalhes] || [];
    return Math.ceil(diarios.length / diariosOficiaisPerPage);
  };

  const handleDiarioOficialPageChange = (page: number) => {
    setCurrentDiarioOficialPage(page);
  };
  
  // Funções para aba Tudo
  const handleTudoPageChange = (page: number) => {
    setCurrentTudoPage(page);
  };
  
  const handleTudoDetails = (item: any) => {
    setSelectedTudoItem(item);
    setShowTudoDetails(true);
    setCurrentProcessoDetailsPage(1); // Reset para primeira página dos detalhes de processos
    setCurrentDiarioTudoDetailsPage(1); // Reset para primeira página dos detalhes de diários
  };
  
  const backToTudoList = () => {
    setShowTudoDetails(false);
    setSelectedTudoItem(null);
    setCurrentTudoPage(1);
  };
  
  const getCurrentTudoItems = () => {
    const allItems = [
      // Ordenado por data (mais recente primeiro) e intercalado
      { type: 'processo', id: 1, nome: 'Rafael Ximenes', totalProcessos: 19, diario: 'Diário da Justiça do Estado de São Paulo', data: '18/01/2024' },
      { type: 'diario', id: 2, titulo: 'EDITAL DE CONCURSO PÚBLICO Nº 001/2024', diario: 'DOU', data: '18/01/2024', secao: 'Seção 3 - Concursos e Licitações', edicao: '12348' },
      { type: 'processo', id: 3, nome: 'Rafael Ximenes Santos', totalProcessos: 22, diario: 'Diário da Justiça do Estado do Rio de Janeiro', data: '17/01/2024' },
      { type: 'diario', id: 4, titulo: 'EDITAL DE LICITAÇÃO Nº 045/2024', diario: 'Diário Oficial do Estado de São Paulo', data: '17/01/2024', secao: 'Seção 2 - Licitações', edicao: '45678' },
      { type: 'processo', id: 5, nome: 'Rafael Ximenes Lima', totalProcessos: 35, diario: 'Diário da Justiça do Estado de Minas Gerais', data: '16/01/2024' },
      { type: 'diario', id: 6, titulo: 'PORTARIA Nº 123/2024 - NOMEAÇÃO DE SERVIDORES', diario: 'DOU', data: '16/01/2024', secao: 'Seção 1 - Atos do Poder Executivo', edicao: '12347' },
      { type: 'processo', id: 7, nome: 'Rafael Ximenes Oliveira', totalProcessos: 14, diario: 'Diário da Justiça do Estado do Paraná', data: '15/01/2024' },
      { type: 'diario', id: 30, titulo: 'EDITAL DE CONCURSO Nº 002/2024 - MINISTÉRIO DA EDUCAÇÃO', diario: 'DOU', data: '15/01/2024', secao: 'Seção 3 - Concursos e Licitações', edicao: '12346' },
      { type: 'processo', id: 8, nome: 'Rafael Ximenes Mattos', totalProcessos: 11, diario: 'Diário da Justiça do Estado de Santa Catarina', data: '14/01/2024' },
      { type: 'diario', id: 31, titulo: 'PORTARIA Nº 456/2024 - NOMEAÇÕES E EXONERAÇÕES', diario: 'Diário Oficial do Estado de São Paulo', data: '14/01/2024', secao: 'Seção 1 - Atos do Poder Executivo', edicao: '45677' },
      { type: 'processo', id: 9, nome: 'Rafael Ximenes Costa', totalProcessos: 28, diario: 'Diário da Justiça do Estado de Goiás', data: '13/01/2024' },
      { type: 'diario', id: 32, titulo: 'EDITAL DE LICITAÇÃO Nº 078/2024 - SERVIÇOS DE LIMPEZA', diario: 'Diário Oficial do Estado do Rio de Janeiro', data: '13/01/2024', secao: 'Seção 2 - Licitações', edicao: '78901' },
      { type: 'processo', id: 10, nome: 'Rafael Ximenes Silva', totalProcessos: 16, diario: 'Diário da Justiça do Estado de Bahia', data: '12/01/2024' },
      { type: 'diario', id: 33, titulo: 'LEI Nº 15.123/2024 - ALTERAÇÃO DA LEI ORGÂNICA', diario: 'DOU', data: '12/01/2024', secao: 'Seção 1 - Atos do Poder Executivo', edicao: '12345' },
      { type: 'processo', id: 11, nome: 'Rafael Ximenes Pereira', totalProcessos: 31, diario: 'Diário da Justiça do Estado de Pernambuco', data: '11/01/2024' },
      { type: 'diario', id: 34, titulo: 'EDITAL DE CONCURSO Nº 003/2024 - POLÍCIA FEDERAL', diario: 'Diário Oficial do Estado de Minas Gerais', data: '11/01/2024', secao: 'Seção 3 - Concursos e Licitações', edicao: '45676' },
      { type: 'processo', id: 12, nome: 'Rafael Ximenes Rodrigues', totalProcessos: 23, diario: 'Diário da Justiça do Estado de Ceará', data: '10/01/2024' },
      { type: 'diario', id: 35, titulo: 'PORTARIA Nº 789/2024 - CRIAÇÃO DE CARGOS', diario: 'Diário Oficial do Estado do Paraná', data: '10/01/2024', secao: 'Seção 1 - Atos do Poder Executivo', edicao: '78900' },
      { type: 'processo', id: 13, nome: 'Rafael Ximenes Alves', totalProcessos: 18, diario: 'Diário da Justiça do Estado de Maranhão', data: '09/01/2024' },
      { type: 'diario', id: 36, titulo: 'EDITAL DE LICITAÇÃO Nº 101/2024 - OBRAS PÚBLICAS', diario: 'Diário Oficial do Estado de Santa Catarina', data: '09/01/2024', secao: 'Seção 2 - Licitações', edicao: '12344' },
      { type: 'processo', id: 14, nome: 'Rafael Ximenes Ferreira', totalProcessos: 26, diario: 'Diário da Justiça do Estado de Pará', data: '08/01/2024' },
      { type: 'diario', id: 37, titulo: 'DECRETO Nº 12.456/2024 - REGULAMENTAÇÃO DE LEI', diario: 'DOU', data: '08/01/2024', secao: 'Seção 1 - Atos do Poder Executivo', edicao: '45675' },
      { type: 'processo', id: 15, nome: 'Rafael Ximenes Gomes', totalProcessos: 21, diario: 'Diário da Justiça do Estado de Amazonas', data: '07/01/2024' },
      { type: 'diario', id: 38, titulo: 'EDITAL DE CONCURSO Nº 004/2024 - RECEITA FEDERAL', diario: 'Diário Oficial do Estado de Goiás', data: '07/01/2024', secao: 'Seção 3 - Concursos e Licitações', edicao: '78899' },
      { type: 'processo', id: 16, nome: 'Rafael Ximenes Martins', totalProcessos: 33, diario: 'Diário da Justiça do Estado de Rondônia', data: '06/01/2024' },
      { type: 'diario', id: 39, titulo: 'PORTARIA Nº 321/2024 - ALTERAÇÃO DE HORÁRIOS', diario: 'Diário Oficial do Estado da Bahia', data: '06/01/2024', secao: 'Seção 1 - Atos do Poder Executivo', edicao: '12343' },
      { type: 'processo', id: 17, nome: 'Rafael Ximenes Nunes', totalProcessos: 17, diario: 'Diário da Justiça do Estado de Acre', data: '05/01/2024' },
      { type: 'diario', id: 40, titulo: 'EDITAL DE LICITAÇÃO Nº 134/2024 - EQUIPAMENTOS', diario: 'Diário Oficial do Estado de Pernambuco', data: '05/01/2024', secao: 'Seção 2 - Licitações', edicao: '45674' },
      { type: 'processo', id: 18, nome: 'Rafael Ximenes Barbosa', totalProcessos: 29, diario: 'Diário da Justiça do Estado de Amapá', data: '04/01/2024' },
      { type: 'diario', id: 41, titulo: 'LEI Nº 15.124/2024 - INCENTIVOS FISCAIS', diario: 'DOU', data: '04/01/2024', secao: 'Seção 1 - Atos do Poder Executivo', edicao: '78898' },
      { type: 'processo', id: 19, nome: 'Rafael Ximenes Cardoso', totalProcessos: 24, diario: 'Diário da Justiça do Estado de Roraima', data: '03/01/2024' },
      { type: 'diario', id: 42, titulo: 'EDITAL DE CONCURSO Nº 005/2024 - INSS', diario: 'Diário Oficial do Estado do Ceará', data: '03/01/2024', secao: 'Seção 3 - Concursos e Licitações', edicao: '12342' },
      { type: 'processo', id: 20, nome: 'Rafael Ximenes Dias', totalProcessos: 20, diario: 'Diário da Justiça do Estado de Tocantins', data: '02/01/2024' },
      { type: 'diario', id: 43, titulo: 'PORTARIA Nº 654/2024 - FÉRIAS COLETIVAS', diario: 'Diário Oficial do Estado do Maranhão', data: '02/01/2024', secao: 'Seção 1 - Atos do Poder Executivo', edicao: '45673' },
      { type: 'processo', id: 21, nome: 'Rafael Ximenes Souza', totalProcessos: 27, diario: 'Diário da Justiça do Estado de Sergipe', data: '01/01/2024' },
      { type: 'diario', id: 44, titulo: 'EDITAL DE LICITAÇÃO Nº 167/2024 - SERVIÇOS TÉCNICOS', diario: 'Diário Oficial do Estado do Pará', data: '01/01/2024', secao: 'Seção 2 - Licitações', edicao: '78897' },
      { type: 'processo', id: 22, nome: 'Rafael Ximenes Rocha', totalProcessos: 15, diario: 'Diário da Justiça do Estado de Alagoas', data: '31/12/2023' },
      { type: 'diario', id: 45, titulo: 'DECRETO Nº 12.457/2024 - ESTADO DE EMERGÊNCIA', diario: 'DOU', data: '31/12/2023', secao: 'Seção 1 - Atos do Poder Executivo', edicao: '12341' },
      { type: 'processo', id: 23, nome: 'Rafael Ximenes Lopes', totalProcessos: 32, diario: 'Diário da Justiça do Estado de Rio Grande do Norte', data: '30/12/2023' },
      { type: 'diario', id: 46, titulo: 'EDITAL DE CONCURSO Nº 006/2024 - BANCO CENTRAL', diario: 'Diário Oficial do Estado do Amazonas', data: '30/12/2023', secao: 'Seção 3 - Concursos e Licitações', edicao: '45672' },
      { type: 'processo', id: 24, nome: 'Rafael Ximenes Moreira', totalProcessos: 19, diario: 'Diário da Justiça do Estado de Paraíba', data: '29/12/2023' },
      { type: 'diario', id: 47, titulo: 'PORTARIA Nº 987/2024 - FUNCIONAMENTO DE ÓRGÃOS', diario: 'Diário Oficial do Estado de Rondônia', data: '29/12/2023', secao: 'Seção 1 - Atos do Poder Executivo', edicao: '78896' },
      { type: 'processo', id: 25, nome: 'Rafael Ximenes Carvalho', totalProcessos: 25, diario: 'Diário da Justiça do Estado de Piauí', data: '28/12/2023' },
      { type: 'diario', id: 48, titulo: 'EDITAL DE LICITAÇÃO Nº 200/2024 - MANUTENÇÃO', diario: 'Diário Oficial do Estado do Acre', data: '28/12/2023', secao: 'Seção 2 - Licitações', edicao: '12340' },
      { type: 'processo', id: 26, nome: 'Rafael Ximenes Teixeira', totalProcessos: 13, diario: 'Diário da Justiça do Estado de Espírito Santo', data: '27/12/2023' },
      { type: 'diario', id: 49, titulo: 'LEI Nº 15.125/2024 - ORÇAMENTO PÚBLICO', diario: 'DOU', data: '27/12/2023', secao: 'Seção 1 - Atos do Poder Executivo', edicao: '45671' },
      { type: 'processo', id: 27, nome: 'Rafael Ximenes Mendes', totalProcessos: 30, diario: 'Diário da Justiça do Estado de Mato Grosso', data: '26/12/2023' },
      { type: 'diario', id: 50, titulo: 'EDITAL DE CONCURSO Nº 007/2024 - AGÊNCIA NACIONAL', diario: 'Diário Oficial do Estado do Amapá', data: '26/12/2023', secao: 'Seção 3 - Concursos e Licitações', edicao: '78895' },
      { type: 'processo', id: 28, nome: 'Rafael Ximenes Ribeiro', totalProcessos: 22, diario: 'Diário da Justiça do Estado de Mato Grosso do Sul', data: '25/12/2023' },
      { type: 'processo', id: 29, nome: 'Rafael Ximenes Correia', totalProcessos: 18, diario: 'Diário da Justiça do Estado de Distrito Federal', data: '24/12/2023' },
    ];
    
    const startIndex = (currentTudoPage - 1) * tudoPerPage;
    const endIndex = startIndex + tudoPerPage;
    return allItems.slice(startIndex, endIndex);
  };
  
  const getTotalTudoPages = () => {
    const totalItems = 50; // Total de itens mock
    return Math.ceil(totalItems / tudoPerPage);
  };

  // Funções para paginação dos detalhes de processos na aba Tudo
  const getCurrentProcessoDetails = () => {
    if (!selectedTudoItem || selectedTudoItem.type !== 'processo') return [];
    const processos = mockProcessoDetalhes[selectedTudoItem.id as keyof typeof mockProcessoDetalhes] || [];
    const startIndex = (currentProcessoDetailsPage - 1) * processosDetailsPerPage;
    const endIndex = startIndex + processosDetailsPerPage;
    return processos.slice(startIndex, endIndex);
  };

  const getTotalProcessoDetailsPages = () => {
    if (!selectedTudoItem || selectedTudoItem.type !== 'processo') return 0;
    const processos = mockProcessoDetalhes[selectedTudoItem.id as keyof typeof mockProcessoDetalhes] || [];
    return Math.ceil(processos.length / processosDetailsPerPage);
  };

  const handleProcessoDetailsPageChange = (page: number) => {
    setCurrentProcessoDetailsPage(page);
  };

  // Mock data para detalhes de Diários Oficiais na aba Tudo
  const mockDiarioTudoDetalhes = {
    2: [ // Edital de Concurso Público - 3 resultados
      {
        id: 'diario_tudo_2_1',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial da União',
        trecho: 'Presidente do Tribunal Superior do Trabalho convoca rafael ximenes para assumir cargo de Analista em Tecnologia da Informação do Tribunal Superior do Trabalho, conforme Resolução nº 123/2024.',
        dataPublicacao: '24/11/2024',
        secao: 'Seção 3 - Concursos e Licitações',
        edicao: '12348'
      },
      {
        id: 'diario_tudo_2_2',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial do Estado de São Paulo',
        trecho: 'Secretaria de Estado da Educação nomeia rafael ximenes para o cargo de Coordenador de Projetos Educacionais, conforme Decreto nº 456/2024.',
        dataPublicacao: '23/11/2024',
        secao: 'Seção 1 - Atos do Poder Executivo',
        edicao: '45678'
      },
      {
        id: 'diario_tudo_2_3',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial da União',
        trecho: 'Ministério da Ciência e Tecnologia publica edital de licitação com participação de rafael ximenes como consultor técnico especializado em sistemas de informação.',
        dataPublicacao: '22/11/2024',
        secao: 'Seção 2 - Licitações',
        edicao: '12347'
      }
    ],
    4: [ // Edital de Licitação - 3 resultados
      {
        id: 'diario_tudo_4_1',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial do Estado de São Paulo',
        trecho: 'Secretaria de Estado da Educação nomeia rafael ximenes para o cargo de Coordenador de Projetos Educacionais, conforme Decreto nº 456/2024.',
        dataPublicacao: '23/11/2024',
        secao: 'Seção 1 - Atos do Poder Executivo',
        edicao: '45678'
      },
      {
        id: 'diario_tudo_4_2',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial da União',
        trecho: 'Ministério da Ciência e Tecnologia publica edital de licitação com participação de rafael ximenes como consultor técnico especializado em sistemas de informação.',
        dataPublicacao: '22/11/2024',
        secao: 'Seção 2 - Licitações',
        edicao: '12347'
      },
      {
        id: 'diario_tudo_4_3',
        termoProcurado: 'Rafael Ximenes',
        fonte: 'Diário Oficial do Estado do Rio de Janeiro',
        trecho: 'Prefeitura do Rio de Janeiro convoca rafael ximenes para prestar depoimento em processo administrativo relacionado a licitações públicas.',
        dataPublicacao: '21/11/2024',
        secao: 'Seção 3 - Atos Administrativos',
        edicao: '78901'
      }
    ]
  };

  // Estados para paginação dos detalhes de Diários Oficiais na aba Tudo
  const [currentDiarioTudoDetailsPage, setCurrentDiarioTudoDetailsPage] = useState(1);
  const [diariosTudoDetailsPerPage] = useState(10);

  // Funções para paginação dos detalhes de Diários Oficiais na aba Tudo
  const getCurrentDiarioTudoDetails = () => {
    if (!selectedTudoItem || selectedTudoItem.type !== 'diario') return [];
    const diarios = mockDiarioTudoDetalhes[selectedTudoItem.id as keyof typeof mockDiarioTudoDetalhes] || [];
    const startIndex = (currentDiarioTudoDetailsPage - 1) * diariosTudoDetailsPerPage;
    const endIndex = startIndex + diariosTudoDetailsPerPage;
    return diarios.slice(startIndex, endIndex);
  };

  const getTotalDiarioTudoDetailsPages = () => {
    if (!selectedTudoItem || selectedTudoItem.type !== 'diario') return 0;
    const diarios = mockDiarioTudoDetalhes[selectedTudoItem.id as keyof typeof mockDiarioTudoDetalhes] || [];
    return Math.ceil(diarios.length / diariosTudoDetailsPerPage);
  };

  const handleDiarioTudoDetailsPageChange = (page: number) => {
    setCurrentDiarioTudoDetailsPage(page);
  };

  // Memoizar classes dos filtros para evitar flicker
  const getPoderButtonClasses = useMemo(() => {
    return (poder: string) => {
      const isDisabled = activeTab === 'processos' ? poder !== 'Judiciário' : false;
      const isSelected = selectedPoder === poder;
      
      return `w-full text-left px-3 py-2 rounded-lg text-sm border ${
        isSelected
          ? 'bg-gray-600/30 text-white border-gray-500/40'
          : isDisabled
          ? 'text-gray-500 opacity-50 cursor-not-allowed border-transparent'
          : 'text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer border-transparent'
      }`;
    };
  }, [activeTab, selectedPoder]);

  const getEsferaButtonClasses = useMemo(() => {
    return (esfera: string) => {
      const isSelected = selectedEsfera === esfera;
      
      return `w-full text-left px-3 py-2 rounded-lg text-sm border ${
        isSelected
          ? 'bg-gray-600/30 text-white border-gray-500/40'
          : 'text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer border-transparent'
      }`;
    };
  }, [selectedEsfera]);

  // Callbacks estáveis para evitar re-renderizações
  const handlePoderClick = useCallback((poder: string) => {
    const isDisabled = activeTab === 'processos' ? poder !== 'Judiciário' : false;
    if (!isDisabled) {
      setSelectedPoder(poder);
    }
  }, [activeTab]);

  const handleEsferaClick = useCallback((esfera: string) => {
    setSelectedEsfera(esfera);
  }, []);

  // Dados dos diários disponíveis baseados nas seleções de poder e esfera
  const getDiariosDisponiveis = () => {
    const allDiarios = [
      // Opção "Todos" para ambas as abas
      { id: 0, nome: 'Todos', poder: 'Todos', esfera: 'Todos', disponivel: true },
      // Federal - Executivo
      { id: 1, nome: 'Diário Oficial da União', poder: 'Executivo', esfera: 'Federal', disponivel: true },
      
      // Estadual - Executivo
      { id: 2, nome: 'Diário Oficial do Estado de São Paulo', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 3, nome: 'Diário Oficial do Estado do Rio de Janeiro', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 4, nome: 'Diário Oficial do Estado de Minas Gerais', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 5, nome: 'Diário Oficial do Estado do Paraná', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 6, nome: 'Diário Oficial do Estado do Rio Grande do Sul', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 7, nome: 'Diário Oficial do Estado de Santa Catarina', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 8, nome: 'Diário Oficial do Estado de Goiás', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 9, nome: 'Diário Oficial do Estado de Bahia', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 10, nome: 'Diário Oficial do Estado de Pernambuco', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 11, nome: 'Diário Oficial do Estado do Ceará', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 12, nome: 'Diário Oficial do Estado de Pará', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 13, nome: 'Diário Oficial do Estado de Maranhão', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 14, nome: 'Diário Oficial do Estado de Mato Grosso', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 15, nome: 'Diário Oficial do Estado de Mato Grosso do Sul', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 16, nome: 'Diário Oficial do Estado de Rondônia', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 17, nome: 'Diário Oficial do Estado de Acre', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 18, nome: 'Diário Oficial do Estado de Roraima', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 19, nome: 'Diário Oficial do Estado de Amapá', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 20, nome: 'Diário Oficial do Estado de Tocantins', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 21, nome: 'Diário Oficial do Estado de Sergipe', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 22, nome: 'Diário Oficial do Estado de Alagoas', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 23, nome: 'Diário Oficial do Estado de Piauí', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 24, nome: 'Diário Oficial do Estado de Rio Grande do Norte', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 25, nome: 'Diário Oficial do Estado de Paraíba', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 26, nome: 'Diário Oficial do Estado de Espírito Santo', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      { id: 27, nome: 'Diário Oficial do Estado de Distrito Federal', poder: 'Executivo', esfera: 'Estadual', disponivel: false },
      
      // Municipal - Executivo
      { id: 28, nome: 'Diário Oficial do Município de São Paulo', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 29, nome: 'Diário Oficial do Município do Rio de Janeiro', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 30, nome: 'Diário Oficial do Município de Belo Horizonte', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 31, nome: 'Diário Oficial do Município de Curitiba', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 32, nome: 'Diário Oficial do Município de Porto Alegre', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 33, nome: 'Diário Oficial do Município de Florianópolis', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 34, nome: 'Diário Oficial do Município de Goiânia', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 35, nome: 'Diário Oficial do Município de Salvador', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 36, nome: 'Diário Oficial do Município de Recife', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 37, nome: 'Diário Oficial do Município de Fortaleza', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 38, nome: 'Diário Oficial do Município de Belém', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 39, nome: 'Diário Oficial do Município de São Luís', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 40, nome: 'Diário Oficial do Município de Cuiabá', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 41, nome: 'Diário Oficial do Município de Campo Grande', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 42, nome: 'Diário Oficial do Município de Porto Velho', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 43, nome: 'Diário Oficial do Município de Rio Branco', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 44, nome: 'Diário Oficial do Município de Boa Vista', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 45, nome: 'Diário Oficial do Município de Macapá', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 46, nome: 'Diário Oficial do Município de Palmas', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 47, nome: 'Diário Oficial do Município de Aracaju', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 48, nome: 'Diário Oficial do Município de Maceió', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 49, nome: 'Diário Oficial do Município de Teresina', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 50, nome: 'Diário Oficial do Município de Natal', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 51, nome: 'Diário Oficial do Município de João Pessoa', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 52, nome: 'Diário Oficial do Município de Vitória', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      { id: 53, nome: 'Diário Oficial do Município de Brasília', poder: 'Executivo', esfera: 'Municipal', disponivel: false },
      
      // Federal - Legislativo
      { id: 54, nome: 'Diário do Congresso Nacional', poder: 'Legislativo', esfera: 'Federal', disponivel: false },
      
      // Estadual - Legislativo
      { id: 55, nome: 'Diário Oficial da Assembleia Legislativa de SP', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 56, nome: 'Diário Oficial da Assembleia Legislativa do RJ', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 57, nome: 'Diário Oficial da Assembleia Legislativa de MG', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 58, nome: 'Diário Oficial da Assembleia Legislativa do PR', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 59, nome: 'Diário Oficial da Assembleia Legislativa do RS', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 60, nome: 'Diário Oficial da Assembleia Legislativa de SC', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 61, nome: 'Diário Oficial da Assembleia Legislativa de GO', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 62, nome: 'Diário Oficial da Assembleia Legislativa da BA', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 63, nome: 'Diário Oficial da Assembleia Legislativa de PE', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 64, nome: 'Diário Oficial da Assembleia Legislativa do CE', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 65, nome: 'Diário Oficial da Assembleia Legislativa do PA', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 66, nome: 'Diário Oficial da Assembleia Legislativa do MA', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 67, nome: 'Diário Oficial da Assembleia Legislativa de MT', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 68, nome: 'Diário Oficial da Assembleia Legislativa de MS', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 69, nome: 'Diário Oficial da Assembleia Legislativa de RO', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 70, nome: 'Diário Oficial da Assembleia Legislativa do AC', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 71, nome: 'Diário Oficial da Assembleia Legislativa de RR', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 72, nome: 'Diário Oficial da Assembleia Legislativa do AP', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 73, nome: 'Diário Oficial da Assembleia Legislativa do TO', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 74, nome: 'Diário Oficial da Assembleia Legislativa de SE', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 75, nome: 'Diário Oficial da Assembleia Legislativa de AL', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 76, nome: 'Diário Oficial da Assembleia Legislativa do PI', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 77, nome: 'Diário Oficial da Assembleia Legislativa do RN', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 78, nome: 'Diário Oficial da Assembleia Legislativa da PB', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 79, nome: 'Diário Oficial da Assembleia Legislativa do ES', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      { id: 80, nome: 'Diário Oficial da Assembleia Legislativa do DF', poder: 'Legislativo', esfera: 'Estadual', disponivel: false },
      
      // Federal - Judiciário
      { id: 81, nome: 'Diário da Justiça Eletrônico', poder: 'Judiciário', esfera: 'Federal', disponivel: false },
      
      // Estadual - Judiciário
      { id: 82, nome: 'Diário da Justiça do Estado de São Paulo', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 83, nome: 'Diário da Justiça do Estado do Rio de Janeiro', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 84, nome: 'Diário da Justiça do Estado de Minas Gerais', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 85, nome: 'Diário da Justiça do Estado do Paraná', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 86, nome: 'Diário da Justiça do Estado do Rio Grande do Sul', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 87, nome: 'Diário da Justiça do Estado de Santa Catarina', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 88, nome: 'Diário da Justiça do Estado de Goiás', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 89, nome: 'Diário da Justiça do Estado de Bahia', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 90, nome: 'Diário da Justiça do Estado de Pernambuco', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 91, nome: 'Diário da Justiça do Estado do Ceará', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 92, nome: 'Diário da Justiça do Estado do Pará', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 93, nome: 'Diário da Justiça do Estado do Maranhão', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 94, nome: 'Diário da Justiça do Estado de Mato Grosso', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 95, nome: 'Diário da Justiça do Estado de Mato Grosso do Sul', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 96, nome: 'Diário da Justiça do Estado de Rondônia', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 97, nome: 'Diário da Justiça do Estado do Acre', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 98, nome: 'Diário da Justiça do Estado de Roraima', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 99, nome: 'Diário da Justiça do Estado do Amapá', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 100, nome: 'Diário da Justiça do Estado do Tocantins', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 101, nome: 'Diário da Justiça do Estado de Sergipe', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 102, nome: 'Diário da Justiça do Estado de Alagoas', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 103, nome: 'Diário da Justiça do Estado do Piauí', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 104, nome: 'Diário da Justiça do Estado do Rio Grande do Norte', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 105, nome: 'Diário da Justiça do Estado da Paraíba', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 106, nome: 'Diário da Justiça do Estado do Espírito Santo', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
      { id: 107, nome: 'Diário da Justiça do Estado do Distrito Federal', poder: 'Judiciário', esfera: 'Estadual', disponivel: false },
    ];

    // Sempre mostrar todos os diários, mas destacar o DOU como disponível
    return allDiarios;
  };

  const diariosDisponiveis = getDiariosDisponiveis();

  // Mock data para Dashboard
  const mockDashboardData = {
    totalDiarios: 1247,
    totalProcessos: 8934,
    diariosHoje: 23,
    processosHoje: 156,
    recentDiarios: [
      { 
        id: 1, 
        nome: 'Diário Oficial da União', 
        data: '2024-01-18', 
        edicao: '12348',
        isDou: true,
        secoes: [
          { id: '1-1', nome: 'Seção 1 - Atos do Poder Executivo', edicao: '12348-1' },
          { id: '1-2', nome: 'Seção 2 - Atos do Poder Legislativo', edicao: '12348-2' },
          { id: '1-3', nome: 'Seção 3 - Concursos e Licitações', edicao: '12348-3' },
          { id: '1-4', nome: 'Seção 4 - Atos do Poder Judiciário', edicao: '12348-4' }
        ]
      },
      { 
        id: 2, 
        nome: 'Diário Oficial da União', 
        data: '2024-01-17', 
        edicao: '12347',
        isDou: true,
        secoes: [
          { id: '2-1', nome: 'Seção 1 - Atos do Poder Executivo', edicao: '12347-1' },
          { id: '2-2', nome: 'Seção 2 - Atos do Poder Legislativo', edicao: '12347-2' },
          { id: '2-3', nome: 'Seção 3 - Concursos e Licitações', edicao: '12347-3' },
          { id: '2-4', nome: 'Seção 4 - Atos do Poder Judiciário', edicao: '12347-4' }
        ]
      },
      { 
        id: 3, 
        nome: 'Diário Oficial da União', 
        data: '2024-01-16', 
        edicao: '12346',
        isDou: true,
        secoes: [
          { id: '3-1', nome: 'Seção 1 - Atos do Poder Executivo', edicao: '12346-1' },
          { id: '3-2', nome: 'Seção 2 - Atos do Poder Legislativo', edicao: '12346-2' },
          { id: '3-3', nome: 'Seção 3 - Concursos e Licitações', edicao: '12346-3' },
          { id: '3-4', nome: 'Seção 4 - Atos do Poder Judiciário', edicao: '12346-4' }
        ]
      },
      { 
        id: 4, 
        nome: 'Diário Oficial da União', 
        data: '2024-01-15', 
        edicao: '12345',
        isDou: true,
        secoes: [
          { id: '4-1', nome: 'Seção 1 - Atos do Poder Executivo', edicao: '12345-1' },
          { id: '4-2', nome: 'Seção 2 - Atos do Poder Legislativo', edicao: '12345-2' },
          { id: '4-3', nome: 'Seção 3 - Concursos e Licitações', edicao: '12345-3' },
          { id: '4-4', nome: 'Seção 4 - Atos do Poder Judiciário', edicao: '12345-4' }
        ]
      },
      { 
        id: 5, 
        nome: 'Diário Oficial da União', 
        data: '2024-01-14', 
        edicao: '12344',
        isDou: true,
        secoes: [
          { id: '5-1', nome: 'Seção 1 - Atos do Poder Executivo', edicao: '12344-1' },
          { id: '5-2', nome: 'Seção 2 - Atos do Poder Legislativo', edicao: '12344-2' },
          { id: '5-3', nome: 'Seção 3 - Concursos e Licitações', edicao: '12344-3' },
          { id: '5-4', nome: 'Seção 4 - Atos do Poder Judiciário', edicao: '12344-4' }
        ]
      }
    ],
    recentProcessos: [
      { id: 1, numero: '1234567-89.2024.1.01.0001', tribunal: 'TJSP', data: '2024-01-15' },
      { id: 2, numero: '9876543-21.2024.1.02.0001', tribunal: 'TJRJ', data: '2024-01-15' },
      { id: 3, numero: '5555555-55.2024.1.03.0001', tribunal: 'TJMG', data: '2024-01-15' },
      { id: 4, numero: '1111111-11.2024.1.04.0001', tribunal: 'TJRS', data: '2024-01-15' },
      { id: 5, numero: '9999999-99.2024.1.05.0001', tribunal: 'TJPR', data: '2024-01-15' }
    ],
    editaisDouHoje: [
      {
        id: '1',
        titulo: 'CONCURSO PÚBLICO Nº 001/2024 - MINISTÉRIO DA EDUCAÇÃO - CARGO: PROFESSOR DE MATEMÁTICA',
        fonte: 'DOU - Seção 3',
        data: '15/01/2024',
        termo: query,
        tags: ['Concurso Público', 'Educação', 'Professor'],
        temIA: true,
        detalhes: {
          numero: '001/2024',
          orgao: 'Ministério da Educação',
          cargos: [
            { nome: 'Professor de Matemática', vagas: 50, salario: 'R$ 8.000,00' },
            { nome: 'Professor de Física', vagas: 30, salario: 'R$ 8.000,00' },
            { nome: 'Professor de Química', vagas: 25, salario: 'R$ 8.000,00' }
          ],
          dataInscricao: '20/01/2024 a 15/02/2024',
          valorInscricao: 'R$ 120,00',
          dataProva: '15/03/2024',
          requisitos: 'Superior completo em Licenciatura',
          localProva: 'Capitais e principais cidades',
          totalVagas: 105
        }
      },
      {
        id: '2',
        titulo: 'CONCURSO PÚBLICO Nº 002/2024 - MINISTÉRIO DA SAÚDE - CARGO: MÉDICO CLÍNICO GERAL',
        fonte: 'DOU - Seção 3',
        data: '15/01/2024',
        termo: query,
        tags: ['Concurso Público', 'Saúde', 'Médico'],
        temIA: false,
        detalhes: {
          numero: '002/2024',
          orgao: 'Ministério da Saúde',
          cargos: [
            { nome: 'Médico Clínico Geral', vagas: 100, salario: 'R$ 12.000,00' },
            { nome: 'Médico Pediatra', vagas: 50, salario: 'R$ 12.000,00' },
            { nome: 'Médico Ginecologista', vagas: 30, salario: 'R$ 12.000,00' }
          ],
          dataInscricao: '22/01/2024 a 20/02/2024',
          valorInscricao: 'R$ 150,00',
          dataProva: '20/03/2024',
          requisitos: 'Superior completo em Medicina + CRM',
          localProva: 'Capitais e principais cidades',
          totalVagas: 180
        }
      },
      {
        id: '3',
        titulo: 'CONCURSO PÚBLICO Nº 003/2024 - MINISTÉRIO DA FAZENDA - CARGO: AUDITOR FISCAL',
        fonte: 'DOU - Seção 3',
        data: '15/01/2024',
        termo: query,
        tags: ['Concurso Público', 'Fazenda', 'Auditor'],
        temIA: true,
        detalhes: {
          numero: '003/2024',
          orgao: 'Ministério da Fazenda',
          cargos: [
            { nome: 'Auditor Fiscal', vagas: 80, salario: 'R$ 15.000,00' },
            { nome: 'Analista Tributário', vagas: 120, salario: 'R$ 10.000,00' }
          ],
          dataInscricao: '25/01/2024 a 25/02/2024',
          valorInscricao: 'R$ 200,00',
          dataProva: '25/03/2024',
          requisitos: 'Superior completo em áreas afins',
          localProva: 'Capitais e principais cidades',
          totalVagas: 200
        }
      },
      {
        id: '4',
        titulo: 'CONCURSO PÚBLICO Nº 004/2024 - MINISTÉRIO DA JUSTIÇA - CARGO: DELEGADO DE POLÍCIA',
        fonte: 'DOU - Seção 3',
        data: '15/01/2024',
        termo: query,
        tags: ['Concurso Público', 'Justiça', 'Delegado'],
        temIA: false,
        detalhes: {
          numero: '004/2024',
          orgao: 'Ministério da Justiça',
          cargos: [
            { nome: 'Delegado de Polícia', vagas: 60, salario: 'R$ 18.000,00' },
            { nome: 'Perito Criminal', vagas: 40, salario: 'R$ 12.000,00' }
          ],
          dataInscricao: '28/01/2024 a 28/02/2024',
          valorInscricao: 'R$ 180,00',
          dataProva: '28/03/2024',
          requisitos: 'Superior completo em Direito + OAB',
          localProva: 'Capitais e principais cidades',
          totalVagas: 100
        }
      },
      {
        id: '5',
        titulo: 'CONCURSO PÚBLICO Nº 005/2024 - MINISTÉRIO DA DEFESA - CARGO: OFICIAL DE CHANCELARIA',
        fonte: 'DOU - Seção 3',
        data: '15/01/2024',
        termo: query,
        tags: ['Concurso Público', 'Defesa', 'Oficial'],
        temIA: true,
        detalhes: {
          numero: '005/2024',
          orgao: 'Ministério da Defesa',
          cargos: [
            { nome: 'Oficial de Chancelaria', vagas: 30, salario: 'R$ 14.000,00' },
            { nome: 'Assistente de Chancelaria', vagas: 50, salario: 'R$ 8.500,00' }
          ],
          dataInscricao: '30/01/2024 a 02/03/2024',
          valorInscricao: 'R$ 160,00',
          dataProva: '02/04/2024',
          requisitos: 'Superior completo em Relações Internacionais',
          localProva: 'Capitais e principais cidades',
          totalVagas: 80
        }
      }
    ]
  };

  // Mock data para Processos
  const mockProcessosData = {
    totalProcessos: 8934,
    processosPorTribunal: [
      { tribunal: 'TJSP', quantidade: 2341, percentual: 26.2 },
      { tribunal: 'TJRJ', quantidade: 1876, percentual: 21.0 },
      { tribunal: 'TJMG', quantidade: 1654, percentual: 18.5 },
      { tribunal: 'TJRS', quantidade: 1234, percentual: 13.8 },
      { tribunal: 'TJPR', quantidade: 829, percentual: 9.3 }
    ],
    processosRecentes: mockDashboardData.recentProcessos
  };

  const mockEditaisLicitação = [
    { 
      id: 1, 
      titulo: "PREGÃO ELETRÔNICO Nº 001/2024 - PREFEITURA MUNICIPAL DE SÃO PAULO - AQUISIÇÃO DE EQUIPAMENTOS DE INFORMÁTICA",
      detalhes: {
        numero: '001/2024',
        modalidade: 'Pregão Eletrônico',
        orgao: 'Prefeitura Municipal de São Paulo',
        objeto: 'Aquisição de equipamentos de informática',
        valorEstimado: 'R$ 500.000,00',
        dataAbertura: '25/01/2024 às 14:00h',
        dataPublicacao: '15/01/2024',
        prazoExecucao: '90 dias',
        localEntrega: 'Prefeitura Municipal de São Paulo',
        requisitos: 'Empresa com registro no SICAF',
        documentos: 'Proposta, documentação fiscal, certidões'
      }
    },
    { 
      id: 2, 
      titulo: "TOMADA DE PREÇOS Nº 002/2024 - SECRETARIA DE SAÚDE - CONTRATAÇÃO DE SERVIÇOS DE LIMPEZA",
      detalhes: {
        numero: '002/2024',
        modalidade: 'Tomada de Preços',
        orgao: 'Secretaria de Saúde',
        objeto: 'Contratação de serviços de limpeza hospitalar',
        valorEstimado: 'R$ 200.000,00',
        dataAbertura: '30/01/2024 às 10:00h',
        dataPublicacao: '15/01/2024',
        prazoExecucao: '12 meses',
        localEntrega: 'Hospitais municipais',
        requisitos: 'Empresa especializada em limpeza hospitalar',
        documentos: 'Proposta, licenças sanitárias, certidões'
      }
    },
    { 
      id: 3, 
      titulo: "CONCORRÊNCIA Nº 003/2024 - DEPARTAMENTO DE OBRAS - EXECUÇÃO DE PAVIMENTAÇÃO ASFÁLTICA",
      detalhes: {
        numero: '003/2024',
        modalidade: 'Concorrência',
        orgao: 'Departamento de Obras',
        objeto: 'Execução de pavimentação asfáltica em vias públicas',
        valorEstimado: 'R$ 2.000.000,00',
        dataAbertura: '05/02/2024 às 14:00h',
        dataPublicacao: '15/01/2024',
        prazoExecucao: '180 dias',
        localEntrega: 'Vias públicas do município',
        requisitos: 'Empresa com registro no CREA',
        documentos: 'Proposta, ART, certidões, projetos'
      }
    },
    { 
      id: 4, 
      titulo: "PREGÃO ELETRÔNICO Nº 004/2024 - SECRETARIA DE EDUCAÇÃO - AQUISIÇÃO DE MATERIAL DIDÁTICO",
      detalhes: {
        numero: '004/2024',
        modalidade: 'Pregão Eletrônico',
        orgao: 'Secretaria de Educação',
        objeto: 'Aquisição de material didático para escolas municipais',
        valorEstimado: 'R$ 300.000,00',
        dataAbertura: '10/02/2024 às 14:00h',
        dataPublicacao: '15/01/2024',
        prazoExecucao: '60 dias',
        localEntrega: 'Escolas municipais',
        requisitos: 'Empresa com registro no SICAF',
        documentos: 'Proposta, catálogo de produtos, certidões'
      }
    },
    { 
      id: 5, 
      titulo: "TOMADA DE PREÇOS Nº 005/2024 - SECRETARIA DE TRANSPORTES - CONTRATAÇÃO DE TRANSPORTE ESCOLAR",
      detalhes: {
        numero: '005/2024',
        modalidade: 'Tomada de Preços',
        orgao: 'Secretaria de Transportes',
        objeto: 'Contratação de serviço de transporte escolar',
        valorEstimado: 'R$ 800.000,00',
        dataAbertura: '15/02/2024 às 10:00h',
        dataPublicacao: '15/01/2024',
        prazoExecucao: '12 meses',
        localEntrega: 'Rotas escolares definidas',
        requisitos: 'Empresa com frota própria e licenças',
        documentos: 'Proposta, licenças de transporte, certidões'
      }
    },
    { 
      id: 6, 
      titulo: "CONCORRÊNCIA Nº 006/2024 - DEPARTAMENTO DE MEIO AMBIENTE - EXECUÇÃO DE REFLORESTAMENTO",
      detalhes: {
        numero: '006/2024',
        modalidade: 'Concorrência',
        orgao: 'Departamento de Meio Ambiente',
        objeto: 'Execução de projeto de reflorestamento em áreas degradadas',
        valorEstimado: 'R$ 1.500.000,00',
        dataAbertura: '20/02/2024 às 14:00h',
        dataPublicacao: '15/01/2024',
        prazoExecucao: '365 dias',
        localEntrega: 'Áreas degradadas do município',
        requisitos: 'Empresa especializada em reflorestamento',
        documentos: 'Proposta, projeto técnico, licenças ambientais'
      }
    },
    { 
      id: 7, 
      titulo: "PREGÃO ELETRÔNICO Nº 007/2024 - SECRETARIA DE CULTURA - CONTRATAÇÃO DE APRESENTAÇÕES ARTÍSTICAS",
      detalhes: {
        numero: '007/2024',
        modalidade: 'Pregão Eletrônico',
        orgao: 'Secretaria de Cultura',
        objeto: 'Contratação de apresentações artísticas para eventos culturais',
        valorEstimado: 'R$ 150.000,00',
        dataAbertura: '25/02/2024 às 14:00h',
        dataPublicacao: '15/01/2024',
        prazoExecucao: '6 meses',
        localEntrega: 'Espaços culturais do município',
        requisitos: 'Artistas e grupos culturais registrados',
        documentos: 'Proposta, portfólio, certidões'
      }
    },
    { 
      id: 8, 
      titulo: "TOMADA DE PREÇOS Nº 008/2024 - DEPARTAMENTO DE ESPORTES - AQUISIÇÃO DE EQUIPAMENTOS ESPORTIVOS",
      detalhes: {
        numero: '008/2024',
        modalidade: 'Tomada de Preços',
        orgao: 'Departamento de Esportes',
        objeto: 'Aquisição de equipamentos esportivos para academias públicas',
        valorEstimado: 'R$ 400.000,00',
        dataAbertura: '01/03/2024 às 10:00h',
        dataPublicacao: '15/01/2024',
        prazoExecucao: '90 dias',
        localEntrega: 'Academias públicas municipais',
        requisitos: 'Empresa com registro no SICAF',
        documentos: 'Proposta, catálogo de equipamentos, certidões'
      }
    },
    { 
      id: 9, 
      titulo: "CONCORRÊNCIA Nº 009/2024 - SECRETARIA DE ASSISTÊNCIA SOCIAL - CONTRATAÇÃO DE SERVIÇOS SOCIAIS",
      detalhes: {
        numero: '009/2024',
        modalidade: 'Concorrência',
        orgao: 'Secretaria de Assistência Social',
        objeto: 'Contratação de serviços de assistência social para população vulnerável',
        valorEstimado: 'R$ 1.200.000,00',
        dataAbertura: '05/03/2024 às 14:00h',
        dataPublicacao: '15/01/2024',
        prazoExecucao: '12 meses',
        localEntrega: 'Centros de assistência social',
        requisitos: 'ONG ou empresa com experiência em assistência social',
        documentos: 'Proposta, projeto social, certidões'
      }
    },
    { 
      id: 10, 
      titulo: "PREGÃO ELETRÔNICO Nº 010/2024 - DEPARTAMENTO DE TURISMO - CONTRATAÇÃO DE SERVIÇOS DE PROMOÇÃO TURÍSTICA",
      detalhes: {
        numero: '010/2024',
        modalidade: 'Pregão Eletrônico',
        orgao: 'Departamento de Turismo',
        objeto: 'Contratação de serviços de promoção turística do município',
        valorEstimado: 'R$ 600.000,00',
        dataAbertura: '10/03/2024 às 14:00h',
        dataPublicacao: '15/01/2024',
        prazoExecucao: '12 meses',
        localEntrega: 'Eventos turísticos do município',
        requisitos: 'Agência de marketing ou publicidade',
        documentos: 'Proposta, portfólio de campanhas, certidões'
      }
    }
  ];

  return (
    <div className="bg-transparent">
      <TransparentHeader 
        currentPage="explorar"
        onTrialClick={() => setIsTestModalOpen(true)} 
      />
      
      <main className="relative isolate px-6 pt-14 lg:px-8 fade-in-up">
        {/* Gradiente sutil */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="mx-auto max-w-7xl py-16 sm:py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-tight fade-in-delay-1">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300" style={{ lineHeight: '1.2', paddingBottom: '2px' }}>Explorar</span>
              </h1>
            <p className="mt-3 text-base text-gray-300 max-w-2xl mx-auto sm:text-lg sm:mt-4 fade-in-delay-2">
              Descubra e analise informações dos Diários Oficiais
            </p>
            
          </div>

          {/* Layout em 2 colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Esquerda */}
            <div className="lg:col-span-1">
              <div className="bg-white/3 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Navegação</h2>
                <nav className="space-y-2">
                  {/* Mostrar aba Tudo no topo apenas se type=tudo */}
                  {shouldShowTudoTab() && (
                    <button
                      onClick={() => handleTabChange('tudo')}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors duration-200 text-base font-semibold ${
                        activeTab === 'tudo'
                          ? 'bg-gradient-to-r from-blue-600/40 to-purple-600/40 text-white border-blue-500/60 shadow-lg shadow-blue-500/20'
                          : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-200 border-blue-400/30 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-white hover:border-blue-400/50'
                      }`}
                    >
                      ✨ Tudo
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleTabChange('dashboard')}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors duration-200 text-base ${
                      activeTab === 'dashboard'
                        ? 'bg-blue-600/30 text-blue-200 border-blue-500/40'
                        : 'bg-transparent text-gray-300 border-transparent hover:bg-blue-500/10 hover:text-blue-200 hover:border-blue-400/30'
                    }`}
                  >
                    Dashboard
                  </button>
                  
                  <button
                    onClick={() => handleTabChange('processos')}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors duration-200 text-base ${
                      activeTab === 'processos'
                        ? 'bg-blue-600/30 text-blue-200 border-blue-500/40'
                        : 'bg-transparent text-gray-300 border-transparent hover:bg-blue-500/10 hover:text-blue-200 hover:border-blue-400/30'
                    }`}
                  >
                    Processos
                  </button>
                  <button
                    onClick={() => handleTabChange('diarios')}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors duration-200 text-base ${
                      activeTab === 'diarios'
                        ? 'bg-blue-600/30 text-blue-200 border-blue-500/40'
                        : 'bg-transparent text-gray-300 border-transparent hover:bg-blue-500/10 hover:text-blue-200 hover:border-blue-400/30'
                    }`}
                  >
                    Diários Oficiais
                  </button>
                </nav>
            </div>
            
            {/* Filtros - Apenas para Processos e Diários Oficiais */}
            {(activeTab === 'processos' || activeTab === 'diarios') && (
              <div className="bg-white/3 backdrop-blur-sm border border-white/5 rounded-2xl p-6 mt-6">
                <h2 className="text-lg font-semibold text-white mb-4">Filtros</h2>
                
                {/* Filtro de Diário */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Diário selecionado
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowDiarioDropdown(!showDiarioDropdown)}
                      className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium">{selectedDiario}</span>
                      </div>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 group-hover:text-white ${showDiarioDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showDiarioDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-3 bg-gray-900/98 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden">
                        {/* Header com busca */}
                        <div className="p-4 border-b border-white/10 bg-white/5">
                          <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                              type="text"
                              value={diarioSearchTerm}
                              onChange={(e) => setDiarioSearchTerm(e.target.value)}
                              placeholder="Buscar diário..."
                              className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-sm"
                            />
                            {diarioSearchTerm && (
                              <button
                                onClick={() => setDiarioSearchTerm('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
            </div>
          </div>

                        {/* Lista de diários */}
                        <div className="max-h-64 overflow-y-auto">
                          {/* Diário selecionado */}
                          <div className="p-4 bg-gray-600/30 border-l-4 border-gray-500">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-200">{selectedDiario}</span>
                              </div>
                              <span className="text-xs text-gray-300 font-medium">Ativo</span>
          </div>
        </div>

                          {/* Outros diários */}
                          {diariosDisponiveis
                            .filter(diario => 
                              diario.nome.toLowerCase().includes(diarioSearchTerm.toLowerCase()) &&
                              diario.nome !== selectedDiario
                            )
                            .map((diario) => (
                            <div
                              key={diario.id}
                              className={`w-full text-left p-4 border-b border-white/5 last:border-b-0 transition-colors ${
                                diario.disponivel 
                                  ? 'hover:bg-white/5 cursor-pointer' 
                                  : 'opacity-50 cursor-not-allowed'
                              }`}
                              onClick={() => {
                                if (diario.disponivel) {
                                  setSelectedDiario(diario.nome);
                                  setShowDiarioDropdown(false);
                                  setDiarioSearchTerm('');
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className={`text-sm ${diario.disponivel ? 'text-white' : 'text-gray-500'}`}>{diario.nome}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Mensagem quando não há resultados */}
                          {diariosDisponiveis.filter(diario => 
                            diario.nome.toLowerCase().includes(diarioSearchTerm.toLowerCase()) &&
                            diario.nome !== selectedDiario
                          ).length === 0 && diarioSearchTerm && (
                            <div className="p-4 text-center">
                              <p className="text-sm text-gray-500">Nenhum diário encontrado</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                  
                {/* Filtro de Poder */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Poder
                  </label>
                  <div className="space-y-2">
                    {['Executivo', 'Legislativo', 'Judiciário'].map((poder) => {
                      const isDisabled = activeTab === 'processos' ? poder !== 'Judiciário' : false;
                      
                      return (
                        <PoderButton
                          key={poder}
                          poder={poder}
                          isDisabled={isDisabled}
                          onClick={() => handlePoderClick(poder)}
                          className={getPoderButtonClasses(poder)}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Filtro de Esfera */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Esfera
                  </label>
                  <div className="space-y-2">
                    {['Federal', 'Estadual', 'Municipal'].map((esfera) => {
                      return (
                        <EsferaButton
                          key={esfera}
                          esfera={esfera}
                          onClick={() => handleEsferaClick(esfera)}
                          className={getEsferaButtonClasses(esfera)}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Filtro de Período */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Período</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'hoje', label: 'Hoje' },
                      { value: '7dias', label: 'Últimos 7 dias' },
                      { value: '30dias', label: 'Últimos 30 dias' }
                    ].map((periodo) => (
                      <button
                        key={periodo.value}
                        onClick={() => setSelectedPeriodo(periodo.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                          selectedPeriodo === periodo.value
                            ? 'bg-gray-600/30 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {periodo.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags de Filtros Selecionados */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Filtros ativos</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {selectedDiario}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {selectedPoder}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {selectedEsfera}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {selectedPeriodo === 'hoje' ? 'Hoje' : selectedPeriodo === '7dias' ? 'Últimos 7 dias' : 'Últimos 30 dias'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            </div>

            {/* Conteúdo - Direita */}
            <div className="lg:col-span-3">
              {/* Aba Tudo - Feed Misto */}
              {activeTab === 'tudo' && (
                <div className="space-y-6 fade-in" key="tudo">
                  {!showTudoDetails ? (
                    <>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Foram encontrados 50 resultados para o termo "{query}"
                      </h3>

                      {/* Feed Misto - Cards intercalados */}
                      <div className="space-y-3">
                        {getCurrentTudoItems().map((item, index) => (
                          <div key={`${item.type}-${item.id}`}>
                            {item.type === 'processo' ? (
                              // Card de Processo (adaptado para aba Tudo)
                              <div className="w-full bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer">
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <h4 className="text-sm font-medium text-white truncate">{item.nome}</h4>
                                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full whitespace-nowrap">
                                        {item.totalProcessos} resultados
                                      </span>
                                      <span className="text-xs bg-blue-600/30 text-blue-200 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                                        Processo
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-1 truncate">{item.diario}</p>
                                    <p className="text-xs text-gray-500">{item.data}</p>
                                  </div>
                                  <button 
                                    onClick={() => handleTudoDetails(item)}
                                    className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors cursor-pointer text-xs ml-4 whitespace-nowrap"
                                  >
                                    Ver detalhes
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // Card de Diário Oficial (adaptado para aba Tudo)
                              <div className="w-full bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <h4 className="text-sm font-medium text-white truncate">{item.titulo}</h4>
                                      <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                                        3 resultados
                                      </span>
                                      <span className="text-xs bg-green-600/30 text-green-200 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                                        Diário Oficial
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                                      <span className="truncate">{item.diario}</span>
                                      <span className="whitespace-nowrap">{item.data}</span>
                                    </div>
                                    <p className="text-xs text-gray-300 line-clamp-2">{item.secao} • Edição {item.edicao}</p>
                                  </div>
                                  <button 
                                    onClick={() => handleTudoDetails(item)}
                                    className="px-3 py-1.5 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors cursor-pointer text-xs ml-4 whitespace-nowrap"
                                  >
                                    Ver detalhes
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Paginação */}
                      {getTotalTudoPages() > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                          <div className="text-sm text-gray-400">
                            Mostrando {((currentTudoPage - 1) * tudoPerPage) + 1} a {Math.min(currentTudoPage * tudoPerPage, 50)} de 50 resultados
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Botão Anterior */}
                            <button
                              onClick={() => handleTudoPageChange(currentTudoPage - 1)}
                              disabled={currentTudoPage === 1}
                              className="px-3 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                              Anterior
                            </button>

                            {/* Números das páginas */}
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: getTotalTudoPages() }, (_, i) => i + 1).map((page) => (
                                <button
                                  key={page}
                                  onClick={() => handleTudoPageChange(page)}
                                  className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                                    page === currentTudoPage
                                      ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                                      : 'text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10'
                                  }`}
                                >
                                  {page}
                                </button>
                              ))}
                            </div>

                            {/* Botão Próximo */}
                            <button
                              onClick={() => handleTudoPageChange(currentTudoPage + 1)}
                              disabled={currentTudoPage === getTotalTudoPages()}
                              className="px-3 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                              Próximo
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // Detalhes do item selecionado
                    <div className="space-y-4">
                      {/* Conteúdo dos detalhes baseado no tipo */}
                      {selectedTudoItem?.type === 'processo' ? (
                        <div className="bg-white/5 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="text-lg font-semibold text-white">Processos de {selectedTudoItem.nome}</h4>
                            <button
                              onClick={backToTudoList}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                              </svg>
                              Voltar
                            </button>
                          </div>
                          <div className="space-y-3">
                            {getCurrentProcessoDetails().map((processo) => (
                              <div key={processo.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-start gap-3 mb-3">
                                      <div className="flex-shrink-0 mt-1">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-white mb-1">Número do Processo</h4>
                                        <p className="text-xs text-gray-300 font-mono">{processo.numero}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3">
                                      <div className="flex-shrink-0 mt-1">
                                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-white mb-1">Partes Envolvidas</h4>
                                        <p className="text-xs text-gray-300 leading-relaxed">{processo.partes}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <button className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors cursor-pointer text-xs flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Ver detalhes
                                  </button>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                  <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                      </svg>
                                    </div>
                                    <div>
                                      <span className="text-gray-400 block">Tribunal</span>
                                      <p className="text-white font-medium">{processo.tribunal}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <span className="text-gray-400 block">Data de publicação</span>
                                      <p className="text-white font-medium">{processo.dataPublicacao}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                      </svg>
                                    </div>
                                    <div>
                                      <span className="text-gray-400 block">Movimentação</span>
                                      <p className="text-white font-medium">{processo.movimentacao}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 01-6.001 0M18 7l3-1m-3 1l-6-2m0-2v3m0 0V7m0 3h3m-3 0H9" />
                                      </svg>
                                    </div>
                                    <div>
                                      <span className="text-gray-400 block">Instância</span>
                                      <p className="text-white font-medium">{processo.instancia}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                      {processo.status === 'Em andamento' && (
                                        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      )}
                                      {processo.status === 'Julgado' && (
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      )}
                                      {processo.status === 'Em recurso' && (
                                        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                      )}
                                      {processo.status === 'Conciliação' && (
                                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                      )}
                                    </div>
                                    <div>
                                      <span className="text-gray-400 block">Status</span>
                                      <p className={`font-medium ${
                                        processo.status === 'Em andamento' ? 'text-yellow-300' :
                                        processo.status === 'Julgado' ? 'text-green-300' :
                                        processo.status === 'Em recurso' ? 'text-orange-300' :
                                        processo.status === 'Conciliação' ? 'text-blue-300' :
                                        'text-white'
                                      }`}>{processo.status}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <span className="text-gray-400 block">Última movimentação</span>
                                      <p className="text-white font-medium">{processo.ultimaMovimentacao}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Paginação para detalhes de processos */}
                          {getTotalProcessoDetailsPages() > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                              <div className="text-sm text-gray-400">
                                Mostrando {((currentProcessoDetailsPage - 1) * processosDetailsPerPage) + 1} a {Math.min(currentProcessoDetailsPage * processosDetailsPerPage, mockProcessoDetalhes[selectedTudoItem.id as keyof typeof mockProcessoDetalhes]?.length || 0)} de {mockProcessoDetalhes[selectedTudoItem.id as keyof typeof mockProcessoDetalhes]?.length || 0} processos
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {/* Botão Anterior */}
                                <button
                                  onClick={() => handleProcessoDetailsPageChange(currentProcessoDetailsPage - 1)}
                                  disabled={currentProcessoDetailsPage === 1}
                                  className="px-3 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                  Anterior
                                </button>

                                {/* Números das páginas */}
                                <div className="flex items-center space-x-1">
                                  {Array.from({ length: getTotalProcessoDetailsPages() }, (_, i) => i + 1).map((page) => (
                                    <button
                                      key={page}
                                      onClick={() => handleProcessoDetailsPageChange(page)}
                                      className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                                        page === currentProcessoDetailsPage
                                          ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                                          : 'text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10'
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  ))}
                                </div>

                                {/* Botão Próximo */}
                                <button
                                  onClick={() => handleProcessoDetailsPageChange(currentProcessoDetailsPage + 1)}
                                  disabled={currentProcessoDetailsPage === getTotalProcessoDetailsPages()}
                                  className="px-3 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                  Próximo
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-white/5 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h4 className="text-lg font-semibold text-white">{selectedTudoItem.titulo}</h4>
                              <p className="text-sm text-white mt-1">{getCurrentDiarioTudoDetails().length} resultados encontrados</p>
                            </div>
                            <button
                              onClick={backToTudoList}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                              </svg>
                              Voltar
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            {getCurrentDiarioTudoDetails().map((diario) => (
                              <div key={diario.id} className="bg-white/5 rounded-lg p-4 border border-white/10 relative">
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="flex-shrink-0 mt-0.5">
                                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs text-white">
                                      <span className="text-gray-400">Termo procurado:</span> {diario.termoProcurado}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="flex-shrink-0 mt-0.5">
                                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs text-white">
                                      <span className="text-gray-400">Fonte da publicação:</span> {diario.fonte}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="mb-3">
                                  <p className="text-xs text-gray-400 mb-2">Trecho da publicação:</p>
                                  <p className="text-xs text-gray-300 leading-relaxed">
                                    {diario.trecho.split(diario.termoProcurado.toLowerCase()).map((part, index, array) => (
                                      <span key={index}>
                                        {part}
                                        {index < array.length - 1 && (
                                          <span className="bg-yellow-400 text-black px-1 rounded font-medium">
                                            {diario.termoProcurado}
                                          </span>
                                        )}
                                      </span>
                                    ))}
                                  </p>
                                </div>
                                
                                <div className="flex items-start gap-3 mb-4">
                                  <div className="flex-shrink-0 mt-0.5">
                                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs text-white">
                                      <span className="text-gray-400">Data da publicação:</span> {diario.dataPublicacao}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Botão posicionado no canto superior direito */}
                                <button className="absolute top-4 right-4 px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors cursor-pointer text-xs">
                                  Visualizar diário oficial
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          {/* Paginação para detalhes de Diários Oficiais */}
                          {getTotalDiarioTudoDetailsPages() > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                              <div className="text-sm text-gray-400">
                                Mostrando {((currentDiarioTudoDetailsPage - 1) * diariosTudoDetailsPerPage) + 1} a {Math.min(currentDiarioTudoDetailsPage * diariosTudoDetailsPerPage, mockDiarioTudoDetalhes[selectedTudoItem.id as keyof typeof mockDiarioTudoDetalhes]?.length || 0)} de {mockDiarioTudoDetalhes[selectedTudoItem.id as keyof typeof mockDiarioTudoDetalhes]?.length || 0} resultados
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {/* Botão Anterior */}
                                <button
                                  onClick={() => handleDiarioTudoDetailsPageChange(currentDiarioTudoDetailsPage - 1)}
                                  disabled={currentDiarioTudoDetailsPage === 1}
                                  className="px-3 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                  Anterior
                                </button>

                                {/* Números das páginas */}
                                <div className="flex items-center space-x-1">
                                  {Array.from({ length: getTotalDiarioTudoDetailsPages() }, (_, i) => i + 1).map((page) => (
                                    <button
                                      key={page}
                                      onClick={() => handleDiarioTudoDetailsPageChange(page)}
                                      className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                                        page === currentDiarioTudoDetailsPage
                                          ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                                          : 'text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10'
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  ))}
                                </div>

                                {/* Botão Próximo */}
                                <button
                                  onClick={() => handleDiarioTudoDetailsPageChange(currentDiarioTudoDetailsPage + 1)}
                                  disabled={currentDiarioTudoDetailsPage === getTotalDiarioTudoDetailsPages()}
                                  className="px-3 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                  Próximo
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'dashboard' && (
                <div className="space-y-6 fade-in" key="dashboard">
                  {/* Cards de Estatísticas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                      onClick={() => setSelectedCard('diarios')}
                      className={`bg-white/3 backdrop-blur-sm border rounded-2xl p-6 hover:bg-white/5 transition-all duration-200 cursor-pointer ${
                        selectedCard === 'diarios' 
                          ? 'border-purple-400/50 bg-purple-500/10' 
                          : 'border-white/5'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                            <svg className="h-6 w-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-300">Diários Oficiais</p>
                          <p className="text-2xl font-bold text-white">2.502</p>
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => setSelectedCard('concurso')}
                      className={`bg-white/3 backdrop-blur-sm border rounded-2xl p-6 hover:bg-white/5 transition-all duration-200 cursor-pointer ${
                        selectedCard === 'concurso' 
                          ? 'border-blue-400/50 bg-blue-500/10' 
                          : 'border-white/5'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                            <svg className="h-6 w-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-300">Novos editais de concurso público</p>
                          <p className="text-2xl font-bold text-white">5</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Seção de Editais */}
                  <div className="mb-6">
                    {selectedCard === 'concurso' ? (
                      <div id="concursos-section" className="bg-white/3 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-white">
                            Novos concursos públicos
                          </h3>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-400 bg-gray-600/30 px-3 py-1 rounded-full">
                              {selectedDiario}
                            </span>
                            <span className="text-sm text-gray-400 bg-gray-600/30 px-3 py-1 rounded-full">
                              {selectedPoder}
                            </span>
                            <span className="text-sm text-gray-400 bg-gray-600/30 px-3 py-1 rounded-full">
                              {selectedEsfera}
                            </span>
                            <span className="text-sm text-gray-400 bg-gray-600/30 px-3 py-1 rounded-full">
                              {selectedPeriodo === 'hoje' ? 'Hoje' : selectedPeriodo === '7dias' ? 'Últimos 7 dias' : 'Últimos 30 dias'}
                            </span>
                          </div>
                        </div>
        <div className="space-y-4">
                          {/* Primeiro concurso - sempre visível */}
                          {mockDashboardData.editaisDouHoje.slice(0, 1).map((edital) => (
                            <div key={edital.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer">
                              <div className="flex items-center justify-between">
                  <div className="flex-1">
                                  <h4 className="text-sm font-medium text-white mb-2 line-clamp-2">
                                    {edital.titulo}
                                  </h4>
                                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                                    <span>{edital.fonte}</span>
                                    <span>{edital.data}</span>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => setExpandedConcurso(expandedConcurso === edital.id ? null : edital.id)}
                                  className="ml-4 px-3 py-1.5 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors cursor-pointer text-xs"
                                >
                                  {expandedConcurso === edital.id ? 'Ocultar detalhes' : 'Ver detalhes'}
                                </button>
                              </div>
                              
                              {/* Detalhes expandidos do concurso */}
                              {expandedConcurso === edital.id && edital.detalhes && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h5 className="text-sm font-semibold text-white mb-2">Informações Gerais</h5>
                                      <div className="space-y-3 text-xs">
                                        <div className="flex items-center">
                                          <span className="text-gray-400 w-24">Número:</span>
                                          <span className="text-white">{edital.detalhes.numero}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <span className="text-gray-400 w-24">Órgão:</span>
                                          <span className="text-white">{edital.detalhes.orgao}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <span className="text-gray-400 w-24">Total de Vagas:</span>
                                          <span className="text-white">{edital.detalhes.totalVagas}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <span className="text-gray-400 w-24">Data da Prova:</span>
                                          <span className="text-white">{edital.detalhes.dataProva}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <span className="text-gray-400 w-24">Valor da Inscrição:</span>
                                          <span className="text-white">{edital.detalhes.valorInscricao}</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h5 className="text-sm font-semibold text-white mb-2">Cargos e Vagas</h5>
                                      <div className="space-y-2">
                                        {edital.detalhes.cargos.map((cargo, index) => (
                                          <div key={index} className="bg-white/5 rounded p-2">
                                            <div className="text-xs text-white font-medium">{cargo.nome}</div>
                                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                              <span>{cargo.vagas} vagas</span>
                                              <span>{cargo.salario}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-4 pt-4 border-t border-white/10">
                                    <div className="space-y-3 text-xs">
                                      <div className="flex items-center">
                                        <span className="text-gray-400 w-32">Período de Inscrição:</span>
                                        <span className="text-white">{edital.detalhes.dataInscricao}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <span className="text-gray-400 w-32">Local da Prova:</span>
                                        <span className="text-white">{edital.detalhes.localProva}</span>
                                      </div>
                                      <div className="flex items-start">
                                        <span className="text-gray-400 w-32">Requisitos:</span>
                                        <span className="text-white">{edital.detalhes.requisitos}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Concursos bloqueados com blur (próximos 4) */}
                          {mockDashboardData.editaisDouHoje.slice(1, showMoreConcursos ? 6 : 5).map((edital) => (
                            <div key={edital.id} className="relative bg-white/5 rounded-lg p-4 overflow-hidden">
                              {/* Conteúdo borrado */}
                              <div className="blur-sm">
                                <h4 className="text-sm font-medium text-white mb-2 line-clamp-2">
                                  {edital.titulo}
                                </h4>
                                <div className="flex items-center space-x-4 text-xs text-gray-400">
                                  <span>{edital.fonte}</span>
                                  <span>{edital.data}</span>
                                </div>
                              </div>
                              
                              {/* Botão de revelar - fora do blur */}
                              <div className="absolute inset-0 flex items-center justify-center z-20">
                                <button
                                  onClick={() => setIsTestModalOpen(true)}
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl border-0 outline-none cursor-pointer"
                                  style={{ 
                                    opacity: 1,
                                    backgroundColor: 'transparent',
                                    backgroundImage: 'linear-gradient(to right, #3b82f6, #2563eb)'
                                  }}
                                >
                                  Revelar
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Concursos adicionais após "Mostrar mais" */}
                          {showMoreConcursos && mockDashboardData.editaisDouHoje.slice(5, 10).map((edital) => (
                            <div key={edital.id} className="relative bg-white/5 rounded-lg p-4 overflow-hidden">
                              {/* Conteúdo borrado */}
                              <div className="blur-sm">
                                <h4 className="text-sm font-medium text-white mb-2 line-clamp-2">
                                  {edital.titulo}
                                </h4>
                                <div className="flex items-center space-x-4 text-xs text-gray-400">
                                  <span>{edital.fonte}</span>
                                  <span>{edital.data}</span>
                                </div>
                              </div>
                              
                              {/* Botão de revelar - fora do blur */}
                              <div className="absolute inset-0 flex items-center justify-center z-20">
                                <button
                                  onClick={() => setIsTestModalOpen(true)}
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl border-0 outline-none cursor-pointer"
                                  style={{ 
                                    opacity: 1,
                                    backgroundColor: 'transparent',
                                    backgroundImage: 'linear-gradient(to right, #3b82f6, #2563eb)'
                                  }}
                                >
                                  Revelar
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Botão Mostrar mais/menos */}
                          {mockDashboardData.editaisDouHoje.length > 5 && (
                            <div className="text-center pt-2">
                              {!showMoreConcursos ? (
                                <button
                                  onClick={handleShowMoreConcursos}
                                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                                >
                                  Mostrar mais
                                </button>
                              ) : (
                                <button
                                  onClick={handleShowLessConcursos}
                                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                                >
                                  Mostrar menos
                                </button>
                              )}
                            </div>
                          )}

                          {/* Label de concursos restantes */}
                          {!showMoreConcursos && mockDashboardData.editaisDouHoje.length > 5 && (
                            <div className="text-center pt-2">
                              <span className="text-sm text-gray-400">
                                +{mockDashboardData.editaisDouHoje.length - 5} concursos hoje
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : selectedCard === 'diarios' ? (
                      <div id="diarios-section" className="bg-white/3 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-white">
                            Diários Oficiais
                    </h3>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-400 bg-gray-600/30 px-3 py-1 rounded-full">
                              {selectedPoder}
                            </span>
                            <span className="text-sm text-gray-400 bg-gray-600/30 px-3 py-1 rounded-full">
                              {selectedEsfera}
                            </span>
                            <span className="text-sm text-gray-400 bg-gray-600/30 px-3 py-1 rounded-full">
                              {selectedPeriodo === 'hoje' ? 'Hoje' : selectedPeriodo === '7dias' ? 'Últimos 7 dias' : 'Últimos 30 dias'}
                            </span>
                          </div>
                        </div>
                  
                        <div className="space-y-4">
                          {/* Estatísticas dos Diários Oficiais */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white/5 rounded-lg p-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                                    <svg className="h-5 w-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-300">Total de Diários</p>
                                  <p className="text-xl font-bold text-white">2.502</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-white/5 rounded-lg p-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                                    <svg className="h-5 w-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-300">Atualizados hoje</p>
                                  <p className="text-xl font-bold text-white">1.847</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-white/5 rounded-lg p-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                                    <svg className="h-5 w-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-300">Última atualização</p>
                                  <p className="text-sm font-bold text-white">18/01/2025 14:30</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Lista de Diários por Esfera */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-white mb-3">Diários por Esfera</h4>
                            
                            {/* Federal */}
                            <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                      <svg className="h-4 w-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="ml-3">
                                    <h5 className="text-sm font-medium text-white">Diário Oficial da União</h5>
                                    <p className="text-xs text-gray-400">Federal • Executivo</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-white">1 ativo</p>
                                  <p className="text-xs text-gray-400">5 novas edições hoje</p>
                                </div>
                              </div>
                            </div>

                            {/* Estadual */}
                            <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                                      <svg className="h-4 w-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="ml-3">
                                    <h5 className="text-sm font-medium text-white">Diários Estaduais</h5>
                                    <p className="text-xs text-gray-400">Estadual • Executivo/Legislativo/Judiciário</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-white">27 ativos</p>
                                  <p className="text-xs text-gray-400">120 novas edições hoje</p>
                                </div>
                              </div>
                            </div>

                            {/* Municipal */}
                            <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                                      <svg className="h-4 w-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="ml-3">
                                    <h5 className="text-sm font-medium text-white">Diários Municipais</h5>
                                    <p className="text-xs text-gray-400">Municipal • Executivo</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-white">1.819 ativos</p>
                                  <p className="text-xs text-gray-400">1.700 novas edições hoje</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Diários Recentes */}
                  <div className="bg-white/3 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Diários Recentes</h3>
                      <div className="space-y-3">
                        {mockDashboardData.recentDiarios.map((diario) => (
                          <div key={diario.id} className="bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                            <div className="p-4 min-h-[60px] flex items-center">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-white">{diario.nome}</p>
                                  <p className="text-xs text-gray-400">Edição {diario.edicao} - {diario.data}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-semibold text-blue-300 bg-blue-500/20 px-3 py-1.5 rounded-md">{diario.data}</span>
                                  <button 
                                    onClick={() => setExpandedDou(expandedDou === diario.id.toString() ? null : diario.id.toString())}
                                    className="flex items-center justify-center w-8 h-8 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg transition-colors cursor-pointer"
                                    title="Ver seções do DOU"
                                  >
                                    <svg 
                                      className={`w-4 h-4 text-gray-300 transition-transform ${expandedDou === diario.id.toString() ? 'rotate-180' : ''}`} 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                                  </button>
              </div>
                              </div>
                            </div>
                              
                              {/* Seções do DOU (expandidas) */}
                              {expandedDou === diario.id.toString() && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                  <p className="text-xs text-gray-400 mb-2">Seções disponíveis:</p>
                                  <div className="space-y-2">
                                    {diario.secoes.map((secao) => (
                                      <div key={secao.id} className="flex items-center justify-between p-2 bg-white/5 rounded-md hover:bg-white/10 transition-colors">
                                        <div className="flex-1">
                                          <p className="text-xs font-medium text-white">{secao.nome}</p>
                                          <p className="text-xs text-gray-400">Edição {secao.edicao}</p>
                                        </div>
                                        <button 
                                          className="flex items-center justify-center w-6 h-6 bg-gray-500/20 hover:bg-gray-500/30 rounded-md transition-colors cursor-pointer"
                                          title="Download da seção"
                                        >
                                          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                          </svg>
              </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

              {activeTab === 'processos' && (
                <div className="space-y-6 fade-in" key="processos">
                  {/* Barra de Pesquisa de Processos */}
                  <div className="bg-white/3 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Pesquisa processos nos Diários de Justiça</h3>
                    
                    {/* Campo de Busca */}
                    <div ref={processoAnchorRef} className="relative z-10 w-full mb-4">
                      <input
                        type="text"
                        placeholder="Digite seu nome ou número de processo"
                        value={processoSearchTerm}
                        onChange={handleProcessoInputChange}
                        onKeyDown={handleProcessoKeyDown}
                        onFocus={handleProcessoInputFocus}
                        onBlur={() => setTimeout(closeProcessoSuggestions, 200)}
                        className="w-full pl-4 pr-24 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400/60 focus:border-blue-400/40 focus:shadow-lg focus:shadow-blue-400/20 transition-all duration-200 text-base"
                        autoComplete="off"
                        role="combobox"
                        aria-expanded={showProcessoSuggestions}
                        aria-haspopup="listbox"
                        aria-autocomplete="list"
                      />
                      
                      {/* Botão de Limpar */}
                      {processoSearchTerm && (
                        <button 
                          onClick={clearProcessoInput}
                          className="absolute top-1/2 right-14 transform -translate-y-1/2 w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 group flex items-center justify-center cursor-pointer"
                          type="button"
                          aria-label="Limpar busca"
                        >
                          <svg className="h-3 w-3 text-gray-300 group-hover:text-white transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      
                      {/* Botão de Busca */}
                      <button
                        onClick={handleProcessoSearch}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 group flex items-center justify-center cursor-pointer"
                        type="button"
                        aria-label="Buscar"
                      >
                        <svg className="h-4 w-4 text-gray-300 group-hover:text-white group-hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
              </div>

                    {/* Exemplos */}
                    <div className="text-sm text-gray-400">
                      <p className="mb-2">Exemplos:</p>
                      <div className="flex flex-wrap gap-4">
                        <span className="text-gray-500">• João da Silva</span>
                        <span className="text-gray-500">• 0001234-56.2024.5.10.0000</span>
                      </div>
                    </div>
                  </div>

                  {/* Autocomplete Portal */}
                  <AutocompletePortal
                    anchorRef={processoAnchorRef}
                    open={showProcessoSuggestions}
                    items={processoSuggestionsForPortal}
                    onSelect={(item) => handleProcessoSuggestionClick(item.text)}
                    onClose={closeProcessoSuggestions}
                    selectedIndex={selectedProcessoIndex}
                    onKeyDown={handleProcessoKeyDown}
                    renderItem={(item, index, isSelected) => (
                      <button
                        key={item.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleProcessoSuggestionClick(item.text)}
                        className={`w-full px-4 py-3 text-left text-white transition-all duration-200 flex items-center gap-3 first:rounded-t-2xl last:rounded-b-2xl ${
                          isSelected 
                            ? 'bg-blue-500/30 border-l-2 border-blue-400' 
                            : 'hover:bg-blue-500/20'
                        }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="flex-1">
                          {item.text.split(new RegExp(`(${processoSearchTerm})`, 'gi')).map((part, i) => 
                            part.toLowerCase() === processoSearchTerm.toLowerCase() ? (
                              <strong key={i} className="text-blue-300">{part}</strong>
                            ) : (
                              <span key={i}>{part}</span>
                            )
                          )}
                        </span>
                      </button>
                    )}
                  />

                  {/* Resultados da Busca */}
                  {(isProcessoLoading || processoSearchResults.length > 0) && (
                    <div className="bg-white/3 backdrop-blur-sm border border-white/5 rounded-2xl p-6 relative z-0">
                      {isProcessoLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                          <span className="ml-3 text-gray-400">Buscando processos...</span>
                        </div>
                      ) : showProcessoDetails && selectedProcessoId ? (
                        // Exibir detalhes do processo selecionado
                        <div>
                          {/* Header com botão voltar */}
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {processoSearchResults.find(p => p.id === selectedProcessoId)?.nome}
              </h3>
                              <p className="text-sm text-gray-400 mt-1">
                                {processoSearchResults.find(p => p.id === selectedProcessoId)?.totalProcessos} processos encontrados
                              </p>
                    </div>
                            <button
                              onClick={backToProcessoList}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-600/30 text-gray-200 rounded-lg hover:bg-gray-600/50 transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                              Voltar
              </button>
                  </div>
                  
                          {/* Lista de processos individuais */}
                          <div className="space-y-4">
                            {getCurrentProcessos().map((processo) => (
                              <div key={processo.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-start gap-3 mb-3">
                                      <div className="flex-shrink-0 mt-1">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-white mb-1">Número do Processo</h4>
                                        <p className="text-xs text-gray-300 font-mono">{processo.numero}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3">
                                      <div className="flex-shrink-0 mt-1">
                                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-white mb-1">Partes Envolvidas</h4>
                                        <p className="text-xs text-gray-300 leading-relaxed">{processo.partes}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <button className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors cursor-pointer text-xs flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Ver processo
                    </button>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                  <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                                    </div>
                                    <div>
                                      <span className="text-gray-400 block">Tribunal</span>
                                      <p className="text-white font-medium">{processo.tribunal}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <span className="text-gray-400 block">Data de publicação</span>
                                      <p className="text-white font-medium">{processo.dataPublicacao}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                      </svg>
                                    </div>
                                    <div>
                                      <span className="text-gray-400 block">Movimentação</span>
                                      <p className="text-white font-medium">{processo.movimentacao}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 01-6.001 0M18 7l3-1m-3 1l-6-2m0-2v3m0 0V7m0 3h3m-3 0H9" />
                                      </svg>
                                    </div>
                                    <div>
                                      <span className="text-gray-400 block">Instância</span>
                                      <p className="text-white font-medium">{processo.instancia}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                      {processo.status === 'Em andamento' && (
                                        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      )}
                                      {processo.status === 'Julgado' && (
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      )}
                                      {processo.status === 'Em recurso' && (
                                        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                      )}
                                      {processo.status === 'Conciliação' && (
                                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                      )}
                                    </div>
                                    <div>
                                      <span className="text-gray-400 block">Status</span>
                                      <p className={`font-medium ${
                                        processo.status === 'Em andamento' ? 'text-yellow-300' :
                                        processo.status === 'Julgado' ? 'text-green-300' :
                                        processo.status === 'Em recurso' ? 'text-orange-300' :
                                        processo.status === 'Conciliação' ? 'text-blue-300' :
                                        'text-white'
                                      }`}>{processo.status}</p>
                                    </div>
        </div>

                                  <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <span className="text-gray-400 block">Última movimentação</span>
                                      <p className="text-white font-medium">{processo.ultimaMovimentacao}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Componente de Paginação */}
                          {getTotalProcessosPages() > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                              <div className="text-sm text-gray-400">
                                Mostrando {((currentProcessoPage - 1) * processosPerPage) + 1} a {Math.min(currentProcessoPage * processosPerPage, mockProcessoDetalhes[selectedProcessoId as keyof typeof mockProcessoDetalhes]?.length || 0)} de {mockProcessoDetalhes[selectedProcessoId as keyof typeof mockProcessoDetalhes]?.length || 0} processos
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {/* Botão Anterior */}
                                <button
                                  onClick={() => handleProcessoPageChange(currentProcessoPage - 1)}
                                  disabled={currentProcessoPage === 1}
                                  className="px-3 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                Anterior
                    </button>

                                {/* Números das páginas */}
                                <div className="flex items-center space-x-1">
                                  {Array.from({ length: getTotalProcessosPages() }, (_, i) => i + 1).map((page) => (
                                    <button
                                      key={page}
                                      onClick={() => handleProcessoPageChange(page)}
                                      className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                                        page === currentProcessoPage
                                          ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                                          : 'text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10'
                                      }`}
                                    >
                                      {page}
              </button>
                                  ))}
                  </div>

                                {/* Botão Próximo */}
                                <button
                                  onClick={() => handleProcessoPageChange(currentProcessoPage + 1)}
                                  disabled={currentProcessoPage === getTotalProcessosPages()}
                                  className="px-3 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                Próximo
              </button>
                </div>
              </div>
                          )}
                        </div>
                      ) : (
                        // Exibir lista de resultados
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4">
                            Encontramos {processoSearchResults.length.toLocaleString('pt-BR')} resultados de "{processoSearchTerm}"
                          </h3>
                          <div className="space-y-3">
                            {processoSearchResults.map((processo) => (
                              <div key={processo.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="text-sm font-medium text-white">{processo.nome}</h4>
                                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                        {processo.totalProcessos} processos
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-1">{processo.diario}</p>
                                    <p className="text-xs text-gray-500">{processo.data}</p>
                                  </div>
                                  <button 
                                    onClick={() => handleProcessoDetails(processo.id)}
                                    className="px-3 py-1.5 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors cursor-pointer text-xs"
                                  >
                                    Ver detalhes
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
          </div>
        )}

              {activeTab === 'diarios' && (
                <div className="space-y-6 fade-in" key="diarios">
                  {/* Barra de Pesquisa de Diários Oficiais */}
                  <div className="bg-white/3 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Pesquisa termos nos Diários Oficiais</h3>
                    
                    {/* Campo de Busca */}
                    <div ref={diarioOficialAnchorRef} className="relative z-10 w-full mb-4">
                      <input
                        type="text"
                        placeholder="Digite um CPF, CNPJ, nome de pessoa ou nome de empresa"
                        value={diarioOficialSearchTerm}
                        onChange={handleDiarioOficialInputChange}
                        onKeyDown={handleDiarioOficialKeyDown}
                        onFocus={handleDiarioOficialInputFocus}
                        onBlur={() => setTimeout(closeDiarioOficialSuggestions, 200)}
                        className="w-full pl-4 pr-24 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400/60 focus:border-blue-400/40 focus:shadow-lg focus:shadow-blue-400/20 transition-all duration-200 text-base"
                        autoComplete="off"
                        role="combobox"
                        aria-expanded={showDiarioOficialSuggestions}
                        aria-haspopup="listbox"
                        aria-autocomplete="list"
                      />
                      
                      {/* Botão de Limpar */}
                      {diarioOficialSearchTerm && (
                        <button 
                          onClick={clearDiarioOficialInput}
                          className="absolute top-1/2 right-14 transform -translate-y-1/2 w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 group flex items-center justify-center cursor-pointer"
                          type="button"
                          aria-label="Limpar busca"
                        >
                          <svg className="h-3 w-3 text-gray-300 group-hover:text-white transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      
                      {/* Botão de Busca */}
                      <button
                        onClick={() => executeDiarioOficialSearch(diarioOficialSearchTerm)}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 group flex items-center justify-center cursor-pointer"
                        type="button"
                        aria-label="Buscar"
                      >
                        <svg className="h-4 w-4 text-gray-300 group-hover:text-white group-hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                      </button>
              </div>

                    {/* Exemplos */}
                    <div className="text-sm text-gray-400">
                      <p className="mb-2">Exemplos:</p>
                      <div className="flex flex-wrap gap-4">
                        <span className="text-gray-500">• João da Silva</span>
                        <span className="text-gray-500">• Empresa XPTO</span>
                        <span className="text-gray-500">• 123.456.789-10</span>
                      </div>
                    </div>
                  </div>

                  {/* Autocomplete Portal */}
                  <AutocompletePortal
                    anchorRef={diarioOficialAnchorRef}
                    open={showDiarioOficialSuggestions}
                    items={diarioOficialSuggestionsForPortal}
                    onSelect={(item) => handleDiarioOficialSuggestionClick(item.text)}
                    onClose={closeDiarioOficialSuggestions}
                    selectedIndex={selectedDiarioOficialIndex}
                    onKeyDown={handleDiarioOficialKeyDown}
                    renderItem={(item, index, isSelected) => (
                      <button
                        key={item.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleDiarioOficialSuggestionClick(item.text)}
                        className={`w-full px-4 py-3 text-left text-white transition-all duration-200 flex items-center gap-3 first:rounded-t-2xl last:rounded-b-2xl ${
                          isSelected 
                            ? 'bg-blue-500/30 border-l-2 border-blue-400' 
                            : 'hover:bg-blue-500/20'
                        }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="flex-1">
                          {item.text.split(new RegExp(`(${diarioOficialSearchTerm})`, 'gi')).map((part, i) => 
                            part.toLowerCase() === diarioOficialSearchTerm.toLowerCase() ? (
                              <strong key={i} className="text-blue-300">{part}</strong>
                            ) : (
                              <span key={i}>{part}</span>
                            )
                          )}
                        </span>
                      </button>
                    )}
                  />

                  {/* Resultados da Busca */}
                  {(isDiarioOficialLoading || diarioOficialSearchResults.length > 0) && (
                    <div className="bg-white/3 backdrop-blur-sm border border-white/5 rounded-2xl p-6 relative z-0">
                      {isDiarioOficialLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                          <span className="ml-3 text-gray-400">Buscando nos diários oficiais...</span>
                        </div>
                      ) : showDiarioOficialDetails && selectedDiarioOficialId ? (
                        // Exibir detalhes do diário selecionado
                        <div>
                          {/* Header com botão voltar */}
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {diarioOficialSearchResults.find(d => d.id === selectedDiarioOficialId)?.nome || 'Detalhes do Diário Oficial'}
              </h3>
                              <p className="text-sm text-gray-400 mt-1">
                                {mockDiarioDetalhes[selectedDiarioOficialId as keyof typeof mockDiarioDetalhes]?.length || 0} resultados encontrados
                              </p>
                            </div>
                            <button
                              onClick={backToDiarioOficialList}
                              className="px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors cursor-pointer text-sm"
                            >
                              Voltar
              </button>
            </div>

                          {/* Cards dos resultados */}
                          <div className="space-y-4">
                            {getCurrentDiariosOficiais().map((diario) => (
                              <div key={diario.id} className="bg-white/5 rounded-lg p-6">
                                {/* Template para Rafael Ximenes */}
                                {diario.termoProcurado ? (
                                  <>
                                    {/* Header com botão alinhado à direita */}
                                    <div className="flex items-center justify-between mb-4 text-xs">
                                      <div className="flex items-center gap-3">
                                        <svg className="h-4 w-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <div>
                                          <span className="text-gray-400 block">Termo procurado:</span>
                                          <p className="text-white font-medium">{diario.termoProcurado}</p>
                                        </div>
                                      </div>
                                      <button className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors cursor-pointer text-xs">
                                        Visualizar diário oficial
                                      </button>
                                    </div>

                                    {/* Fonte da publicação */}
                                    <div className="flex items-center gap-3 mb-4 text-xs">
                                      <svg className="h-4 w-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <div>
                                        <span className="text-gray-400 block">Fonte da publicação:</span>
                                        <p className="text-white">{diario.fonte}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="mb-4 text-xs">
                                      <div className="flex items-center gap-3 mb-2">
                                        <svg className="h-4 w-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="text-gray-400">Trecho da publicação:</span>
                                      </div>
                                      <p className="text-white leading-relaxed">
                                        {diario.trecho.split(new RegExp(`(${diario.termoProcurado})`, 'gi')).map((part, i) => 
                                          part.toLowerCase() === diario.termoProcurado.toLowerCase() ? (
                                            <span key={i} className="bg-yellow-300 text-black px-1 rounded font-medium">{part.toLowerCase()}</span>
                                          ) : (
                                            <span key={i}>{part}</span>
                                          )
                                        )}
                                      </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 text-xs">
                                      <svg className="h-4 w-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      <div>
                                        <span className="text-gray-400 block">Data da publicação:</span>
                                        <p className="text-white">{diario.data}</p>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  // Template original para outros diários
                                  <>
                                    <h4 className="text-base font-semibold text-white mb-3">{diario.titulo}</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                                      <div>
                                        <span className="text-gray-400">Diário:</span>
                                        <p className="text-white">{diario.diario}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Data:</span>
                                        <p className="text-white">{diario.data}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Seção:</span>
                                        <p className="text-white">{diario.secao}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Edição:</span>
                                        <p className="text-white">{diario.edicao}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                      <span className="text-gray-400 block mb-2">Conteúdo:</span>
                                      <p className="text-white text-sm leading-relaxed">{diario.conteudo}</p>
                                    </div>
                                    
                                    {/* Informações adicionais baseadas no tipo */}
                                    {diario.orgao && (
                                      <div className="border-t border-white/10 pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <span className="text-gray-400">Órgão:</span>
                                            <p className="text-white">{diario.orgao}</p>
                                          </div>
                                          {diario.cargo && (
                                            <div>
                                              <span className="text-gray-400">Cargo:</span>
                                              <p className="text-white">{diario.cargo}</p>
                                            </div>
                                          )}
                                          {diario.salario && (
                                            <div>
                                              <span className="text-gray-400">Salário:</span>
                                              <p className="text-white">{diario.salario}</p>
                                            </div>
                                          )}
                                          {diario.modalidade && (
                                            <div>
                                              <span className="text-gray-400">Modalidade:</span>
                                              <p className="text-white">{diario.modalidade}</p>
                                            </div>
                                          )}
                                          {diario.valorEstimado && (
                                            <div>
                                              <span className="text-gray-400">Valor Estimado:</span>
                                              <p className="text-white">{diario.valorEstimado}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            ))}
        </div>

        {/* Paginação */}
                          {getTotalDiariosOficiaisPages() > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                              <div className="text-sm text-gray-400">
                                Mostrando {((currentDiarioOficialPage - 1) * diariosOficiaisPerPage) + 1} a {Math.min(currentDiarioOficialPage * diariosOficiaisPerPage, mockDiarioDetalhes[selectedDiarioOficialId as keyof typeof mockDiarioDetalhes]?.length || 0)} de {mockDiarioDetalhes[selectedDiarioOficialId as keyof typeof mockDiarioDetalhes]?.length || 0} resultados
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {/* Botão Anterior */}
                                <button
                                  onClick={() => handleDiarioOficialPageChange(currentDiarioOficialPage - 1)}
                                  disabled={currentDiarioOficialPage === 1}
                                  className="px-3 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                Anterior
              </button>
                                
                                {/* Números das páginas */}
                                {Array.from({ length: getTotalDiariosOficiaisPages() }, (_, i) => i + 1).map((page) => (
                                  <button
                                    key={page}
                                    onClick={() => handleDiarioOficialPageChange(page)}
                                    className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                                      currentDiarioOficialPage === page
                                        ? 'bg-blue-500/30 text-blue-200 border border-blue-400/40'
                                        : 'text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10'
                                    }`}
                                  >
                                    {page}
              </button>
                                ))}
                                
                                {/* Botão Próximo */}
                                <button
                                  onClick={() => handleDiarioOficialPageChange(currentDiarioOficialPage + 1)}
                                  disabled={currentDiarioOficialPage === getTotalDiariosOficiaisPages()}
                                  className="px-3 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>
                      ) : (
                        // Lista de resultados
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-4">
                            Encontramos {diarioOficialSearchResults.length} resultados de "{diarioOficialSearchTerm}"
                          </h4>
                          
                          <div className="space-y-4">
                            {diarioOficialSearchResults.map((resultado) => (
                              <div key={resultado.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="text-sm font-medium text-white line-clamp-2">{resultado.nome || resultado.titulo}</h4>
                                      <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                                        {resultado.resultados || 'N/A'} resultados
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                                      <span>{resultado.diario}</span>
                                      <span>{resultado.data}</span>
                                    </div>
                                    <p className="text-xs text-gray-300 line-clamp-2">{resultado.conteudo}</p>
                                  </div>
                                  <button 
                                    onClick={() => handleDiarioOficialDetails(resultado.id)}
                                    className="px-3 py-1.5 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors cursor-pointer text-xs"
                                  >
                                    Ver detalhes
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}


            </div>
          </div>
      </div>
      </main>

      <TestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />

    </div>
  );
}