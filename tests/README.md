# Testes de Smoke Visual - Modal de Configurações

Este diretório contém testes de smoke visual usando Playwright para verificar a funcionalidade do modal de configurações do usuário.

## Estrutura dos Testes

### `settings-modal.spec.ts`
Testes principais que verificam:
- Renderização do modal com todas as abas (Geral, Segurança, Assinaturas, Suporte)
- Banner dinâmico baseado no estado da assinatura
- Botões de planos marcados corretamente como ativos/desabilitados
- Estados de loading

### `simple-sync-test.spec.ts`
Testes simplificados focados na sincronização de estado:
- Plano gratuito (sem assinatura)
- Plano básico mensal ativo
- Plano premium anual ativo

### `helpers/modal-helpers.ts`
Funções auxiliares para:
- Abrir o modal de configurações
- Definir estado de assinatura no localStorage
- Navegar para a aba de Assinaturas

## Como Executar

```bash
# Executar todos os testes
npx playwright test

# Executar apenas testes de sincronização
npx playwright test tests/simple-sync-test.spec.ts

# Executar com interface visual
npx playwright test --headed

# Executar apenas no Chromium (mais estável)
npx playwright test --project=chromium
```

## Screenshots

Os testes geram screenshots automaticamente em `test-results/`:
- `sync-free-plan.png` - Estado do plano gratuito
- `sync-basic-plan.png` - Estado do plano básico mensal
- `sync-premium-plan.png` - Estado do plano premium anual

## Funcionalidades Testadas

### ✅ Sincronização de Estado
- Leitura do localStorage (`cjo.subscription`)
- Exibição dinâmica do banner baseado no plano ativo
- Marcação correta dos botões de planos como "Seu plano" ou "Plano Atual"
- Desabilitação do botão do plano ativo

### ✅ Estados de Assinatura
- **Gratuito**: Banner mostra "plano gratuito", botão "Plano Atual" desabilitado
- **Básico Mensal**: Banner mostra "plano básico mensal", botão "Seu plano" desabilitado
- **Premium Anual**: Banner mostra "plano premium anual", botão "Seu plano" desabilitado

### ✅ UI/UX
- Modal abre corretamente via menu do usuário
- Todas as abas são renderizadas
- Layout preservado sem quebras visuais
- Tipografia e cores mantidas

## Configuração

Os testes simulam um usuário logado com:
```javascript
localStorage.setItem('auth.user', JSON.stringify({
  id: '1',
  name: 'Usuário Teste',
  email: 'teste@exemplo.com'
}));
```

E diferentes estados de assinatura:
```javascript
localStorage.setItem('cjo.subscription', JSON.stringify({
  planId: 'basic', // 'free' | 'basic' | 'premium'
  cycle: 'monthly', // 'monthly' | 'annual'
  status: 'active',
  nextRenewalISO: '...',
  updatedAtISO: '...'
}));
```
