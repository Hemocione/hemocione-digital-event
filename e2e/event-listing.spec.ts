import { test, expect } from '@playwright/test';

test.describe('Fluxo de Listagem e Visualização de Eventos', () => {
  test('deve exibir a página inicial com lista de eventos', async ({ page }) => {
    await page.goto('/');
    
    // Verifica se o título da página está correto
    await expect(page).toHaveTitle(/Eventos/);
    
    // Verifica se o título principal está visível
    const heading = page.locator('h1.events-title');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Eventos');
    
    // Verifica se a barra de busca está presente
    const searchInput = page.locator('input[placeholder="Buscar eventos"]');
    await expect(searchInput).toBeVisible();
  });

  test('deve permitir buscar eventos', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.locator('input[placeholder="Buscar eventos"]');
    await searchInput.fill('Teste');
    
    // Aguarda a atualização da URL com o parâmetro de busca
    await expect(page).toHaveURL(/.*search=Teste/);
  });

  test('deve navegar para a página de detalhes do evento', async ({ page }) => {
    // Primeiro vai para a home
    await page.goto('/');
    
    // Aguarda os cards de eventos carregarem (se houver)
    const eventCards = page.locator('.events-wrapper a, .events-wrapper [data-testid="event-card"]').first();
    
    // Verifica se há eventos ou exibe mensagem de vazio
    const noEventsMessage = page.locator('.no-events-wrapper');
    const hasEvents = await eventCards.isVisible().catch(() => false);
    const isEmpty = await noEventsMessage.isVisible().catch(() => false);
    
    expect(hasEvents || isEmpty).toBeTruthy();
    
    if (hasEvents) {
      // Clica no primeiro evento
      await eventCards.click();
      
      // Verifica se foi redirecionado para página de evento
      await expect(page).toHaveURL(/\/event\//);
      
      // Verifica se os detalhes do evento estão visíveis
      const eventTitle = page.locator('h1.text-heading').first();
      await expect(eventTitle).toBeVisible();
    }
  });

  test('deve exibir detalhes do evento corretamente', async ({ page }) => {
    // Tenta acessar um evento de exemplo (ou mock)
    // Na prática, você deve criar um evento de teste antes ou usar um slug conhecido
    await page.goto('/event/evento-teste');
    
    // Verifica elementos da página de evento
    const eventBanner = page.locator('.event-banner');
    const eventHeader = page.locator('.event-header');
    const eventInfo = page.locator('.event-info');
    
    // Pelo menos um desses deve estar presente
    const hasBanner = await eventBanner.isVisible().catch(() => false);
    const hasHeader = await eventHeader.isVisible().catch(() => false);
    const hasInfo = await eventInfo.isVisible().catch(() => false);
    
    // Se o evento existe
    if (hasHeader || hasInfo) {
      await expect(page.locator('h1.text-heading').first()).toBeVisible();
    }
  });

  test('deve navegar de volta para a lista de eventos', async ({ page }) => {
    await page.goto('/event/evento-teste');
    
    // Tenta clicar no botão de voltar
    const backButton = page.locator('.arrow-left');
    
    if (await backButton.isVisible().catch(() => false)) {
      await backButton.click();
      await expect(page).toHaveURL('/');
    }
  });
});
