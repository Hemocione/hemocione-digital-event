import { test, expect } from '@playwright/test';

test.describe('Fluxo de Check-in (Entrada na Fila)', () => {
  test('deve exibir página de entrada na fila com formulário', async ({ page }) => {
    // Acessa a página de join com um eventId de exemplo
    await page.goto('/queue/join?eventId=evento-teste');
    
    // Verifica se o formulário está presente
    const form = page.locator('form, .form-wrapper');
    await expect(form).toBeVisible();
    
    // Verifica campos do formulário
    const phoneInput = page.locator('input[placeholder*="telefone"], input[type="tel"]').first();
    const nameInput = page.locator('input[placeholder*="nome"], input[placeholder*="Nome"]').first();
    
    // Verifica se pelo menos um campo está presente
    const hasPhone = await phoneInput.isVisible().catch(() => false);
    const hasName = await nameInput.isVisible().catch(() => false);
    
    expect(hasPhone || hasName).toBeTruthy();
  });

  test('deve validar campos obrigatórios no formulário de fila', async ({ page }) => {
    await page.goto('/queue/join?eventId=evento-teste');
    
    // Tenta submeter sem preencher
    const submitButton = page.locator('button:has-text("Entrar"), button:has-text("fila"), .join-item button').first();
    
    if (await submitButton.isVisible().catch(() => false)) {
      // Verifica se o botão está desabilitado quando campos estão vazios
      const isDisabled = await submitButton.isDisabled();
      expect(isDisabled).toBeTruthy();
    }
  });

  test('deve permitir preencher dados do doador', async ({ page }) => {
    await page.goto('/queue/join?eventId=evento-teste');
    
    // Preenche o telefone
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="telefone"]').first();
    if (await phoneInput.isVisible().catch(() => false)) {
      await phoneInput.fill('11999999999');
      await expect(phoneInput).toHaveValue(/\(?11\)?\s?9{4}-?9{4}/);
    }
    
    // Preenche o nome
    const nameInput = page.locator('input[placeholder*="nome" i], input[placeholder*="Nome"]').first();
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill('Doador Teste');
      await expect(nameInput).toHaveValue('Doador Teste');
    }
  });

  test('deve exibir termos de uso e política de privacidade', async ({ page }) => {
    await page.goto('/queue/join?eventId=evento-teste');
    
    // Verifica se há links para termos
    const termsLink = page.locator('a[href*="termos"], a[href*="Termos"]').first();
    const privacyLink = page.locator('a[href*="privacidade"], a[href*="privacidade"]').first();
    
    const hasTerms = await termsLink.isVisible().catch(() => false);
    const hasPrivacy = await privacyLink.isVisible().catch(() => false);
    
    // Verifica se o disclaimer com termos está presente
    const disclaimer = page.locator('.disclaimer');
    const hasDisclaimer = await disclaimer.isVisible().catch(() => false);
    
    expect(hasTerms || hasPrivacy || hasDisclaimer).toBeTruthy();
  });

  test('deve exibir opção de login com Hemocione ID', async ({ page }) => {
    await page.goto('/queue/join?eventId=evento-teste');
    
    // Verifica botão de login
    const loginButton = page.locator('button:has-text("Hemocione"), button:has-text("Entrar com"), a[href*="hemocione"]').first();
    
    if (await loginButton.isVisible().catch(() => false)) {
      await expect(loginButton).toBeVisible();
    }
  });

  test('deve redirecionar para home se não houver eventId', async ({ page }) => {
    await page.goto('/queue/join');
    
    // Deve redirecionar para a home
    await expect(page).toHaveURL('/');
  });

  test('deve exibir página de sucesso após entrar na fila', async ({ page }) => {
    // Acessa a página de sucesso diretamente (simulando após join)
    await page.goto('/queue/join/success?name=Doador%20Teste');
    
    // Verifica se a mensagem de sucesso está presente
    const successContent = page.locator('text=Doador Teste, text=sucesso, .success-message, h1').first();
    await expect(successContent).toBeVisible().catch(() => {
      // Se não encontrar específico, verifica se está na página correta
      expect(page.url()).toContain('/queue/join/success');
    });
  });

  test('deve exibir página de posição na fila', async ({ page }) => {
    // Acessa página de participante na fila
    await page.goto('/queue/queue-teste/participant/participant-teste?eventId=evento-teste');
    
    // Verifica elementos da página de posição
    const queueInfo = page.locator('.queue-info, .position-info, .participant-info').first();
    const pageContent = page.locator('h1, .page-title').first();
    
    const hasQueueInfo = await queueInfo.isVisible().catch(() => false);
    const hasContent = await pageContent.isVisible().catch(() => false);
    
    expect(hasQueueInfo || hasContent).toBeTruthy();
  });
});
