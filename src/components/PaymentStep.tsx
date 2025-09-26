'use client';

import { useState, useEffect } from 'react';

interface PaymentStepProps {
  plan: {
    name: string;
    price: string;
    billing: string;
  };
  onSuccess: (planName: string, cardData?: any) => void;
  onBack: () => void;
  initialCardData?: {
    number: string;
    name: string;
    expiry: string;
    cvc: string;
    brand: string;
    isDefault: boolean;
  };
  customTitle?: string;
  hidePlanSummary?: boolean;
}

export default function PaymentStep({ plan, onSuccess, onBack, initialCardData, customTitle, hidePlanSummary }: PaymentStepProps) {
  // Detectar tipo de cartão baseado no número
  const detectCardType = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    return 'unknown';
  };

  // Formatar número do cartão com máscara dinâmica
  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    const isAmex = cleanValue.startsWith('3');
    const maxLength = isAmex ? 15 : 16;
    
    let formatted = '';
    
    for (let i = 0; i < Math.min(cleanValue.length, maxLength); i++) {
      if (isAmex) {
        // Amex: #### ###### #####
        if (i === 4 || i === 10) {
          formatted += ' ';
        }
      } else {
        // Visa/Mastercard/Elo: #### #### #### ####
        if (i > 0 && i % 4 === 0) {
          formatted += ' ';
        }
      }
      formatted += cleanValue[i];
    }
    
    return formatted;
  };

  // Formatar número do cartão inicial se houver dados
  const formatInitialCardNumber = (number: string) => {
    if (!number) return '';
    return formatCardNumber(number);
  };

  const [cardData, setCardData] = useState({
    number: initialCardData?.number ? formatInitialCardNumber(initialCardData.number) : '',
    expiry: initialCardData?.expiry || '',
    cvc: initialCardData?.cvc || '',
    name: initialCardData?.name || '',
    cpf: '',
    cep: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'amex' | 'unknown'>('unknown');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Formatar data de validade MM/AA
  const formatExpiry = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length >= 2) {
      let month = cleanValue.substring(0, 2);
      let year = cleanValue.substring(2, 4);
      
      // Auto-corrigir mês se necessário
      if (month.length === 1 && parseInt(month) > 1) {
        month = '0' + month;
      }
      
      return month + '/' + year;
    }
    return cleanValue;
  };

  // Formatar CEP
  const formatCep = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length >= 5) {
      return cleanValue.substring(0, 5) + '-' + cleanValue.substring(5, 8);
    }
    return cleanValue;
  };

  // Formatar CPF
  const formatCpf = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length >= 11) {
      return cleanValue.substring(0, 3) + '.' + cleanValue.substring(3, 6) + '.' + cleanValue.substring(6, 9) + '-' + cleanValue.substring(9, 11);
    } else if (cleanValue.length >= 9) {
      return cleanValue.substring(0, 3) + '.' + cleanValue.substring(3, 6) + '.' + cleanValue.substring(6, 9) + '-' + cleanValue.substring(9);
    } else if (cleanValue.length >= 6) {
      return cleanValue.substring(0, 3) + '.' + cleanValue.substring(3, 6) + '.' + cleanValue.substring(6);
    } else if (cleanValue.length >= 3) {
      return cleanValue.substring(0, 3) + '.' + cleanValue.substring(3);
    }
    return cleanValue;
  };

  // Validação Luhn
  const validateLuhn = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    let sum = 0;
    let alt = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let n = parseInt(cleanNumber[i], 10);
      if (alt) { 
        n *= 2; 
        if (n > 9) n -= 9; 
      }
      sum += n; 
      alt = !alt;
    }
    
    return sum % 10 === 0;
  };

  // Validar data de validade
  const validateExpiry = (expiry: string) => {
    if (!expiry || expiry.length !== 5) return false;
    
    const [month, year] = expiry.split('/');
    const m = Number(month);
    if (m < 1 || m > 12) return false;
    
    const yearFull = 2000 + Number(year);
    const lastDay = new Date(yearFull, m, 0); // último dia do mês
    const now = new Date();
    
    // válido até o fim do mês de validade
    return lastDay >= new Date(now.getFullYear(), now.getMonth(), 1);
  };

  // Validar CPF
  const validateCPF = (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
    
    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf[i]) * (10 - i);
    }
    let remainder = sum % 11;
    let firstDigit = remainder < 2 ? 0 : 11 - remainder;
    
    if (parseInt(cleanCpf[9]) !== firstDigit) return false;
    
    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf[i]) * (11 - i);
    }
    remainder = sum % 11;
    let secondDigit = remainder < 2 ? 0 : 11 - remainder;
    
    return parseInt(cleanCpf[10]) === secondDigit;
  };

  // Validar nome (mínimo 2 palavras com 2+ letras cada)
  const validateName = (name: string) => {
    const trimmed = name.trim().replace(/\s+/g, ' ');
    const words = trimmed.split(' ').filter(word => word.length >= 2);
    return words.length >= 2;
  };

  // Validar campo individual
  const validateField = (field: string, value: string) => {
    const cleanNumber = cardData.number.replace(/\s/g, '');
    const mockCards = ['4444444444445555', '5555555555556666', '5555555555554444'];
    
    switch (field) {
      case 'number':
        if (!value.trim()) return 'Informe o número do cartão.';
        if (!/^\d+$/.test(cleanNumber)) return 'Digite apenas números.';
        
        const isAmex = cleanNumber.startsWith('3');
        const expectedLength = isAmex ? 15 : 16;
        
        if (cleanNumber.length < expectedLength) return 'Número do cartão incompleto.';
        if (cleanNumber.length > 19) return 'Número do cartão inválido.';
        
        // Verificar sequências óbvias
        if (/^(\d)\1+$/.test(cleanNumber)) return 'Número do cartão inválido.';
        
        // Validar Luhn apenas se não for cartão mock
        if (!mockCards.includes(cleanNumber) && !validateLuhn(cleanNumber)) {
          return 'Número do cartão inválido.';
        }
        return '';

      case 'name':
        if (!value.trim()) return 'Informe o nome como impresso no cartão.';
        if (!validateName(value)) return 'Digite nome e sobrenome.';
        return '';

      case 'expiry':
        if (!value.trim()) return 'Informe a validade (MM/AA).';
        if (!/^\d{2}\/\d{2}$/.test(value)) return 'Formato inválido (MM/AA).';
        
        const [month, year] = value.split('/');
        const monthNum = parseInt(month);
        if (monthNum < 1 || monthNum > 12) return 'Mês deve ser de 01 a 12.';
        if (!validateExpiry(value)) return 'Cartão vencido.';
        return '';

      case 'cvc':
        if (!value.trim()) return 'Informe o CVC.';
        const isAmexCvc = cleanNumber.startsWith('3');
        const expectedCvcLength = isAmexCvc ? 4 : 3;
        if (value.length !== expectedCvcLength) return `CVC deve ter ${expectedCvcLength} dígitos.`;
        return '';

      case 'cpf':
        if (value.trim() && !validateCPF(value)) return 'CPF inválido.';
        return '';

      case 'cep':
        if (value.trim() && value.replace(/\D/g, '').length !== 8) return 'CEP inválido.';
        return '';

      default:
        return '';
    }
  };

  // Validar formulário completo
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validar todos os campos obrigatórios
    const requiredFields = ['number', 'name', 'expiry', 'cvc'];
    const optionalFields = ['cpf', 'cep'];
    
    [...requiredFields, ...optionalFields].forEach(field => {
      const error = validateField(field, cardData[field as keyof typeof cardData]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Processar pagamento
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const cleanNumber = cardData.number.replace(/\s/g, '');
    
    // Verificar se é um dos cartões mock
    const mockCards = ['4444444444445555', '5555555555556666', '5555555555554444'];
    
    if (mockCards.includes(cleanNumber)) {
      // Sucesso - passar dados do cartão
      onSuccess(plan.name, {
        number: cleanNumber,
        name: cardData.name.trim().replace(/\s+/g, ' '),
        expiry: cardData.expiry,
        cvc: cardData.cvc,
        brand: detectCardType(cleanNumber) === 'mastercard' ? 'mastercard' : 'visa'
      });
    } else {
      // Falha
      setErrors({ number: 'Use um dos cartões de teste: 4444 4444 4444 5555, 5555 5555 5555 6666 ou 5555 5555 5555 4444' });
    }
    
    setIsProcessing(false);
  };

  // Atualizar tipo de cartão quando número muda
  useEffect(() => {
    const cleanNumber = cardData.number.replace(/\s/g, '');
    if (cleanNumber.length >= 6) {
      setCardType(detectCardType(cleanNumber));
    } else {
      setCardType('unknown');
    }
  }, [cardData.number]);

  // Foco no título quando componente monta
  useEffect(() => {
    const title = document.querySelector('[data-payment-title]');
    if (title) {
      (title as HTMLElement).focus();
    }
  }, []);

  // Auto-focus no próximo campo
  const handleKeyPress = (e: React.KeyboardEvent, nextFieldId?: string) => {
    if (e.key === 'Enter' && nextFieldId) {
      e.preventDefault();
      const nextField = document.getElementById(nextFieldId);
      if (nextField) {
        nextField.focus();
      }
    }
  };

  // Verificar se formulário está válido para habilitar botão
  const isFormValid = () => {
    const requiredFields = ['number', 'name', 'expiry', 'cvc'];
    return requiredFields.every(field => {
      const error = validateField(field, cardData[field as keyof typeof cardData]);
      return !error;
    });
  };

  return (
    <div className="space-y-4">
      {/* Título */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer"
          aria-label="Voltar para seleção de planos"
        >
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 
          data-payment-title
          className="text-xl font-bold text-white focus:outline-none"
          tabIndex={-1}
        >
          {customTitle || (initialCardData ? `Editar Cartão` : `Finalizar Assinatura - ${plan.name}`)}
        </h2>
      </div>

      {/* Resumo do Plano - apenas quando não estiver editando e não estiver oculto */}
      {!initialCardData && !hidePlanSummary && (
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-3 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
            <p className="text-sm text-gray-400">{plan.billing}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{plan.price}</div>
            <div className="text-sm text-gray-400">por mês</div>
          </div>
        </div>
        </div>
      )}

      {/* Layout Responsivo - Desktop: Grid, Mobile: Stack */}
      <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6">
        {/* Formulário - ocupa 2 colunas no desktop */}
        <div className="md:col-span-2">
          {/* Cartão Visual - apenas no mobile */}
          <div className="relative mb-6 md:hidden">
            <div className="rounded-xl ring-1 ring-white/10 bg-gradient-to-br from-blue-600/30 to-fuchsia-600/25 p-4 w-full max-h-[160px] aspect-[1.586] text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-medium opacity-80">Cartão de Crédito</div>
                <div className="flex items-center space-x-2">
                  {cardType === 'visa' && (
                    <div className="w-6 h-4 bg-white rounded flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">VISA</span>
                    </div>
                  )}
                  {cardType === 'mastercard' && (
                    <div className="w-6 h-4 bg-white rounded flex items-center justify-center">
                      <span className="text-red-600 font-bold text-xs">MC</span>
                    </div>
                  )}
                  {cardType === 'amex' && (
                    <div className="w-6 h-4 bg-white rounded flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">AMEX</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-lg font-mono tracking-wider mb-3">
                {cardData.number || '•••• •••• •••• ••••'}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-80 mb-1">NOME NO CARTÃO</div>
                  <div className="text-xs font-medium">
                    {cardData.name || 'NOME COMPLETO'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-80 mb-1">VÁLIDO ATÉ</div>
                  <div className="text-xs font-medium">
                    {cardData.expiry || 'MM/AA'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Pagamento */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Número do Cartão */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Número do Cartão *
            </label>
            <input
              type="text"
              id="card-number"
              value={cardData.number}
              onChange={(e) => {
                const formatted = formatCardNumber(e.target.value);
                setCardData({ ...cardData, number: formatted });
                if (touched.number) {
                  const error = validateField('number', formatted);
                  setErrors(prev => ({ ...prev, number: error }));
                }
              }}
              onBlur={() => {
                setTouched(prev => ({ ...prev, number: true }));
                const error = validateField('number', cardData.number);
                setErrors(prev => ({ ...prev, number: error }));
              }}
              onKeyPress={(e) => handleKeyPress(e, 'card-name')}
              placeholder="1234 5678 9012 3456"
              className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.number ? 'border-red-500' : 'border-gray-600'
              }`}
              autoComplete="cc-number"
              inputMode="numeric"
              maxLength={19}
              aria-describedby={errors.number ? 'card-number-error' : undefined}
            />
            {errors.number && (
              <p id="card-number-error" className="mt-1 text-sm text-red-400">{errors.number}</p>
            )}
          </div>

          {/* Nome no Cartão */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome no Cartão *
            </label>
            <input
              type="text"
              id="card-name"
              value={cardData.name}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setCardData({ ...cardData, name: value });
                if (touched.name) {
                  const error = validateField('name', value);
                  setErrors(prev => ({ ...prev, name: error }));
                }
              }}
              onBlur={() => {
                setTouched(prev => ({ ...prev, name: true }));
                const error = validateField('name', cardData.name);
                setErrors(prev => ({ ...prev, name: error }));
              }}
              onKeyPress={(e) => handleKeyPress(e, 'card-expiry')}
              placeholder="NOME COMPLETO"
              className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-600'
              }`}
              autoComplete="cc-name"
              aria-describedby={errors.name ? 'card-name-error' : undefined}
            />
            {errors.name && (
              <p id="card-name-error" className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Validade */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Validade *
            </label>
            <input
              type="text"
              id="card-expiry"
              value={cardData.expiry}
              onChange={(e) => {
                const formatted = formatExpiry(e.target.value);
                setCardData({ ...cardData, expiry: formatted });
                if (touched.expiry) {
                  const error = validateField('expiry', formatted);
                  setErrors(prev => ({ ...prev, expiry: error }));
                }
              }}
              onBlur={() => {
                setTouched(prev => ({ ...prev, expiry: true }));
                const error = validateField('expiry', cardData.expiry);
                setErrors(prev => ({ ...prev, expiry: error }));
              }}
              onKeyPress={(e) => handleKeyPress(e, 'card-cvc')}
              placeholder="MM/AA"
              className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.expiry ? 'border-red-500' : 'border-gray-600'
              }`}
              autoComplete="cc-exp"
              inputMode="numeric"
              maxLength={5}
              aria-describedby={errors.expiry ? 'card-expiry-error' : undefined}
            />
            {errors.expiry && (
              <p id="card-expiry-error" className="mt-1 text-sm text-red-400">{errors.expiry}</p>
            )}
          </div>

          {/* CVC */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              CVC *
            </label>
            <input
              type="text"
              id="card-cvc"
              value={cardData.cvc}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setCardData({ ...cardData, cvc: value });
                if (touched.cvc) {
                  const error = validateField('cvc', value);
                  setErrors(prev => ({ ...prev, cvc: error }));
                }
              }}
              onBlur={() => {
                setTouched(prev => ({ ...prev, cvc: true }));
                const error = validateField('cvc', cardData.cvc);
                setErrors(prev => ({ ...prev, cvc: error }));
              }}
              onKeyPress={(e) => handleKeyPress(e, 'card-cpf')}
              placeholder={cardType === 'amex' ? '1234' : '123'}
              className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.cvc ? 'border-red-500' : 'border-gray-600'
              }`}
              autoComplete="cc-csc"
              inputMode="numeric"
              maxLength={4}
              aria-describedby={errors.cvc ? 'card-cvc-error' : undefined}
            />
            {errors.cvc && (
              <p id="card-cvc-error" className="mt-1 text-sm text-red-400">{errors.cvc}</p>
            )}
          </div>

          {/* CPF (Opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              CPF (Opcional)
            </label>
            <input
              type="text"
              id="card-cpf"
              value={cardData.cpf}
              onChange={(e) => {
                const formatted = formatCpf(e.target.value);
                setCardData({ ...cardData, cpf: formatted });
                if (touched.cpf) {
                  const error = validateField('cpf', formatted);
                  setErrors(prev => ({ ...prev, cpf: error }));
                }
              }}
              onBlur={() => {
                setTouched(prev => ({ ...prev, cpf: true }));
                const error = validateField('cpf', cardData.cpf);
                setErrors(prev => ({ ...prev, cpf: error }));
              }}
              onKeyPress={(e) => handleKeyPress(e, 'card-cep')}
              placeholder="000.000.000-00"
              className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.cpf ? 'border-red-500' : 'border-gray-600'
              }`}
              inputMode="numeric"
              maxLength={14}
              aria-describedby={errors.cpf ? 'card-cpf-error' : undefined}
            />
            {errors.cpf && (
              <p id="card-cpf-error" className="mt-1 text-sm text-red-400">{errors.cpf}</p>
            )}
          </div>

          {/* CEP (Opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              CEP (Opcional)
            </label>
            <input
              type="text"
              id="card-cep"
              value={cardData.cep}
              onChange={(e) => {
                const formatted = formatCep(e.target.value);
                setCardData({ ...cardData, cep: formatted });
                if (touched.cep) {
                  const error = validateField('cep', formatted);
                  setErrors(prev => ({ ...prev, cep: error }));
                }
              }}
              onBlur={() => {
                setTouched(prev => ({ ...prev, cep: true }));
                const error = validateField('cep', cardData.cep);
                setErrors(prev => ({ ...prev, cep: error }));
              }}
              placeholder="00000-000"
              className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.cep ? 'border-red-500' : 'border-gray-600'
              }`}
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={9}
              aria-describedby={errors.cep ? 'card-cep-error' : undefined}
            />
            {errors.cep && (
              <p id="card-cep-error" className="mt-1 text-sm text-red-400">{errors.cep}</p>
            )}
          </div>
        </div>

        {/* Microcopy de Segurança */}
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Seus dados estão protegidos com criptografia SSL</span>
        </div>

        {/* Botões */}
        <div className="flex space-x-4 pt-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={isProcessing || !isFormValid()}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processando...</span>
              </>
            ) : (
              initialCardData ? 'Salvar Alterações' : (customTitle === 'Novo Cartão' ? 'Adicionar cartão' : 'Finalizar Assinatura')
            )}
          </button>
            </div>
          </form>
        </div>

        {/* Cartão Visual - Desktop */}
        <div className="hidden md:block md:col-span-1">
          <div className="sticky top-4">
            <div className="rounded-xl ring-1 ring-white/10 bg-gradient-to-br from-blue-600/30 to-fuchsia-600/25 p-4 w-full md:max-w-[360px] max-h-[200px] aspect-[1.586] text-white mt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium opacity-80">Cartão de Crédito</div>
                <div className="flex items-center space-x-2">
                  {cardType === 'visa' && (
                    <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">VISA</span>
                    </div>
                  )}
                  {cardType === 'mastercard' && (
                    <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                      <span className="text-red-600 font-bold text-xs">MC</span>
                    </div>
                  )}
                  {cardType === 'amex' && (
                    <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">AMEX</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xl font-mono tracking-wider mb-4">
                {cardData.number || '•••• •••• •••• ••••'}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-80 mb-1">NOME NO CARTÃO</div>
                  <div className="text-sm font-medium">
                    {cardData.name || 'NOME COMPLETO'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-80 mb-1">VÁLIDO ATÉ</div>
                  <div className="text-sm font-medium">
                    {cardData.expiry || 'MM/AA'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}