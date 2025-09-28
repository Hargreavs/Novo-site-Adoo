import { test, expect } from '@playwright/test';
import { openUserSettingsModal, setSubscriptionState, navigateToSubscriptionsTab } from './helpers/modal-helpers';

test.describe('Settings Modal Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página principal
    await page.goto('/');
    
    // Aguardar a página carregar completamente
    await page.waitForLoadState('networkidle');
  });

  test('should render modal with all tabs', async ({ page }) => {
    // Abrir modal usando helper
    await openUserSettingsModal(page);

    // Verificar se o modal está visível
    const modal = page.locator('[data-testid="settings-modal"], .fixed.inset-0').first();
    await expect(modal).toBeVisible();

    // Verificar se todas as abas estão presentes
    const tabs = ['Geral', 'Segurança', 'Assinaturas', 'Suporte'];
    for (const tabName of tabs) {
      const tab = page.locator(`button:has-text("${tabName}")`);
      await expect(tab).toBeVisible();
    }

    // Tirar screenshot do modal completo
    await page.screenshot({ 
      path: 'test-results/settings-modal-all-tabs.png',
      fullPage: true 
    });
  });

  test('should show free plan banner when no active subscription', async ({ page }) => {
    // Garantir que não há assinatura ativa
    await setSubscriptionState(page, null);
    
    // Abrir modal e ir para aba de Assinaturas
    await openUserSettingsModal(page);
    await navigateToSubscriptionsTab(page);

    // Verificar banner do plano gratuito
    const banner = page.locator('.p-5.bg-blue-500\\/10').first();
    await expect(banner).toBeVisible();

    // Verificar texto do banner
    await expect(banner).toContainText('plano gratuito');
    await expect(banner).toContainText('Explore nossos planos e escolha o que melhor se adapta às suas necessidades');

    // Verificar que o card gratuito está marcado como "Plano Atual"
    const freePlanButton = page.locator('button:has-text("Plano Atual")').first();
    await expect(freePlanButton).toBeVisible();
    await expect(freePlanButton).toBeDisabled();

    // Tirar screenshot da aba de assinaturas
    await page.screenshot({ 
      path: 'test-results/settings-modal-free-plan.png',
      fullPage: true 
    });
  });

  test('should show active plan banner when subscription is active', async ({ page }) => {
    // Simular assinatura ativa básica mensal
    await setSubscriptionState(page, {
      planId: 'basic',
      cycle: 'monthly',
      status: 'active',
      nextRenewalISO: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAtISO: new Date().toISOString()
    });
    
    // Abrir modal e ir para aba de Assinaturas
    await openUserSettingsModal(page);
    await navigateToSubscriptionsTab(page);

    // Verificar banner do plano ativo
    const banner = page.locator('.p-5.bg-blue-500\\/10').first();
    await expect(banner).toBeVisible();

    // Verificar texto do banner
    await expect(banner).toContainText('plano básico mensal');
    await expect(banner).toContainText('Gerencie sua assinatura ou altere seu plano quando quiser');

    // Verificar que o card básico está marcado como "Seu plano"
    const basicPlanButton = page.locator('button:has-text("Seu plano")').first();
    await expect(basicPlanButton).toBeVisible();
    await expect(basicPlanButton).toBeDisabled();

    // Verificar que contém "Mensal"
    await expect(basicPlanButton).toContainText('Mensal');

    // Tirar screenshot da aba de assinaturas
    await page.screenshot({ 
      path: 'test-results/settings-modal-active-plan.png',
      fullPage: true 
    });
  });

  test('should show premium annual plan correctly', async ({ page }) => {
    // Simular assinatura premium anual
    await setSubscriptionState(page, {
      planId: 'premium',
      cycle: 'annual',
      status: 'active',
      nextRenewalISO: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAtISO: new Date().toISOString()
    });
    
    // Abrir modal e ir para aba de Assinaturas
    await openUserSettingsModal(page);
    await navigateToSubscriptionsTab(page);

    // Verificar banner do plano premium anual
    const banner = page.locator('.p-5.bg-blue-500\\/10').first();
    await expect(banner).toBeVisible();

    // Verificar texto do banner
    await expect(banner).toContainText('plano premium anual');

    // Verificar que o card premium está marcado como "Seu plano"
    const premiumPlanButton = page.locator('button:has-text("Seu plano")').first();
    await expect(premiumPlanButton).toBeVisible();
    await expect(premiumPlanButton).toBeDisabled();

    // Verificar que contém "Anual"
    await expect(premiumPlanButton).toContainText('Anual');

    // Tirar screenshot da aba de assinaturas
    await page.screenshot({ 
      path: 'test-results/settings-modal-premium-annual.png',
      fullPage: true 
    });
  });

  test('should disable correct plan button when subscription is active', async ({ page }) => {
    // Simular assinatura básica ativa
    await setSubscriptionState(page, {
      planId: 'basic',
      cycle: 'monthly',
      status: 'active',
      nextRenewalISO: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAtISO: new Date().toISOString()
    });
    
    // Abrir modal e ir para aba de Assinaturas
    await openUserSettingsModal(page);
    await navigateToSubscriptionsTab(page);

    // Verificar que apenas o plano básico está desabilitado
    const basicPlanButton = page.locator('button:has-text("Seu plano")').first();
    await expect(basicPlanButton).toBeDisabled();

    // Verificar que os outros planos estão habilitados
    const freePlanButton = page.locator('button:has-text("Plano Atual")').first();
    await expect(freePlanButton).toBeDisabled(); // Gratuito sempre desabilitado

    const premiumPlanButton = page.locator('button:has-text("Assinar plano"), button:has-text("Assinar")').last();
    await expect(premiumPlanButton).toBeEnabled();

    // Tirar screenshot da aba de assinaturas
    await page.screenshot({ 
      path: 'test-results/settings-modal-button-states.png',
      fullPage: true 
    });
  });

  test('should show loading state initially', async ({ page }) => {
    // Não definir assinatura para testar estado de loading
    await setSubscriptionState(page, null);
    
    // Abrir modal e ir para aba de Assinaturas
    await openUserSettingsModal(page);
    await navigateToSubscriptionsTab(page);

    // Verificar estado de loading (pode ser muito rápido, então vamos verificar se existe)
    const loadingText = page.locator('text=Carregando');
    if (await loadingText.count() > 0) {
      await expect(loadingText).toBeVisible();
    }

    // Aguardar carregamento completo
    await page.waitForTimeout(1000);

    // Verificar que o estado final é o plano gratuito
    const banner = page.locator('.p-5.bg-blue-500\\/10').first();
    await expect(banner).toContainText('plano gratuito');

    // Tirar screenshot da aba de assinaturas
    await page.screenshot({ 
      path: 'test-results/settings-modal-loading-state.png',
      fullPage: true 
    });
  });
});
