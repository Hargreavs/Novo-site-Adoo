'use client';

import { useState } from 'react';
import TransparentHeader from "@/components/TransparentHeader";
import RevealWrapper from "@/components/RevealWrapper";

export default function RadarIA() {
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [monitorings, setMonitorings] = useState<any[]>([]);
  const [selectedMonitoring, setSelectedMonitoring] = useState<any | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerAnimation, setDrawerAnimation] = useState<'slide-in' | 'slide-out' | null>(null);
  const [selectedDiarios, setSelectedDiarios] = useState<string[]>([]);
  const [expandedPoderes, setExpandedPoderes] = useState<{[key: string]: boolean}>({});
  const [expandedSubcategorias, setExpandedSubcategorias] = useState<{[key: string]: boolean}>({});
  const [diarioSearchTerm, setDiarioSearchTerm] = useState('');
  const [valorRange, setValorRange] = useState({ min: 0, max: 100000 });
  const [valorRangeType, setValorRangeType] = useState<'predefined' | 'custom'>('predefined');
  const [selectedPredefinedRange, setSelectedPredefinedRange] = useState<string>('10k-50k');

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
    setSelectedContext(contextId);
    setShowForm(true);
  };

  const handleCreateMonitoring = () => {
    // Mock: Simular criação de monitoramento
    const context = contexts.find(c => c.id === selectedContext);
    const newMonitoring = {
      id: Date.now().toString(),
      contextId: selectedContext,
      contextName: context?.title,
      contextIcon: context?.icon,
      contextColor: context?.color,
      createdAt: new Date().toISOString(),
      status: 'active',
      totalFound: Math.floor(Math.random() * 50) + 1,
      lastFound: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      configurations: getMockConfigurations(selectedContext!),
      history: generateMockHistory(selectedContext!),
      selectedDiarios: selectedDiarios,
      valorRange: valorRange,
      valorRangeType: valorRangeType,
      selectedPredefinedRange: selectedPredefinedRange
    };
    
    setMonitorings(prev => [...prev, newMonitoring]);
    setShowForm(false);
    setSelectedContext(null);
    setSelectedDiarios([]);
    setValorRange({ min: 0, max: 100000 });
    setValorRangeType('predefined');
    setSelectedPredefinedRange('10k-50k');
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
          fonte: 'ComprasNet',
          categoria: 'Tecnologia da Informação',
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

  const generateMockHistory = (contextId: string) => {
    const history = [];
    const now = new Date();
    
    for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) {
      const date = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      history.push({
        id: i.toString(),
        title: getMockTitle(contextId),
        date: date.toISOString(),
        source: getMockSource(contextId),
        description: getMockDescription(contextId),
        url: '#'
      });
    }
    
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getMockTitle = (contextId: string) => {
    const titles = {
      concursos: [
        'Edital de Concurso Público - Prefeitura Municipal',
        'Concurso Público - Tribunal de Justiça',
        'Processo Seletivo - Secretaria de Educação'
      ],
      licitacoes: [
        'Pregão Eletrônico - Serviços de TI',
        'Tomada de Preços - Obras de Infraestrutura',
        'Concorrência - Equipamentos Médicos'
      ],
      leis: [
        'Lei Municipal sobre Transparência Pública',
        'Decreto de Regulamentação de Serviços',
        'Portaria sobre Licenciamento Ambiental'
      ]
    };
    const contextTitles = titles[contextId as keyof typeof titles] || [];
    return contextTitles[Math.floor(Math.random() * contextTitles.length)];
  };

  const getMockSource = (contextId: string) => {
    const sources = {
      concursos: ['DOU', 'DOE', 'DOM'],
      licitacoes: ['ComprasNet', 'BEC/SP', 'Portal Estadual'],
      leis: ['DOU', 'Assembleia Legislativa', 'Câmara Municipal']
    };
    const contextSources = sources[contextId as keyof typeof sources] || [];
    return contextSources[Math.floor(Math.random() * contextSources.length)];
  };

  const getMockDescription = (contextId: string) => {
    const descriptions = {
      concursos: 'Novo edital publicado com vagas para diversas áreas',
      licitacoes: 'Nova licitação aberta conforme critérios estabelecidos',
      leis: 'Nova norma publicada com alterações na legislação'
    };
    return descriptions[contextId as keyof typeof descriptions] || '';
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

  return (
    <div className="bg-transparent min-h-screen">
      <TransparentHeader currentPage="radar-ia" />

      <div className="relative isolate px-6 pt-14 lg:px-8 fade-in-up">
        {/* Hero Section */}
        <div className="mx-auto max-w-6xl py-16 sm:py-24">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 sm:text-6xl fade-in-delay-1" style={{ lineHeight: '1.2', paddingBottom: '2px' }}>
                Radar IA
              </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-3xl mx-auto fade-in-delay-2">
              Configure seu monitoramento inteligente e receba apenas as publicações que importam para você
            </p>
          </div>

          {/* Contextos Disponíveis */}
          <div className="mb-12 fade-in-delay-3">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                Escolha o contexto para monitorar
              </h2>
              {monitorings.length > 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Novo Contexto
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contexts.map((context, index) => (
                <div
                  key={context.id}
                  onClick={() => handleContextClick(context.id)}
                  className="relative bg-white/5 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-6 cursor-pointer hover:border-blue-400/50 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04),0_0_20px_rgba(59,130,246,0.1)] group"
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
            <div className="bg-white/5 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-8 mb-8 fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Configurar {contexts.find(c => c.id === selectedContext)?.title}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setSelectedContext(null);
                    setSelectedDiarios([]);
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
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fonte
                    </label>
                    <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>ComprasNet</option>
                      <option>BEC/SP - Bolsa Eletrônica de Compras</option>
                      <option>Portal de Compras do Estado</option>
                      <option>Portal de Compras do Município</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Categoria do Contrato
                    </label>
                    <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Engenharia</option>
                      <option>Tecnologia da Informação</option>
                      <option>Saúde</option>
                      <option>Educação</option>
                      <option>Segurança</option>
                      <option>Outros</option>
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
                  onClick={handleCreateMonitoring}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Criar monitoramento de contexto
                </button>
              </div>
            </div>
          )}

          {/* Monitoramentos Ativos */}
          {monitorings.length > 0 && (
            <div className="mb-12 fade-in-delay-3">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">
                Monitoramentos Ativos
              </h2>
              <div className="space-y-3">
                {monitorings.map((monitoring, index) => (
                  <div
                    key={monitoring.id}
                    className={`relative bg-white/5 backdrop-blur-sm border rounded-xl p-4 transition-all duration-300 hover:transform hover:-translate-y-0.5 ${
                      monitoring.status === 'active' 
                        ? 'border-green-400/30 hover:border-green-400/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]' 
                        : 'border-gray-600/30 opacity-60 hover:opacity-80'
                    }`}
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between">
                      {/* Informações principais */}
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="text-2xl mr-4 flex-shrink-0">{monitoring.contextIcon}</div>
                        <div className="flex-1 min-w-0">
                          {/* Título do contexto */}
                          <h3 className="text-lg font-semibold text-white truncate">{monitoring.contextName}</h3>
                          
                          {/* Segunda linha: Status e Data */}
                          <div className="flex items-center gap-4 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              monitoring.status === 'active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {monitoring.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                            <span className="text-sm text-gray-400">
                              Criado em {new Date(monitoring.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          
                          {/* Terceira linha: Estatísticas */}
                          <div className="flex items-center gap-6 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-300">Total encontrado:</span>
                              <span className="text-sm font-bold text-blue-400">{monitoring.totalFound}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-300">Última descoberta:</span>
                              <span className="text-sm text-gray-400">
                                {new Date(monitoring.lastFound).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ações com ícones minimalistas */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleViewDetails(monitoring)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                          title="Ver detalhes"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditMonitoring(monitoring)}
                          className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all duration-200"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setMonitorings(prev => prev.filter(m => m.id !== monitoring.id))}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                          title="Excluir"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleMonitoringStatus(monitoring.id)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            monitoring.status === 'active'
                              ? 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
                              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-500/10'
                          }`}
                          title={monitoring.status === 'active' ? 'Desativar' : 'Ativar'}
                        >
                          {monitoring.status === 'active' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


        </div>
      </div>

      {/* Drawer de Detalhes */}
      {showDrawer && selectedMonitoring && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${drawerAnimation === 'slide-in' ? 'drawer-overlay-fade-in' : drawerAnimation === 'slide-out' ? 'drawer-overlay-fade-out' : ''}`}
            onClick={closeDrawer}
          ></div>
          <div className={`absolute right-0 top-0 h-full w-full max-w-2xl bg-gray-900/95 backdrop-blur-sm border-l border-blue-400/30 shadow-2xl ${drawerAnimation === 'slide-in' ? 'drawer-slide-in-right' : drawerAnimation === 'slide-out' ? 'drawer-slide-out-right' : ''}`}>
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
                  <h3 className="text-lg font-semibold text-white mb-4">Histórico de Descobertas</h3>
                  <div className="space-y-3">
                    {selectedMonitoring.history.map((item: any, index: number) => (
                      <div key={item.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-1">{item.title}</h4>
                            <p className="text-sm text-gray-300 mb-2">{item.description}</p>
                            <div className="flex items-center text-xs text-gray-400">
                              <span className="mr-4">Fonte: {item.source}</span>
                              <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                          <button className="ml-4 text-blue-400 hover:text-blue-300 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer do Drawer */}
              <div className="p-6 border-t border-gray-700">
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEditMonitoring(selectedMonitoring)}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-500 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Editar Configurações
                  </button>
                  <button
                    onClick={closeDrawer}
                    className="flex-1 bg-gray-600 text-white hover:bg-gray-500 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

