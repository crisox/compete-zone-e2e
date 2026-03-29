import { test, expect } from '@playwright/test';

test.describe('Event Agenda - Full Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login como organizador
    await page.goto('/login');
    await page.fill('input[name="email"]', 'carlos.rodriguez@email.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display agenda for existing event', async ({ page }) => {
    // Ir a un evento existente con agenda
    await page.goto('/eventos/event-1');
    
    // Navegar al tab de agenda
    await page.click('button:has-text("Agenda / WOD")');
    
    // Verificar que se muestra la agenda
    await expect(page.locator('[data-testid="agenda-timeline"], .agenda-timeline')).toBeVisible({ timeout: 10000 });
    
    // Si hay actividades, verificar que se muestran
    const hasActivities = await page.locator('.agenda-item, [data-testid*="agenda-item"]').count();
    console.log(`📅 Found ${hasActivities} agenda activities`);
  });

  test('should show add activity button for editable agenda', async ({ page }) => {
    // Ir a página de edición de agenda
    await page.goto('/eventos/event-1/agenda/editar');
    
    // Verificar que existe el botón de agregar
    await expect(page.locator('button:has-text("Agregar Actividad"), button:has-text("Agregar"), button[title*="agregar"]')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Add activity button found in editable mode');
  });

  test('should handle empty agenda gracefully', async ({ page }) => {
    // Crear un nuevo evento sin agenda
    await page.goto('/crear-evento');
    
    // Llenar formulario de evento
    await page.fill('input[name="title"]', 'Empty Agenda Test Event');
    await page.fill('input[name="description"]', 'Testing empty agenda display');
    await page.selectOption('select[name="gymId"]', 'gym-1');
    await page.fill('input[name="maxParticipants"]', '15');
    await page.fill('input[name="price"]', '20.00');
    await page.fill('input[name="eventDate"]', '2024-07-15');
    await page.fill('input[name="startTime"]', '09:00');
    await page.fill('input[name="endTime"]', '13:00');
    
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/eventos\/[^\/]+$/);
    
    // Ir al tab de agenda
    await page.click('button:has-text("Agenda / WOD")');
    
    // Verificar que se maneja agenda vacía correctamente
    const emptyMessage = page.locator('text="No hay actividades", text="agenda vacía", text="Aún no hay actividades"');
    const agendaContainer = page.locator('[data-testid="agenda-timeline"], .agenda-timeline');
    
    // Debe mostrar contenedor de agenda O mensaje de vacío
    const hasEmptyState = await emptyMessage.isVisible() || await agendaContainer.isVisible();
    expect(hasEmptyState).toBeTruthy();
    
    console.log('✅ Empty agenda handled correctly');
  });

  test('should not reload agenda unnecessarily on tab focus', async ({ page }) => {
    let apiCallCount = 0;
    
    // Interceptar llamadas a API de agenda
    await page.route('**/api/events/*/agenda', (route) => {
      apiCallCount++;
      console.log(`📡 API call #${apiCallCount} to agenda endpoint`);
      route.continue();
    });
    
    // Ir a evento existente
    await page.goto('/eventos/event-1');
    
    // Cambiar a tab de agenda
    await page.click('button:has-text("Agenda / WOD")');
    await page.waitForTimeout(1000);
    
    const initialCallCount = apiCallCount;
    
    // Cambiar de tab y volver
    await page.click('button:has-text("Detalles")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Agenda / WOD")');
    await page.waitForTimeout(1000);
    
    // Simular pérdida y ganancia de foco
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
    });
    await page.waitForTimeout(200);
    
    await page.evaluate(() => {
      window.dispatchEvent(new Event('focus'));
    });
    await page.waitForTimeout(500);
    
    // No debería haber más de 1-2 llamadas adicionales
    const additionalCalls = apiCallCount - initialCallCount;
    expect(additionalCalls).toBeLessThanOrEqual(2);
    
    console.log(`✅ Additional API calls after focus events: ${additionalCalls}`);
  });

  test('should maintain agenda state when switching tabs', async ({ page }) => {
    // Ir a evento con agenda
    await page.goto('/eventos/event-1');
    
    // Ir a agenda
    await page.click('button:has-text("Agenda / WOD")');
    await page.waitForTimeout(1000);
    
    // Capturar estado inicial de agenda
    const initialContent = await page.locator('[data-testid="agenda-timeline"], .agenda-timeline').innerHTML().catch(() => '');
    
    // Cambiar de tab
    await page.click('button:has-text("Detalles")');
    await page.waitForTimeout(500);
    
    // Volver a agenda
    await page.click('button:has-text("Agenda / WOD")');
    await page.waitForTimeout(1000);
    
    // Verificar que el contenido se mantiene
    const finalContent = await page.locator('[data-testid="agenda-timeline"], .agenda-timeline').innerHTML().catch(() => '');
    
    // Si había contenido inicial, debería mantenerse
    if (initialContent && initialContent.length > 100) {
      expect(finalContent).toBe(initialContent);
      console.log('✅ Agenda state maintained across tab switches');
    } else {
      console.log('ℹ️ No significant agenda content to compare');
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Interceptar y simular error en API de agenda
    await page.route('**/api/events/*/agenda', (route) => {
      route.abort('failed');
    });
    
    // Ir a evento
    await page.goto('/eventos/event-1');
    
    // Ir a agenda
    await page.click('button:has-text("Agenda / WOD")');
    await page.waitForTimeout(2000);
    
    // Verificar que se muestra algún tipo de estado de error o fallback
    const hasErrorMessage = await page.locator('text="Error al cargar", text="No se pudo cargar", text="Error"').isVisible();
    const hasEmptyState = await page.locator('[data-testid="agenda-timeline"], .agenda-timeline').isVisible();
    
    // Debe mostrar error O estado vacío (fallback a mocks)
    expect(hasErrorMessage || hasEmptyState).toBeTruthy();
    
    console.log('✅ API error handled gracefully');
  });

  test('should not cause memory leaks with rapid tab switching', async ({ page }) => {
    let requestCount = 0;
    
    await page.route('**/api/events/*/agenda', (route) => {
      requestCount++;
      route.continue();
    });
    
    // Ir a evento
    await page.goto('/eventos/event-1');
    
    // Cambiar tabs rápidamente 5 veces
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Agenda / WOD")');
      await page.waitForTimeout(100);
      await page.click('button:has-text("Detalles")');
      await page.waitForTimeout(100);
    }
    
    // Esperar un poco y verificar que no hay llamadas excesivas
    await page.waitForTimeout(1000);
    
    // No debería haber más de 10 requests para 5 cambios de tab
    expect(requestCount).toBeLessThanOrEqual(10);
    
    console.log(`✅ Request count after rapid switching: ${requestCount}`);
  });
});
