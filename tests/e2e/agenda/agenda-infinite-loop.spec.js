import { test, expect } from '@playwright/test';

test.describe('Event Agenda - Infinite Loop Prevention', () => {
  let eventId;

  test.beforeEach(async ({ page }) => {
    // Ir a la página de login
    await page.goto('/login');
    
    // Login como organizador (usando datos de fixtures)
    await page.fill('input[name="email"]', 'carlos.rodriguez@email.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Esperar redirección
    await page.waitForURL('/');
  });

  test('should not cause infinite loop when loading agenda', async ({ page }) => {
    // Interceptar las llamadas a la API de agenda
    const agendaRequests = [];
    
    await page.route('**/api/events/*/agenda', (route) => {
      agendaRequests.push({
        url: route.request().url(),
        timestamp: Date.now()
      });
      route.continue();
    });

    // Crear un evento primero
    await page.goto('/crear-evento');
    await page.fill('input[name="title"]', 'Test Event for Agenda');
    await page.fill('input[name="description"]', 'Event to test agenda infinite loop fix');
    await page.selectOption('select[name="gymId"]', 'gym-1');
    await page.fill('input[name="maxParticipants"]', '20');
    await page.fill('input[name="price"]', '25.00');
    await page.fill('input[name="eventDate"]', '2024-06-15');
    await page.fill('input[name="startTime"]', '10:00');
    await page.fill('input[name="endTime"]', '14:00');
    
    // Crear el evento
    await page.click('button[type="submit"]');
    
    // Esperar redirección y capturar eventId de la URL
    await page.waitForURL(/\/eventos\/[^\/]+$/);
    const url = page.url();
    eventId = url.split('/').pop();
    
    console.log('📅 Event created with ID:', eventId);

    // Navegar al tab de agenda
    await page.click('button:has-text("Agenda / WOD")');
    
    // Esperar un poco para que se cargue la agenda
    await page.waitForTimeout(3000);
    
    // Verificar que no hay loop infinito - debería haber máximo 2 requests
    // (uno inicial y posiblemente uno de refresh)
    expect(agendaRequests.length).toBeLessThanOrEqual(2);
    
    if (agendaRequests.length > 1) {
      // Si hay múltiples requests, verificar que no son consecutivos rápidos
      const timeDiff = agendaRequests[1].timestamp - agendaRequests[0].timestamp;
      expect(timeDiff).toBeGreaterThan(100); // Al menos 100ms de diferencia
    }
    
    console.log('✅ Agenda requests count:', agendaRequests.length);
    console.log('📊 Request details:', agendaRequests);
  });

  test('should load agenda without console errors', async ({ page }) => {
    // Capturar errores de consola
    const consoleErrors = [];
    const consoleWarnings = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    // Ir a un evento existente (usar uno de los fixtures)
    await page.goto('/eventos/event-1');
    
    // Navegar al tab de agenda
    await page.click('button:has-text("Agenda / WOD")');
    
    // Esperar que cargue
    await page.waitForTimeout(2000);
    
    // Verificar que no hay errores relacionados con agenda
    const agendaErrors = consoleErrors.filter(error => 
      error.includes('agenda') || 
      error.includes('useEffect') || 
      error.includes('infinite') ||
      error.includes('Maximum update depth')
    );
    
    expect(agendaErrors).toHaveLength(0);
    
    console.log('✅ No agenda-related console errors found');
    if (consoleErrors.length > 0) {
      console.log('ℹ️ Other console errors (not agenda-related):', consoleErrors);
    }
  });

  test('should handle agenda tab switching without multiple API calls', async ({ page }) => {
    let agendaCallCount = 0;
    
    await page.route('**/api/events/*/agenda', (route) => {
      agendaCallCount++;
      console.log(`📡 Agenda API call #${agendaCallCount}`);
      route.continue();
    });

    // Ir a un evento existente
    await page.goto('/eventos/event-1');
    
    // Cambiar entre tabs varias veces
    await page.click('button:has-text("Detalles")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Agenda / WOD")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Detalles")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Agenda / WOD")');
    await page.waitForTimeout(1000);
    
    // No debería hacer más de 2 llamadas (una por cada vez que se muestra el tab)
    expect(agendaCallCount).toBeLessThanOrEqual(2);
    
    console.log('✅ Total agenda API calls after tab switching:', agendaCallCount);
  });

  test('should display agenda content correctly', async ({ page }) => {
    // Ir a un evento existente
    await page.goto('/eventos/event-1');
    
    // Navegar al tab de agenda
    await page.click('button:has-text("Agenda / WOD")');
    
    // Verificar que el componente de agenda se carga
    await expect(page.locator('[data-testid="agenda-timeline"], .agenda-timeline, .agenda-container')).toBeVisible({ timeout: 5000 });
    
    // Verificar que no hay mensajes de error visible
    await expect(page.locator('text="Error al cargar la agenda"')).not.toBeVisible();
    
    console.log('✅ Agenda component loaded successfully');
  });

  test('should show loading state briefly then content', async ({ page }) => {
    // Ir a un evento existente
    await page.goto('/eventos/event-1');
    
    // Navegar al tab de agenda
    await page.click('button:has-text("Agenda / WOD")');
    
    // Verificar que aparece el estado de carga brevemente
    const loadingIndicator = page.locator('text="Cargando agenda...", .animate-spin');
    
    // Esperar que desaparezca el loading (máximo 5 segundos)
    await loadingIndicator.waitFor({ state: 'hidden', timeout: 5000 });
    
    // Verificar que hay contenido de agenda o mensaje de agenda vacía
    const hasContent = await page.locator('[data-testid="agenda-timeline"], .agenda-timeline, text="No hay actividades en la agenda"').isVisible();
    expect(hasContent).toBeTruthy();
    
    console.log('✅ Loading state handled correctly');
  });
});
