const { test, expect } = require('@playwright/test');

/**
 * Tests E2E para verificar acceso y permisos en la creación de eventos
 */
test.describe('Creación de Eventos - Acceso y Permisos', () => {
  
  test('debería redirigir a login cuando usuario no autenticado intenta acceder', async ({ page }) => {
    // Intentar acceder directamente a la página de crear evento
    await page.goto('/crear-evento');
    
    // Verificar que redirige a login
    await expect(page).toHaveURL(/.*\/auth\/login/);
    
    // Verificar que se muestra mensaje de login requerido
    await expect(page.locator('h1')).toContainText('Iniciar sesión');
  });

  test('debería mostrar error de permisos cuando atleta autenticado intenta acceder', async ({ page }) => {
    // Login como atleta
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'atleta@dev.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Esperar a que se complete el login
    await page.waitForURL('/');
    
    // Intentar acceder a crear evento
    await page.goto('/crear-evento');
    
    // Verificar que se muestra error de permisos
    await expect(page.locator('body')).toContainText('Acceso restringido');
  });

  test('debería permitir acceso cuando gimnasio autenticado accede', async ({ page }) => {
    // Login como gimnasio
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'gimnasio@dev.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Esperar a que se complete el login
    await page.waitForURL('/');
    
    // Navegar a crear evento
    await page.goto('/crear-evento');
    
    // Verificar que se muestra el formulario de creación
    const createEventHeading = page.locator('h1', { hasText: 'Crear evento' });
    await expect(createEventHeading).toBeVisible();
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="nombre"]')).toBeVisible();
  });

  test('debería permitir acceso cuando admin autenticado accede', async ({ page }) => {
    // Login como admin
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@dev.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Esperar a que se complete el login
    await page.waitForURL('/');
    
    // Navegar a crear evento
    await page.goto('/crear-evento');
    
    // Verificar que se muestra el formulario de creación
    const createEventHeading = page.locator('h1', { hasText: 'Crear evento' });
    await expect(createEventHeading).toBeVisible();
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="nombre"]')).toBeVisible();
  });

  test('debería mostrar botón "Crear evento" solo para usuarios autorizados en lista de eventos', async ({ page }) => {
    // Sin login - verificar que NO aparece el botón
    await page.goto('/eventos');
    const createEventLink = page.locator('main').getByRole('link', { name: 'Crear evento' });
    await expect(createEventLink).not.toBeVisible();
    
    // Login como gimnasio
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'gimnasio@dev.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Verificar que SÍ aparece el botón
    await page.goto('/eventos');
    await expect(createEventLink).toBeVisible();
  });

  test('debería mantener sesión al navegar entre páginas', async ({ page }) => {
    // Login como gimnasio
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'gimnasio@dev.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Navegar a eventos
    await page.goto('/eventos');
    const createEventLink = page.locator('main').getByRole('link', { name: 'Crear evento' });
    await expect(createEventLink).toBeVisible();
    
    // Navegar a crear evento
    await createEventLink.click();
    await expect(page).toHaveURL('/crear-evento');
    await expect(page.locator('h1')).toContainText('Crear evento');
    
    // Volver a eventos
    await page.goto('/eventos');
    await expect(createEventLink).toBeVisible();
  });

  test('debería manejar logout correctamente', async ({ page }) => {
    // Login como gimnasio
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'gimnasio@dev.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Verificar que puede acceder a crear evento
    await page.goto('/crear-evento');
    await expect(page.locator('h1')).toContainText('Crear evento');
    
    // Hacer logout (asumiendo que hay un botón de logout en el header)
    await page
      .getByRole('button', { name: /GO|Gym Owner Test|Gimnasio/i })
      .first()
      .click();
    await page.getByRole('button', { name: /Cerrar sesión/ }).click();
    
    // Verificar que ya no puede acceder
    await page.goto('/crear-evento');
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });
});
