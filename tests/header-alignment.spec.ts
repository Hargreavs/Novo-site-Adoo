import { test, expect } from '@playwright/test';

test.describe('Header Alignment Test', () => {
  test('should have left-aligned headers on desktop and centered on mobile', async ({ page, browserName }) => {
    // Só executar no Chromium
    test.skip(browserName !== 'chromium', 'Skipping non-chromium browsers');

    // Testar página Diários Oficiais
    await page.goto('/diarios-oficiais');
    await page.waitForLoadState('networkidle');

    // Verificar se o header está centralizado no mobile (viewport pequeno)
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.reload();
    await page.waitForLoadState('networkidle');

    const mobileHeader = page.locator('h1:has-text("Diários Oficiais")').first();
    await expect(mobileHeader).toBeVisible();
    
    // No mobile, deve estar centralizado
    const mobileHeaderStyles = await mobileHeader.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el.parentElement!);
      return {
        textAlign: computedStyle.textAlign
      };
    });
    
    expect(mobileHeaderStyles.textAlign).toBe('center');

    // Verificar se o header está alinhado à esquerda no desktop
    await page.setViewportSize({ width: 1200, height: 800 }); // Desktop
    await page.reload();
    await page.waitForLoadState('networkidle');

    const desktopHeader = page.locator('h1:has-text("Diários Oficiais")').first();
    await expect(desktopHeader).toBeVisible();
    
    // No desktop, deve estar alinhado à esquerda
    const desktopHeaderStyles = await desktopHeader.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el.parentElement!);
      return {
        textAlign: computedStyle.textAlign
      };
    });
    
    expect(desktopHeaderStyles.textAlign).toBe('left');

    console.log('✅ Diários Oficiais: Alinhamento correto no mobile e desktop');
  });

  test('should have left-aligned headers on Radar IA page', async ({ page, browserName }) => {
    // Só executar no Chromium
    test.skip(browserName !== 'chromium', 'Skipping non-chromium browsers');

    // Testar página Radar IA
    await page.goto('/radar-ia');
    await page.waitForLoadState('networkidle');

    // Verificar no desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    const desktopHeader = page.locator('h1:has-text("Radar IA")').first();
    await expect(desktopHeader).toBeVisible();
    
    const desktopHeaderStyles = await desktopHeader.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el.parentElement!);
      return {
        textAlign: computedStyle.textAlign
      };
    });
    
    expect(desktopHeaderStyles.textAlign).toBe('left');

    console.log('✅ Radar IA: Alinhamento correto no desktop');
  });

  test('should have left-aligned headers on Explorar page', async ({ page, browserName }) => {
    // Só executar no Chromium
    test.skip(browserName !== 'chromium', 'Skipping non-chromium browsers');

    // Testar página Explorar
    await page.goto('/explorar');
    await page.waitForLoadState('networkidle');

    // Verificar no desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    const desktopHeader = page.locator('h1:has-text("Explorar")').first();
    await expect(desktopHeader).toBeVisible();
    
    const desktopHeaderStyles = await desktopHeader.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el.parentElement!);
      return {
        textAlign: computedStyle.textAlign
      };
    });
    
    expect(desktopHeaderStyles.textAlign).toBe('left');

    console.log('✅ Explorar: Alinhamento correto no desktop');
  });

  test('should have reduced spacing between title and subtitle', async ({ page, browserName }) => {
    // Só executar no Chromium
    test.skip(browserName !== 'chromium', 'Skipping non-chromium browsers');

    // Testar página Diários Oficiais
    await page.goto('/diarios-oficiais');
    await page.waitForLoadState('networkidle');

    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    const subtitle = page.locator('p:has-text("Pesquise publicações")').first();
    await expect(subtitle).toBeVisible();
    
    // Verificar se o margin-top é menor (mt-2 ao invés de mt-3 ou mt-4)
    const subtitleStyles = await subtitle.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        marginTop: computedStyle.marginTop
      };
    });
    
    // mt-2 corresponde a 0.5rem = 8px
    expect(subtitleStyles.marginTop).toBe('8px');

    console.log('✅ Espaçamento reduzido entre título e subtítulo');
  });
});
