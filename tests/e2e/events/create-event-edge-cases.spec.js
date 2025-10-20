const { test, expect } = require('@playwright/test');

const DEFAULT_EVENT_DATA = {
  nombre: 'Evento de prueba E2E',
  categoria: 'CrossFit',
  descripcion: 'Competencia de prueba para validaciones E2E',
  fecha: '2025-12-25',
  hora: '10:00',
  ubicacion: 'Barcelona, España',
  capacidad: '50',
  precio: '75'
};

async function goToCreateEvent(page) {
  await page.goto('/crear-evento');
  await expect(page.locator('h1')).toContainText('Crear evento');
}

async function completeStep1(page, overrides = {}, { clickNext = true } = {}) {
  const data = { ...DEFAULT_EVENT_DATA, ...overrides };
  await page.fill('input[name="nombre"]', data.nombre);
  await page.fill('input[name="categoria"]', data.categoria);
  await page.fill('textarea[name="descripcion"]', data.descripcion);
  if (clickNext) {
    await page.getByRole('button', { name: /Siguiente/ }).click();
  }
}

async function completeStep2(page, overrides = {}, { clickNext = true } = {}) {
  const data = { ...DEFAULT_EVENT_DATA, ...overrides };
  await expect(page.locator('input[name="fecha"]')).toBeVisible();
  await page.fill('input[name="fecha"]', data.fecha);
  await page.fill('input[name="hora"]', data.hora);
  await page.fill('input[name="ubicacion"]', data.ubicacion);
  await page.fill('input[name="capacidad"]', data.capacidad);
  await page.fill('input[name="precio"]', data.precio);
  if (clickNext) {
    await page.getByRole('button', { name: /Siguiente/ }).click();
  }
}

async function advanceToSummaryStep(page) {
  await page.getByRole('button', { name: /Siguiente/ }).click();
}

async function submitEventForm(page) {
  await page.getByRole('button', { name: /Crear Evento/ }).click();
}

/**
 * Tests E2E para casos límite y manejo de errores en la creación de eventos
 */
test.describe('Creación de Eventos - Casos Edge y Errores', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login como gimnasio antes de cada test
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'gimnasio@dev.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('debería manejar fecha en el pasado', async ({ page }) => {
    await goToCreateEvent(page);
    await completeStep1(page);
    await completeStep2(page, { fecha: '2023-01-01' });

    // Verificar que se muestra error de fecha en el pasado
    await expect(page.locator('body')).toContainText('La fecha debe ser futura');
  });

  test.skip('debería manejar capacidad muy alta', async ({ page }) => {
    test.info().annotations.push({
      type: 'todo',
      description: 'Validación de límite superior de capacidad pendiente en nuevo flujo'
    });
  });

  test('debería manejar precio negativo', async ({ page }) => {
    await goToCreateEvent(page);
    await completeStep1(page);
    await completeStep2(page, { precio: '-50' });

    // Verificar que se muestra error de precio negativo
    await expect(page.locator('body')).toContainText('El precio debe ser un número válido mayor o igual a 0');
  });

  test.skip('debería manejar URL de imagen inválida', async ({ page }) => {
    test.info().annotations.push({
      type: 'todo',
      description: 'Actualizar cuando el uploader soporte validaciones directas de URL'
    });
  });

  test.skip('debería manejar nombre muy largo', async ({ page }) => {
    test.info().annotations.push({
      type: 'todo',
      description: 'Confirmar límites de título con backend actualizado'
    });
  });

  test.skip('debería manejar descripción muy larga', async ({ page }) => {
    test.info().annotations.push({
      type: 'todo',
      description: 'Revisar validación de descripción con nuevo backend'
    });
  });

  test.skip('debería manejar ubicación muy larga', async ({ page }) => {
    test.info().annotations.push({
      type: 'todo',
      description: 'Definir límite de caracteres para ubicación'
    });
  });

  test.skip('debería manejar precio con muchos decimales', async ({ page }) => {
    test.info().annotations.push({
      type: 'todo',
      description: 'Actualizar reglas de formato cuando se definan en el backend'
    });
  });

  test('debería manejar capacidad cero', async ({ page }) => {
    await goToCreateEvent(page);
    await completeStep1(page);
    await completeStep2(page, { capacidad: '0' });

    await expect(page.locator('body')).toContainText('La capacidad debe ser un número válido mayor a 0');
  });

  test('debería manejar caracteres especiales en campos', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Pendiente adaptar flujo para otros navegadores');
    await goToCreateEvent(page);
    await completeStep1(page, {
      nombre: 'Test Event with Special Chars: áéíóúñ@#$%',
      categoria: 'RX with special chars: áéíóúñ',
      descripcion: 'Test Description with special chars: áéíóúñ@#$%&*()'
    });
    await completeStep2(page, {
      ubicacion: 'Test Location with special chars: áéíóúñ@#$%'
    });
    await advanceToSummaryStep(page);
    await submitEventForm(page);

    await expect(page).toHaveURL('/eventos');
    await expect(page.locator('body')).toContainText('Test Event with Special Chars: áéíóúñ@#$%');
  });

  test.skip('debería manejar múltiples envíos del formulario', async ({ page }) => {
    test.info().annotations.push({
      type: 'todo',
      description: 'Reevaluar al migrar a flujo multi-paso con confirmaciones'
    });
  });

  test.skip('debería manejar interrupción durante la creación', async ({ page }) => {
    test.info().annotations.push({
      type: 'todo',
      description: 'Requiere nueva estrategia con formularios multi-paso'
    });
  });

  test('debería manejar campos con solo espacios', async ({ page }) => {
    await goToCreateEvent(page);
    await completeStep1(page, {
      nombre: '   ',
      categoria: '   ',
      descripcion: '   '
    }, { clickNext: true });

    // Verificar que se muestran errores para campos con solo espacios en el paso 1
    await expect(page.locator('text=El nombre es obligatorio')).toBeVisible();
    await expect(page.locator('text=La descripción es obligatoria')).toBeVisible();
    await expect(page.locator('text=La categoría es obligatoria')).toBeVisible();

    // Corregir datos básicos y avanzar al siguiente paso
    await page.fill('input[name="nombre"]', DEFAULT_EVENT_DATA.nombre);
    await page.fill('input[name="categoria"]', DEFAULT_EVENT_DATA.categoria);
    await page.fill('textarea[name="descripcion"]', DEFAULT_EVENT_DATA.descripcion);
    await page.getByRole('button', { name: /Siguiente/ }).click();

    // Validar campos con espacios en el paso 2
    await completeStep2(page, { ubicacion: '   ' }, { clickNext: true });
    await expect(page.locator('text=La ubicación es obligatoria')).toBeVisible();
  });

  test.skip('debería manejar valores extremos en campos numéricos', async ({ page }) => {
    test.info().annotations.push({
      type: 'todo',
      description: 'Validaciones pendientes para límites superiores en el backend'
    });
  });
});
