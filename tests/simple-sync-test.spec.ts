import { test, expect } from '@playwright/test';

test.describe('Simple Sync Test', () => {
  test('should test subscription sync - free plan', async ({ page, browserName }) => {
    // Só executar no Chromium
    test.skip(browserName !== 'chromium', 'Skipping non-chromium browsers');

    // Navegar para a página principal
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Simular login
    await page.evaluate(() => {
      localStorage.setItem('auth.user', JSON.stringify({
        id: '1',
        name: 'Usuário Teste',
        email: 'teste@exemplo.com'
      }));
    });

    // Recarregar para aplicar o login
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Abrir modal
    const userButton = page.locator('button[aria-haspopup="menu"]').first();
    await userButton.click();
    await page.waitForTimeout(500);
    
    const configButton = page.locator('button:has-text("Minha conta")').first();
    await configButton.click();
    await page.waitForTimeout(500);
    
    // Aguardar o modal aparecer
    await page.waitForSelector('.fixed.inset-0', { timeout: 5000 });

    // Ir para aba de Assinaturas
    await page.click('button:has-text("Assinaturas")');
    await page.waitForTimeout(1000);
    
    // Verificar banner do plano gratuito
    const banner = page.locator('.p-5.bg-blue-500\\/10').first();
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('plano gratuito');
    
    // Verificar botão do plano gratuito
    const freeButton = page.locator('button:has-text("Plano Atual")').first();
    await expect(freeButton).toBeVisible();
    await expect(freeButton).toBeDisabled();
    
    await page.screenshot({ path: 'test-results/sync-free-plan.png', fullPage: true });
    
    console.log('✅ Teste do plano gratuito passou!');
  });

  test('should test subscription sync - basic plan', async ({ page, browserName }) => {
    // Só executar no Chromium
    test.skip(browserName !== 'chromium', 'Skipping non-chromium browsers');

    // Navegar para a página principal
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Simular login
    await page.evaluate(() => {
      localStorage.setItem('auth.user', JSON.stringify({
        id: '1',
        name: 'Usuário Teste',
        email: 'teste@exemplo.com'
      }));
      
      // Simular assinatura básica mensal
      localStorage.setItem('cjo.subscription', JSON.stringify({
        planId: 'basic',
        cycle: 'monthly',
        status: 'active',
        nextRenewalISO: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAtISO: new Date().toISOString()
      }));
    });

    // Recarregar para aplicar o login
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Abrir modal
    const userButton = page.locator('button[aria-haspopup="menu"]').first();
    await userButton.click();
    await page.waitForTimeout(500);
    
    const configButton = page.locator('button:has-text("Minha conta")').first();
    await configButton.click();
    await page.waitForTimeout(500);
    
    // Aguardar o modal aparecer
    await page.waitForSelector('.fixed.inset-0', { timeout: 5000 });

    // Ir para aba de Assinaturas
    await page.click('button:has-text("Assinaturas")');
    await page.waitForTimeout(1000);
    
    // Verificar banner do plano básico
    const banner = page.locator('.p-5.bg-blue-500\\/10').first();
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('plano básico mensal');
    
    // Verificar botão do plano básico
    const basicButton = page.locator('button:has-text("Seu plano")').first();
    await expect(basicButton).toBeVisible();
    await expect(basicButton).toBeDisabled();
    await expect(basicButton).toContainText('Mensal');
    
    await page.screenshot({ path: 'test-results/sync-basic-plan.png', fullPage: true });
    
    console.log('✅ Teste do plano básico passou!');
  });

  test('should test subscription sync - premium plan', async ({ page, browserName }) => {
    // Só executar no Chromium
    test.skip(browserName !== 'chromium', 'Skipping non-chromium browsers');

    // Navegar para a página principal
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Simular login
    await page.evaluate(() => {
      localStorage.setItem('auth.user', JSON.stringify({
        id: '1',
        name: 'Usuário Teste',
        email: 'teste@exemplo.com'
      }));
      
      // Simular assinatura premium anual
      localStorage.setItem('cjo.subscription', JSON.stringify({
        planId: 'premium',
        cycle: 'annual',
        status: 'active',
        nextRenewalISO: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAtISO: new Date().toISOString()
      }));
    });

    // Recarregar para aplicar o login
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Abrir modal
    const userButton = page.locator('button[aria-haspopup="menu"]').first();
    await userButton.click();
    await page.waitForTimeout(500);
    
    const configButton = page.locator('button:has-text("Minha conta")').first();
    await configButton.click();
    await page.waitForTimeout(500);
    
    // Aguardar o modal aparecer
    await page.waitForSelector('.fixed.inset-0', { timeout: 5000 });

    // Ir para aba de Assinaturas
    await page.click('button:has-text("Assinaturas")');
    await page.waitForTimeout(1000);
    
    // Verificar banner do plano premium
    const banner = page.locator('.p-5.bg-blue-500\\/10').first();
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('plano premium anual');
    
    // Verificar botão do plano premium
    const premiumButton = page.locator('button:has-text("Seu plano")').first();
    await expect(premiumButton).toBeVisible();
    await expect(premiumButton).toBeDisabled();
    await expect(premiumButton).toContainText('Anual');
    
    await page.screenshot({ path: 'test-results/sync-premium-plan.png', fullPage: true });
    
    console.log('✅ Teste do plano premium passou!');
  });
});
