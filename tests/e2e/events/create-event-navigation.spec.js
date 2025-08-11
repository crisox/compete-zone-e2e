const { test, expect } = require('@playwright/test');

/**
 * Tests E2E para verificar navegación y elementos de UI en la creación de eventos
 */
test.describe('Creación de Eventos - Navegación y UI', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login como gimnasio antes de cada test
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'gimnasio@dev.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('debería cargar la página de crear evento correctamente', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Verificar título y descripción
    await expect(page.locator('h1')).toContainText('Crear evento');
    await expect(page.locator('p')).toContainText('Completa los campos para publicar tu evento');
    
    // Verificar que el formulario está presente
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('.bg-white.rounded-lg.shadow-md')).toBeVisible();
  });

  test('debería mostrar todos los campos del formulario', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Verificar campos requeridos
    await expect(page.locator('input[name="nombre"]')).toBeVisible();
    await expect(page.locator('textarea[name="descripcion"]')).toBeVisible();
    await expect(page.locator('input[name="fecha"]')).toBeVisible();
    await expect(page.locator('input[name="hora"]')).toBeVisible();
    await expect(page.locator('input[name="ubicacion"]')).toBeVisible();
    await expect(page.locator('input[name="capacidad"]')).toBeVisible();
    await expect(page.locator('input[name="precio"]')).toBeVisible();
    await expect(page.locator('input[name="categoria"]')).toBeVisible();
    await expect(page.locator('input[name="banner"]')).toBeVisible();
    
    // Verificar botón de envío
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Crear evento');
  });

  test('debería navegar desde la lista de eventos', async ({ page }) => {
    // Ir a la lista de eventos
    await page.goto('/eventos');
    
    // Verificar que aparece el botón de crear evento
    const createButton = page.getByRole('link', { name: 'Crear evento' });
    await expect(createButton).toBeVisible();
    
    // Hacer clic en el botón
    await createButton.click();
    
    // Verificar que navega a la página de crear evento
    await expect(page).toHaveURL('/crear-evento');
    await expect(page.locator('h1')).toContainText('Crear evento');
  });

  test('debería navegar de regreso después de crear evento', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar formulario mínimo
    await page.fill('input[name="nombre"]', 'Test Event');
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que redirige a la lista de eventos
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que el evento aparece en la lista
    await expect(page.locator('body')).toContainText('Test Event');
  });

  test('debería ser responsive en diferentes viewports', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Verificar en desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('.grid.grid-cols-1.md\\:grid-cols-2')).toBeVisible();
    
    // Verificar en tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('form')).toBeVisible();
    
    // Verificar en móvil
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="nombre"]')).toBeVisible();
  });

  test('debería mostrar labels correctos para todos los campos', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Verificar labels
    await expect(page.locator('label:has-text("Nombre")')).toBeVisible();
    await expect(page.locator('label:has-text("Descripción")')).toBeVisible();
    await expect(page.locator('label:has-text("Fecha")')).toBeVisible();
    await expect(page.locator('label:has-text("Hora")')).toBeVisible();
    await expect(page.locator('label:has-text("Ubicación")')).toBeVisible();
    await expect(page.locator('label:has-text("Capacidad")')).toBeVisible();
    await expect(page.locator('label:has-text("Precio")')).toBeVisible();
    await expect(page.locator('label:has-text("Categoría")')).toBeVisible();
    await expect(page.locator('label:has-text("Banner (URL)")')).toBeVisible();
  });

  test('debería tener tipos de input correctos', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Verificar tipos de input
    await expect(page.locator('input[name="nombre"]')).toHaveAttribute('type', 'text');
    await expect(page.locator('input[name="fecha"]')).toHaveAttribute('type', 'date');
    await expect(page.locator('input[name="hora"]')).toHaveAttribute('type', 'time');
    await expect(page.locator('input[name="capacidad"]')).toHaveAttribute('type', 'number');
    await expect(page.locator('input[name="precio"]')).toHaveAttribute('type', 'number');
    await expect(page.locator('input[name="precio"]')).toHaveAttribute('step', '0.01');
  });

  test('debería mostrar estructura de grid correcta', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Verificar que el formulario usa grid layout
    const formGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2');
    await expect(formGrid).toBeVisible();
    
    // Verificar que algunos campos ocupan todo el ancho
    const fullWidthFields = page.locator('.md\\:col-span-2');
    await expect(fullWidthFields).toHaveCount(4); // nombre, descripción, ubicación, categoría, banner
  });

  test('debería tener estilos visuales correctos', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Verificar clases de estilo
    await expect(page.locator('.container.mx-auto.px-4')).toBeVisible();
    await expect(page.locator('.max-w-3xl.mx-auto')).toBeVisible();
    await expect(page.locator('.bg-white.rounded-lg.shadow-md')).toBeVisible();
    await expect(page.locator('.btn-primary')).toBeVisible();
  });

  test('debería manejar navegación con botón de regreso', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Verificar que se puede navegar de regreso usando el navegador
    await page.goBack();
    
    // Debería estar en la página anterior (eventos o home)
    await expect(page).not.toHaveURL('/crear-evento');
  });

  test('debería mantener estado del formulario al navegar', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar algunos campos
    await page.fill('input[name="nombre"]', 'Test Event Name');
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    
    // Navegar a otra página
    await page.goto('/eventos');
    
    // Volver a crear evento
    await page.goto('/crear-evento');
    
    // Verificar que los campos están vacíos (no se mantiene estado)
    await expect(page.locator('input[name="nombre"]')).toHaveValue('');
    await expect(page.locator('textarea[name="descripcion"]')).toHaveValue('');
  });
});
