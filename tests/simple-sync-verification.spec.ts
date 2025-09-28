import { test, expect } from '@playwright/test';

test.describe('Simple Sync Verification', () => {
  test('should verify sync between cjo.subscription and current_plan', async ({ page, browserName }) => {
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

    // 1. Simular assinatura básica ativa
    await page.evaluate(() => {
      localStorage.setItem('cjo.subscription', JSON.stringify({
        planId: 'basic',
        cycle: 'monthly',
        status: 'active',
        nextRenewalISO: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAtISO: new Date().toISOString()
      }));
      
      // Disparar evento para atualizar o hook
      window.dispatchEvent(new Event('subscription:updated'));
    });

    // Aguardar sincronização
    await page.waitForTimeout(1000);

    // 2. Verificar se ambos os sistemas foram atualizados
    const cjoSub = await page.evaluate(() => localStorage.getItem('cjo.subscription'));
    const currentPlan = await page.evaluate(() => localStorage.getItem('current_plan'));
    
    console.log('Verificação de sincronização:');
    console.log('cjo.subscription:', cjoSub);
    console.log('current_plan:', currentPlan);

    // Verificar se o current_plan foi sincronizado
    expect(currentPlan).toBe('Básico');

    // 3. Verificar no modal de configurações
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
    
    // Verificar se o modal mostra o plano básico
    const banner = page.locator('.p-5.bg-blue-500\\/10').first();
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('plano básico mensal');
    
    // Verificar botão do plano básico
    const basicButton = page.locator('button:has-text("Seu plano")').first();
    await expect(basicButton).toBeVisible();
    await expect(basicButton).toBeDisabled();
    await expect(basicButton).toContainText('Mensal');
    
    await page.screenshot({ path: 'test-results/sync-verification-basic.png', fullPage: true });
    
    console.log('✅ Sincronização funcionando! Modal mostra plano básico corretamente.');
  });

  test('should verify sync for premium plan', async ({ page, browserName }) => {
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

    // 1. Simular assinatura premium anual ativa
    await page.evaluate(() => {
      localStorage.setItem('cjo.subscription', JSON.stringify({
        planId: 'premium',
        cycle: 'annual',
        status: 'active',
        nextRenewalISO: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAtISO: new Date().toISOString()
      }));
      
      // Disparar evento para atualizar o hook
      window.dispatchEvent(new Event('subscription:updated'));
    });

    // Aguardar sincronização
    await page.waitForTimeout(1000);

    // 2. Verificar se ambos os sistemas foram atualizados
    const cjoSub = await page.evaluate(() => localStorage.getItem('cjo.subscription'));
    const currentPlan = await page.evaluate(() => localStorage.getItem('current_plan'));
    
    console.log('Verificação de sincronização (Premium):');
    console.log('cjo.subscription:', cjoSub);
    console.log('current_plan:', currentPlan);

    // Verificar se o current_plan foi sincronizado
    expect(currentPlan).toBe('Premium');

    // 3. Verificar no modal de configurações
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
    
    // Verificar se o modal mostra o plano premium
    const banner = page.locator('.p-5.bg-blue-500\\/10').first();
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('plano premium anual');
    
    // Verificar botão do plano premium
    const premiumButton = page.locator('button:has-text("Seu plano")').first();
    await expect(premiumButton).toBeVisible();
    await expect(premiumButton).toBeDisabled();
    await expect(premiumButton).toContainText('Anual');
    
    await page.screenshot({ path: 'test-results/sync-verification-premium.png', fullPage: true });
    
    console.log('✅ Sincronização funcionando! Modal mostra plano premium corretamente.');
  });
});
