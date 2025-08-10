const { test, expect } = require('@playwright/test');

/**
 * Tests básicos de verificación de salud del sistema
 */
test.describe('Verificación de Salud del Sistema', () => {
  test('debería cargar la página principal del frontend', async ({ page }) => {
    // Navegar a la página principal
    await page.goto('/');
    
    // Verificar que la página cargue correctamente
    await expect(page).toHaveTitle(/CompeteZone/);
    
    // Verificar que algunos elementos básicos estén presentes
    await expect(page.locator('body')).toBeVisible();
    
    // Verificar que el contenido principal esté presente
    await expect(page.locator('#root')).toBeVisible();
    
    console.log('✅ Frontend cargado correctamente');
  });

  test('debería mostrar la página de login', async ({ page }) => {
    // Navegar a la página de login
    await page.goto('/auth/login');
    
    // Verificar que la página de login esté disponible
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Iniciar sesión');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    console.log('✅ Página de login accesible');
  });

  test('debería mostrar la página de registro', async ({ page }) => {
    // Navegar a la página de registro
    await page.goto('/auth/registro');
    
    // Verificar que la página de registro esté disponible
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Registro');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('select[name="role"]')).toBeVisible();
    
    console.log('✅ Página de registro accesible');
  });

  test('debería permitir navegación entre páginas de auth', async ({ page }) => {
    // Ir a login
    await page.goto('/auth/login');
    await expect(page.locator('h1')).toContainText('Iniciar sesión');
    
    // Navegar a registro - usar el enlace del formulario (no el del header)
    const registroLink = page.getByRole('link', { name: 'Regístrate' });
    await registroLink.scrollIntoViewIfNeeded();
    await registroLink.waitFor({ state: 'visible' });
    await registroLink.click();
    
    await expect(page).toHaveURL('/auth/registro');
    await expect(page.locator('h1')).toContainText('Registro');
    
    // Navegar de vuelta a login (usar el del formulario)
    const loginLink = page.getByRole('link', { name: 'Inicia sesión' });
    await loginLink.scrollIntoViewIfNeeded();
    await loginLink.waitFor({ state: 'visible' });
    await loginLink.click();
    
    await expect(page).toHaveURL('/auth/login');
    await expect(page.locator('h1')).toContainText('Iniciar sesión');
    
    console.log('✅ Navegación entre páginas de auth funcionando');
  });

  test('debería mostrar usuarios de desarrollo en modo dev', async ({ page }) => {
    // Navegar a la página de login
    await page.goto('/auth/login');
    
    // Verificar que se muestra el panel de usuarios de desarrollo
    await expect(page.locator('.bg-blue-50')).toBeVisible();
    await expect(page.locator('text=Usuarios de desarrollo')).toBeVisible();
    
    console.log('✅ Panel de usuarios de desarrollo visible');
  });
});
