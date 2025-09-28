import { test, expect } from '@playwright/test';

test.describe('Real World Sync Test', () => {
  test('should verify modal shows correct plan after subscription', async ({ page, browserName }) => {
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

    // 1. Abrir modal primeiro
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

    // 2. Verificar estado inicial (deve ser gratuito)
    const initialBanner = page.locator('.p-5.bg-blue-500\\/10').first();
    await expect(initialBanner).toBeVisible();
    await expect(initialBanner).toContainText('plano gratuito');
    
    await page.screenshot({ path: 'test-results/real-world-initial.png', fullPage: true });
    console.log('✅ Estado inicial: plano gratuito');

    // 3. Simular assinatura básica (como se fosse da página de pagamentos)
    await page.evaluate(() => {
      // Salvar no sistema cjo.subscription
      localStorage.setItem('cjo.subscription', JSON.stringify({
        planId: 'basic',
        cycle: 'monthly',
        status: 'active',
        nextRenewalISO: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        firstChargeAmountCents: 2392, // R$ 23,92
        updatedAtISO: new Date().toISOString(),
      }));
      
      // Disparar evento para atualizar o hook
      window.dispatchEvent(new Event('subscription:updated'));
      
      // Salvar no sistema current_plan
      localStorage.setItem('current_plan', 'Básico');
    });

    // 4. Aguardar atualização do modal
    await page.waitForTimeout(2000);

    // 5. Verificar se o modal foi atualizado
    const updatedBanner = page.locator('.p-5.bg-blue-500\\/10').first();
    await expect(updatedBanner).toBeVisible();
    
    // Verificar se o texto mudou para plano básico
    const bannerText = await updatedBanner.textContent();
    console.log('Texto do banner após atualização:', bannerText);
    
    // O banner deve conter "plano básico mensal"
    await expect(updatedBanner).toContainText('plano básico mensal');
    
    // Verificar botão do plano básico
    const basicButton = page.locator('button:has-text("Seu plano")').first();
    await expect(basicButton).toBeVisible();
    await expect(basicButton).toBeDisabled();
    await expect(basicButton).toContainText('Mensal');
    
    await page.screenshot({ path: 'test-results/real-world-updated.png', fullPage: true });
    
    console.log('✅ Modal atualizado corretamente para plano básico!');
  });
});
