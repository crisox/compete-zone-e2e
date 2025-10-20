const { test, expect } = require('@playwright/test');

/**
 * Tests E2E para flujos de creación exitosa de eventos.
 * TODO: Reescribir con el nuevo flujo multi-paso antes de reactivar.
 */
test.describe.skip('Creación de Eventos - Flujos Exitosos', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login como gimnasio antes de cada test
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'gimnasio@dev.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('debería crear evento con campos mínimos requeridos', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar solo campos requeridos
    await page.fill('input[name="nombre"]', 'Test Event Minimal');
    await page.fill('textarea[name="descripcion"]', 'Test Description Minimal');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar redirección a lista de eventos
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que el evento aparece en la lista
    await expect(page.locator('body')).toContainText('Test Event Minimal');
  });

  test('debería crear evento con todos los campos completos', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar todos los campos
    await page.fill('input[name="nombre"]', 'Test Event Complete');
    await page.fill('textarea[name="descripcion"]', 'Test Description Complete with full details');
    await page.fill('input[name="fecha"]', '2024-12-26');
    await page.fill('input[name="hora"]', '10:30');
    await page.fill('input[name="ubicacion"]', 'Test Location Complete');
    await page.fill('input[name="capacidad"]', '100');
    await page.fill('input[name="precio"]', '125.50');
    await page.fill('input[name="categoria"]', 'Escalado');
    await page.fill('input[name="banner"]', 'https://example.com/test-banner.jpg');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar redirección
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que el evento aparece en la lista
    await expect(page.locator('body')).toContainText('Test Event Complete');
  });

  test('debería crear evento con imagen personalizada', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar formulario con imagen personalizada
    await page.fill('input[name="nombre"]', 'Test Event with Image');
    await page.fill('textarea[name="descripcion"]', 'Test Description with custom image');
    await page.fill('input[name="fecha"]', '2024-12-27');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '75');
    await page.fill('input[name="precio"]', '90');
    await page.fill('input[name="categoria"]', 'RX');
    await page.fill('input[name="banner"]', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar redirección
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que el evento aparece en la lista
    await expect(page.locator('body')).toContainText('Test Event with Image');
  });

  test('debería crear evento con hora específica', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar formulario con hora específica
    await page.fill('input[name="nombre"]', 'Test Event with Time');
    await page.fill('textarea[name="descripcion"]', 'Test Description with specific time');
    await page.fill('input[name="fecha"]', '2024-12-28');
    await page.fill('input[name="hora"]', '14:00');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '60');
    await page.fill('input[name="precio"]', '80');
    await page.fill('input[name="categoria"]', 'Escalado');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar redirección
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que el evento aparece en la lista
    await expect(page.locator('body')).toContainText('Test Event with Time');
  });

  test('debería crear evento con precio cero (gratuito)', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar formulario con precio cero
    await page.fill('input[name="nombre"]', 'Test Free Event');
    await page.fill('textarea[name="descripcion"]', 'Test Description for free event');
    await page.fill('input[name="fecha"]', '2024-12-29');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '40');
    await page.fill('input[name="precio"]', '0');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar redirección
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que el evento aparece en la lista
    await expect(page.locator('body')).toContainText('Test Free Event');
  });

  test('debería crear evento con capacidad alta', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar formulario con capacidad alta
    await page.fill('input[name="nombre"]', 'Test Large Event');
    await page.fill('textarea[name="descripcion"]', 'Test Description for large event');
    await page.fill('input[name="fecha"]', '2024-12-30');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '500');
    await page.fill('input[name="precio"]', '150');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar redirección
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que el evento aparece en la lista
    await expect(page.locator('body')).toContainText('Test Large Event');
  });

  test('debería crear evento con categoría especial', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar formulario con categoría especial
    await page.fill('input[name="nombre"]', 'Test Special Category Event');
    await page.fill('textarea[name="descripcion"]', 'Test Description for special category');
    await page.fill('input[name="fecha"]', '2024-12-31');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '30');
    await page.fill('input[name="precio"]', '200');
    await page.fill('input[name="categoria"]', 'Elite');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar redirección
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que el evento aparece en la lista
    await expect(page.locator('body')).toContainText('Test Special Category Event');
  });

  test('debería crear múltiples eventos secuencialmente', async ({ page }) => {
    // Crear primer evento
    await page.goto('/crear-evento');
    await page.fill('input[name="nombre"]', 'First Test Event');
    await page.fill('textarea[name="descripcion"]', 'First event description');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location 1');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/eventos');
    
    // Crear segundo evento
    await page.goto('/crear-evento');
    await page.fill('input[name="nombre"]', 'Second Test Event');
    await page.fill('textarea[name="descripcion"]', 'Second event description');
    await page.fill('input[name="fecha"]', '2024-12-26');
    await page.fill('input[name="ubicacion"]', 'Test Location 2');
    await page.fill('input[name="capacidad"]', '75');
    await page.fill('input[name="precio"]', '100');
    await page.fill('input[name="categoria"]', 'Escalado');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que ambos eventos aparecen en la lista
    await expect(page.locator('body')).toContainText('First Test Event');
    await expect(page.locator('body')).toContainText('Second Test Event');
  });

  test('debería mostrar estado de carga durante la creación', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar formulario
    await page.fill('input[name="nombre"]', 'Test Loading Event');
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Enviar formulario y verificar estado de carga
    await page.click('button[type="submit"]');
    
    // Verificar que el botón muestra estado de carga
    await expect(page.locator('button[type="submit"]')).toContainText('Creando...');
    
    // Esperar a que se complete la creación
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que el evento aparece en la lista
    await expect(page.locator('body')).toContainText('Test Loading Event');
  });

  test('debería crear evento como admin', async ({ page }) => {
    // Login como admin
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@dev.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Crear evento
    await page.goto('/crear-evento');
    await page.fill('input[name="nombre"]', 'Admin Created Event');
    await page.fill('textarea[name="descripcion"]', 'Event created by admin');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Admin Location');
    await page.fill('input[name="capacidad"]', '100');
    await page.fill('input[name="precio"]', '150');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar redirección
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que el evento aparece en la lista
    await expect(page.locator('body')).toContainText('Admin Created Event');
  });

  test('debería verificar datos del evento creado en la lista', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar formulario con datos específicos
    const eventName = 'Test Event for Verification';
    const eventLocation = 'Test Location for Verification';
    const eventPrice = '125';
    
    await page.fill('input[name="nombre"]', eventName);
    await page.fill('textarea[name="descripcion"]', 'Test Description for verification');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', eventLocation);
    await page.fill('input[name="capacidad"]', '80');
    await page.fill('input[name="precio"]', eventPrice);
    await page.fill('input[name="categoria"]', 'RX');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar redirección
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que los datos aparecen correctamente en la lista
    await expect(page.locator('body')).toContainText(eventName);
    await expect(page.locator('body')).toContainText(eventLocation);
    await expect(page.locator('body')).toContainText(eventPrice);
  });
});
