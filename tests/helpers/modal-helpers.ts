import { Page } from '@playwright/test';

export async function openUserSettingsModal(page: Page) {
  // Simular login se necessário
  await page.evaluate(() => {
    const currentUser = localStorage.getItem('auth.user');
    if (!currentUser) {
      localStorage.setItem('auth.user', JSON.stringify({
        id: '1',
        name: 'Usuário Teste',
        email: 'teste@exemplo.com'
      }));
    }
  });

  // Aguardar a página recarregar com o usuário logado
  await page.waitForTimeout(1000);
  
  // Recarregar a página para aplicar o estado de login
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Procurar pelo botão do usuário que contém o nome (não apenas o avatar)
  const userButton = page.locator('button:has-text("Usuário Teste"), button[aria-expanded][aria-haspopup="menu"]').first();
  
  if (await userButton.count() === 0) {
    // Fallback: procurar por qualquer botão que tenha aria-haspopup="menu"
    const menuButtons = page.locator('button[aria-haspopup="menu"]');
    if (await menuButtons.count() > 0) {
      await menuButtons.first().click();
    } else {
      throw new Error('Não foi possível encontrar o botão do menu do usuário');
    }
  } else {
    await userButton.click();
  }
  
  // Aguardar o menu do usuário aparecer
  await page.waitForSelector('button:has-text("Minha conta")', { timeout: 5000 });
  
  // Clicar no botão de configurações
  const settingsButton = page.locator('button:has-text("Minha conta")').first();
  await settingsButton.click();

  // Aguardar o modal aparecer
  await page.waitForSelector('[data-testid="settings-modal"], .fixed.inset-0', { timeout: 5000 });
}

export async function setSubscriptionState(page: Page, subscription: any) {
  await page.evaluate((sub) => {
    if (sub) {
      localStorage.setItem('cjo.subscription', JSON.stringify(sub));
    } else {
      localStorage.removeItem('cjo.subscription');
    }
    // Disparar evento para atualizar o hook
    window.dispatchEvent(new Event('subscription:updated'));
  }, subscription);
}

export async function navigateToSubscriptionsTab(page: Page) {
  // Ir para a aba de Assinaturas
  await page.click('button:has-text("Assinaturas")');
  await page.waitForTimeout(1000); // Aguardar carregamento do hook
}
