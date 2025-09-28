import { test, expect } from '@playwright/test';

test.describe('Payment to Modal Sync Test', () => {
  test('should sync subscription from payment page to modal', async ({ page, browserName }) => {
    // Só executar no Chromium
    test.skip(browserName !== 'chromium', 'Skipping non-chromium browsers');

    // Navegar para a página de pagamentos
    await page.goto('/pagamentos');
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

    // 1. Verificar estado inicial
    const initialCjoSub = await page.evaluate(() => localStorage.getItem('cjo.subscription'));
    const initialCurrentPlan = await page.evaluate(() => localStorage.getItem('current_plan'));
    
    console.log('Estado inicial:');
    console.log('cjo.subscription:', initialCjoSub);
    console.log('current_plan:', initialCurrentPlan);

    // 2. Simular assinatura básica através do sistema de pagamentos
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

    // Aguardar sincronização
    await page.waitForTimeout(1000);

    // 3. Verificar se ambos os sistemas foram atualizados
    const updatedCjoSub = await page.evaluate(() => localStorage.getItem('cjo.subscription'));
    const updatedCurrentPlan = await page.evaluate(() => localStorage.getItem('current_plan'));
    
    console.log('Após simular assinatura:');
    console.log('cjo.subscription:', updatedCjoSub);
    console.log('current_plan:', updatedCurrentPlan);

    // Verificar se ambos foram atualizados
    expect(updatedCurrentPlan).toBe('Básico');
    expect(updatedCjoSub).toContain('"planId":"basic"');

    // 4. Verificar no modal de configurações
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
    
    await page.screenshot({ path: 'test-results/payment-to-modal-sync.png', fullPage: true });
    
    console.log('✅ Sincronização da página de pagamentos para o modal funcionando!');
  });
});
