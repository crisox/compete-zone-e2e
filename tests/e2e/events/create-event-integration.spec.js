const { test, expect } = require('@playwright/test');

/**
 * Tests E2E para flujos completos de integración en la creación de eventos.
 * TODO: Reescribir con el nuevo wizard multi-paso y endpoints actualizados.
 */
test.describe.skip('Creación de Eventos - Integración Completa', () => {
  
  test('debería completar flujo completo: login → crear evento → verificar en lista → verificar detalle', async ({ page }) => {
    // 1. Login como gimnasio
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'gimnasio@dev.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // 2. Navegar a crear evento desde la lista
    await page.goto('/eventos');
    await page.click('text=Crear evento');
    await expect(page).toHaveURL('/crear-evento');
    
    // 3. Crear evento
    const eventName = 'Integration Test Event';
    const eventDescription = 'This is a test event for integration testing';
    const eventLocation = 'Integration Test Location';
    const eventPrice = '150';
    
    await page.fill('input[name="nombre"]', eventName);
    await page.fill('textarea[name="descripcion"]', eventDescription);
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="hora"]', '10:00');
    await page.fill('input[name="ubicacion"]', eventLocation);
    await page.fill('input[name="capacidad"]', '100');
    await page.fill('input[name="precio"]', eventPrice);
    await page.fill('input[name="categoria"]', 'RX');
    await page.fill('input[name="banner"]', 'https://example.com/integration-test.jpg');
    
    await page.click('button[type="submit"]');
    
    // 4. Verificar redirección a lista de eventos
    await expect(page).toHaveURL('/eventos');
    
    // 5. Verificar que el evento aparece en la lista
    await expect(page.locator('body')).toContainText(eventName);
    await expect(page.locator('body')).toContainText(eventLocation);
    await expect(page.locator('body')).toContainText(eventPrice);
    
    // 6. Hacer clic en el evento para ver detalles
    await page.click(`text=${eventName}`);
    
    // 7. Verificar página de detalles
    await expect(page.locator('body')).toContainText(eventName);
    await expect(page.locator('body')).toContainText(eventDescription);
    await expect(page.locator('body')).toContainText(eventLocation);
    await expect(page.locator('body')).toContainText(eventPrice);
  });

  test('debería crear múltiples eventos y verificar listado completo', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'gym@competezone.test');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Crear primer evento
    await page.goto('/crear-evento');
    await page.fill('input[name="nombre"]', 'Integration Event 1');
    await page.fill('textarea[name="descripcion"]', 'First integration test event');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Location 1');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/eventos');
    
    // Crear segundo evento
    await page.goto('/crear-evento');
    await page.fill('input[name="nombre"]', 'Integration Event 2');
    await page.fill('textarea[name="descripcion"]', 'Second integration test event');
    await page.fill('input[name="fecha"]', '2024-12-26');
    await page.fill('input[name="ubicacion"]', 'Location 2');
    await page.fill('input[name="capacidad"]', '75');
    await page.fill('input[name="precio"]', '100');
    await page.fill('input[name="categoria"]', 'Escalado');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/eventos');
    
    // Crear tercer evento
    await page.goto('/crear-evento');
    await page.fill('input[name="nombre"]', 'Integration Event 3');
    await page.fill('textarea[name="descripcion"]', 'Third integration test event');
    await page.fill('input[name="fecha"]', '2024-12-27');
    await page.fill('input[name="ubicacion"]', 'Location 3');
    await page.fill('input[name="capacidad"]', '100');
    await page.fill('input[name="precio"]', '125');
    await page.fill('input[name="categoria"]', 'Elite');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que todos los eventos aparecen en la lista
    await expect(page.locator('body')).toContainText('Integration Event 1');
    await expect(page.locator('body')).toContainText('Integration Event 2');
    await expect(page.locator('body')).toContainText('Integration Event 3');
    
    // Verificar que se muestran los precios correctos
    await expect(page.locator('body')).toContainText('75');
    await expect(page.locator('body')).toContainText('100');
    await expect(page.locator('body')).toContainText('125');
  });

  test('debería crear evento y verificar datos completos en detalle', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'gym@competezone.test');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Crear evento con datos completos
    const eventData = {
      name: 'Complete Data Test Event',
      description: 'This event has complete data for testing all fields',
      date: '2024-12-25',
      time: '14:30',
      location: 'Complete Test Location',
      capacity: '150',
      price: '200',
      category: 'RX',
      banner: 'https://example.com/complete-test-banner.jpg'
    };
    
    await page.goto('/crear-evento');
    await page.fill('input[name="nombre"]', eventData.name);
    await page.fill('textarea[name="descripcion"]', eventData.description);
    await page.fill('input[name="fecha"]', eventData.date);
    await page.fill('input[name="hora"]', eventData.time);
    await page.fill('input[name="ubicacion"]', eventData.location);
    await page.fill('input[name="capacidad"]', eventData.capacity);
    await page.fill('input[name="precio"]', eventData.price);
    await page.fill('input[name="categoria"]', eventData.category);
    await page.fill('input[name="banner"]', eventData.banner);
    
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/eventos');
    
    // Verificar en lista
    await expect(page.locator('body')).toContainText(eventData.name);
    await expect(page.locator('body')).toContainText(eventData.location);
    await expect(page.locator('body')).toContainText(eventData.price);
    
    // Ir a detalles del evento
    await page.click(`text=${eventData.name}`);
    
    // Verificar todos los datos en la página de detalles
    await expect(page.locator('body')).toContainText(eventData.name);
    await expect(page.locator('body')).toContainText(eventData.description);
    await expect(page.locator('body')).toContainText(eventData.location);
    await expect(page.locator('body')).toContainText(eventData.price);
    await expect(page.locator('body')).toContainText(eventData.category);
    await expect(page.locator('body')).toContainText(eventData.capacity);
  });

  test('debería crear evento y verificar permisos de edición', async ({ page }) => {
    // Login como gimnasio
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'gym@competezone.test');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Crear evento
    await page.goto('/crear-evento');
    await page.fill('input[name="nombre"]', 'Edit Permissions Test Event');
    await page.fill('textarea[name="descripcion"]', 'Test event for edit permissions');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/eventos');
    
    // Ir a detalles del evento
    await page.click('text=Edit Permissions Test Event');
    
    // Verificar que el gimnasio puede ver opciones de edición
    // (esto dependerá de la implementación de la UI)
    await expect(page.locator('body')).toContainText('Edit Permissions Test Event');
    
    // Login como admin y verificar que también puede editar
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@competezone.test');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Ir a detalles del evento
    await page.goto('/eventos');
    await page.click('text=Edit Permissions Test Event');
    
    // Verificar que el admin también puede ver el evento
    await expect(page.locator('body')).toContainText('Edit Permissions Test Event');
  });

  test('debería crear evento y verificar navegación completa', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'gym@competezone.test');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Navegar desde home → eventos → crear evento
    await page.goto('/');
    await page.click('text=Eventos');
    await expect(page).toHaveURL('/eventos');
    
    await page.click('text=Crear evento');
    await expect(page).toHaveURL('/crear-evento');
    
    // Crear evento
    await page.fill('input[name="nombre"]', 'Navigation Test Event');
    await page.fill('textarea[name="descripcion"]', 'Test event for navigation');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    await page.click('button[type="submit"]');
    
    // Verificar redirección a eventos
    await expect(page).toHaveURL('/eventos');
    
    // Navegar a home
    await page.click('text=Inicio, Home');
    await expect(page).toHaveURL('/');
    
    // Navegar de vuelta a eventos
    await page.click('text=Eventos');
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que el evento sigue ahí
    await expect(page.locator('body')).toContainText('Navigation Test Event');
  });

  test('debería crear evento y verificar integración con búsqueda', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'gym@competezone.test');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Crear evento con nombre específico
    const searchableEventName = 'Searchable Test Event';
    
    await page.goto('/crear-evento');
    await page.fill('input[name="nombre"]', searchableEventName);
    await page.fill('textarea[name="descripcion"]', 'Test event for search functionality');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Searchable Location');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que aparece en la lista
    await expect(page.locator('body')).toContainText(searchableEventName);
    
    // Usar búsqueda para encontrar el evento
    await page.fill('input[name="searchTerm"]', 'Searchable');
    await page.keyboard.press('Enter');
    
    // Verificar que el evento aparece en los resultados de búsqueda
    await expect(page.locator('body')).toContainText(searchableEventName);
    
    // Limpiar búsqueda
    await page.fill('input[name="searchTerm"]', '');
    await page.keyboard.press('Enter');
    
    // Verificar que el evento sigue visible
    await expect(page.locator('body')).toContainText(searchableEventName);
  });

  test('debería crear evento y verificar integración con filtros', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'gym@competezone.test');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Crear evento con ubicación específica
    const filterableLocation = 'Filterable Test Location';
    
    await page.goto('/crear-evento');
    await page.fill('input[name="nombre"]', 'Filter Test Event');
    await page.fill('textarea[name="descripcion"]', 'Test event for filter functionality');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', filterableLocation);
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que aparece en la lista
    await expect(page.locator('body')).toContainText('Filter Test Event');
    
    // Usar filtro de ubicación
    await page.selectOption('select[name="eventLocation"]', filterableLocation);
    
    // Verificar que el evento aparece en los resultados filtrados
    await expect(page.locator('body')).toContainText('Filter Test Event');
    
    // Limpiar filtro
    await page.selectOption('select[name="eventLocation"]', '');
    
    // Verificar que el evento sigue visible
    await expect(page.locator('body')).toContainText('Filter Test Event');
  });

  test('debería crear evento y verificar persistencia de datos', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'gym@competezone.test');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Crear evento
    const persistentEventName = 'Persistent Test Event';
    
    await page.goto('/crear-evento');
    await page.fill('input[name="nombre"]', persistentEventName);
    await page.fill('textarea[name="descripcion"]', 'Test event for data persistence');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Persistent Location');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que aparece en la lista
    await expect(page.locator('body')).toContainText(persistentEventName);
    
    // Recargar la página
    await page.reload();
    
    // Verificar que el evento sigue ahí después de recargar
    await expect(page.locator('body')).toContainText(persistentEventName);
    
    // Navegar a otra página y volver
    await page.goto('/');
    await page.goto('/eventos');
    
    // Verificar que el evento sigue ahí
    await expect(page.locator('body')).toContainText(persistentEventName);
  });

  test('debería crear evento y verificar integración con diferentes roles', async ({ page }) => {
    // Login como gimnasio y crear evento
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'gym@competezone.test');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    const multiRoleEventName = 'Multi-Role Test Event';
    
    await page.goto('/crear-evento');
    await page.fill('input[name="nombre"]', multiRoleEventName);
    await page.fill('textarea[name="descripcion"]', 'Test event for multi-role access');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Multi-Role Location');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que aparece en la lista
    await expect(page.locator('body')).toContainText(multiRoleEventName);
    
    // Login como atleta y verificar que puede ver el evento
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'athlete@competezone.test');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    await page.goto('/eventos');
    await expect(page.locator('body')).toContainText(multiRoleEventName);
    
    // Verificar que el atleta NO puede ver el botón de crear evento
    await expect(page.getByRole('link', { name: 'Crear evento' })).not.toBeVisible();
    
    // Login como admin y verificar que puede ver el evento
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@competezone.test');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    await page.goto('/eventos');
    await expect(page.locator('body')).toContainText(multiRoleEventName);
    
    // Verificar que el admin SÍ puede ver el botón de crear evento
    await expect(page.getByRole('link', { name: 'Crear evento' })).toBeVisible();
  });
});
