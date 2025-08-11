const { test, expect } = require('@playwright/test');

/**
 * Tests E2E para el flujo de autenticación - Registro
 */
test.describe('Autenticación - Registro', () => {
  test('debería mostrar la página de registro correctamente', async ({ page }) => {
    // Navegar a la página de registro
    await page.goto('/auth/registro');
    
    // Verificar elementos de la página
    await expect(page.locator('h1')).toContainText('Registro');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('select[name="role"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Verificar que el select tiene las opciones correctas
    await expect(page.locator('select[name="role"]')).toHaveValue('athlete');
    
    // Verificar enlace de login (usar el del formulario)
    await expect(page.getByRole('link', { name: /inicia sesión/i })).toBeVisible();
  });

  test('debería permitir registro con datos válidos', async ({ page }) => {
    // Navegar a la página de registro
    await page.goto('/auth/registro');
    
    // Llenar formulario con datos válidos
    const testEmail = `test-${Date.now()}@example.com`;
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.selectOption('select[name="role"]', 'athlete');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar redirección exitosa
    await expect(page).toHaveURL('/');
  });

  test('debería mostrar error con campos vacíos', async ({ page }) => {
    // Navegar a la página de registro
    await page.goto('/auth/registro');
    
    // Intentar enviar formulario vacío
    await page.click('button[type="submit"]');
    
    // Con validación HTML5, el formulario no se envía si los campos están vacíos
    // Verificar que el formulario sigue visible y no se envió
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    
    // Verificar que los campos están marcados como inválidos por el navegador
    await expect(page.locator('input[name="email"]')).toHaveAttribute('required');
    await expect(page.locator('input[name="password"]')).toHaveAttribute('required');
  });

  test('debería validar campos requeridos', async ({ page }) => {
    // Navegar a la página de registro
    await page.goto('/auth/registro');
    
    // Verificar que los campos están marcados como requeridos
    await expect(page.locator('input[name="email"]')).toHaveAttribute('required');
    await expect(page.locator('input[name="password"]')).toHaveAttribute('required');
  });

  test('debería permitir navegar a login', async ({ page }) => {
    // Navegar a la página de registro
    await page.goto('/auth/registro');
    
    // Esperar a que la página esté completamente cargada
    await page.waitForLoadState('networkidle');
    
    // Buscar el enlace de login de forma más robusta
    const loginLink = page.getByRole('link', { name: /inicia sesión/i });
    
    // Esperar a que el enlace sea visible y clickeable
    await loginLink.waitFor({ state: 'visible', timeout: 10000 });
    
    // Hacer clic en el enlace
    await loginLink.click();
    
    // Verificar redirección
    await expect(page).toHaveURL('/auth/login');
  });

  test('debería permitir cambiar tipo de cuenta', async ({ page }) => {
    // Navegar a la página de registro
    await page.goto('/auth/registro');
    
    // Verificar que el valor por defecto es 'athlete'
    await expect(page.locator('select[name="role"]')).toHaveValue('athlete');
    
    // Cambiar a 'gym'
    await page.selectOption('select[name="role"]', 'gym');
    await expect(page.locator('select[name="role"]')).toHaveValue('gym');
    
    // Cambiar de vuelta a 'athlete'
    await page.selectOption('select[name="role"]', 'athlete');
    await expect(page.locator('select[name="role"]')).toHaveValue('athlete');
  });
});
