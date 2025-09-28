import { test, expect } from '@playwright/test';

test.describe('Sync Test - Subscription State', () => {
  test('should sync subscription state between systems', async ({ page, browserName }) => {
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

    // 1. Verificar estado inicial (deve ser gratuito)
    const initialCjoSub = await page.evaluate(() => localStorage.getItem('cjo.subscription'));
    const initialCurrentPlan = await page.evaluate(() => localStorage.getItem('current_plan'));
    
    console.log('Estado inicial:');
    console.log('cjo.subscription:', initialCjoSub);
    console.log('current_plan:', initialCurrentPlan);

    // 2. Simular assinatura básica ativa
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

    // Aguardar um pouco para a sincronização
    await page.waitForTimeout(1000);

    // 3. Verificar se ambos os sistemas foram atualizados
    const updatedCjoSub = await page.evaluate(() => localStorage.getItem('cjo.subscription'));
    const updatedCurrentPlan = await page.evaluate(() => localStorage.getItem('current_plan'));
    
    console.log('Após simular assinatura básica:');
    console.log('cjo.subscription:', updatedCjoSub);
    console.log('current_plan:', updatedCurrentPlan);

    // Verificar se o current_plan foi sincronizado
    expect(updatedCurrentPlan).toBe('Básico');

    // 4. Verificar na página de pagamentos
    await page.goto('/pagamentos');
    await page.waitForLoadState('networkidle');

    // Verificar se a página mostra o plano básico
    const planText = await page.textContent('h2:has-text("Básico")');
    expect(planText).toContain('Básico');

    // 5. Verificar no modal de configurações
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
    
    await page.screenshot({ path: 'test-results/sync-test-basic.png', fullPage: true });
    
    console.log('✅ Sincronização entre sistemas funcionando!');
  });
});
