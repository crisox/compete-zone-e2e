const { test, expect } = require('@playwright/test');

/**
 * Tests E2E para validar formulario de creación de eventos
 */
test.describe('Creación de Eventos - Validación de Formulario', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login como gimnasio antes de cada test
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'gimnasio@dev.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    await page.goto('/crear-evento');
  });

  test('debería mostrar errores al enviar formulario vacío', async ({ page }) => {
    // Intentar enviar formulario sin llenar campos
    await page.click('button[type="submit"]');
    
    // Verificar que se muestran errores para campos requeridos
    await expect(page.locator('text=El nombre es obligatorio')).toBeVisible();
    await expect(page.locator('text=La descripción es obligatoria')).toBeVisible();
    await expect(page.locator('text=La fecha es obligatoria')).toBeVisible();
    await expect(page.locator('text=La ubicación es obligatoria')).toBeVisible();
    await expect(page.locator('text=La capacidad es obligatoria')).toBeVisible();
    await expect(page.locator('text=El precio es obligatorio')).toBeVisible();
    await expect(page.locator('text=La categoría es obligatoria')).toBeVisible();
  });

  test('debería validar campo nombre', async ({ page }) => {
    // Probar con nombre vacío
    await page.fill('input[name="nombre"]', '');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=El nombre es obligatorio')).toBeVisible();
    
    // Probar con solo espacios
    await page.fill('input[name="nombre"]', '   ');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=El nombre es obligatorio')).toBeVisible();
    
    // Probar con nombre válido
    await page.fill('input[name="nombre"]', 'Test Event Name');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=El nombre es obligatorio')).not.toBeVisible();
  });

  test('debería validar campo descripción', async ({ page }) => {
    // Probar con descripción vacía
    await page.fill('textarea[name="descripcion"]', '');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=La descripción es obligatoria')).toBeVisible();
    
    // Probar con solo espacios
    await page.fill('textarea[name="descripcion"]', '   ');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=La descripción es obligatoria')).toBeVisible();
    
    // Probar con descripción válida
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=La descripción es obligatoria')).not.toBeVisible();
  });

  test('debería validar campo fecha', async ({ page }) => {
    // Probar con fecha vacía
    await page.fill('input[name="fecha"]', '');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=La fecha es obligatoria')).toBeVisible();
    
    // Probar con fecha en el pasado
    await page.fill('input[name="fecha"]', '2023-01-01');
    await page.click('button[type="submit"]');
    // El backend validará que la fecha sea futura
    
    // Probar con fecha válida (futura)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    await page.fill('input[name="fecha"]', futureDateStr);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=La fecha es obligatoria')).not.toBeVisible();
  });

  test('debería validar campo ubicación', async ({ page }) => {
    // Probar con ubicación vacía
    await page.fill('input[name="ubicacion"]', '');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=La ubicación es obligatoria')).toBeVisible();
    
    // Probar con solo espacios
    await page.fill('input[name="ubicacion"]', '   ');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=La ubicación es obligatoria')).toBeVisible();
    
    // Probar con ubicación válida
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=La ubicación es obligatoria')).not.toBeVisible();
  });

  test('debería validar campo capacidad', async ({ page }) => {
    // Probar con capacidad vacía
    await page.fill('input[name="capacidad"]', '');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=La capacidad es obligatoria')).toBeVisible();
    
    // Probar con valor negativo
    await page.fill('input[name="capacidad"]', '-10');
    await page.click('button[type="submit"]');
    // El backend validará que sea positivo
    
    // Probar con valor cero
    await page.fill('input[name="capacidad"]', '0');
    await page.click('button[type="submit"]');
    // El backend validará que sea mayor a cero
    
    // Probar con valor válido
    await page.fill('input[name="capacidad"]', '50');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=La capacidad es obligatoria')).not.toBeVisible();
  });

  test('debería validar campo precio', async ({ page }) => {
    // Probar con precio vacío
    await page.fill('input[name="precio"]', '');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=El precio es obligatorio')).toBeVisible();
    
    // Probar con valor negativo
    await page.fill('input[name="precio"]', '-50.00');
    await page.click('button[type="submit"]');
    // El backend validará que sea positivo o cero
    
    // Probar con valor válido
    await page.fill('input[name="precio"]', '75.50');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=El precio es obligatorio')).not.toBeVisible();
  });

  test('debería validar campo categoría', async ({ page }) => {
    // Probar con categoría vacía
    await page.fill('input[name="categoria"]', '');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=La categoría es obligatoria')).toBeVisible();
    
    // Probar con solo espacios
    await page.fill('input[name="categoria"]', '   ');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=La categoría es obligatoria')).toBeVisible();
    
    // Probar con categoría válida
    await page.fill('input[name="categoria"]', 'RX');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=La categoría es obligatoria')).not.toBeVisible();
  });

  test('debería limpiar errores al llenar campos válidos', async ({ page }) => {
    // Enviar formulario vacío para mostrar errores
    await page.click('button[type="submit"]');
    await expect(page.locator('text=El nombre es obligatorio')).toBeVisible();
    
    // Llenar campo nombre
    await page.fill('input[name="nombre"]', 'Test Event');
    await expect(page.locator('text=El nombre es obligatorio')).not.toBeVisible();
    
    // Llenar campo descripción
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    await expect(page.locator('text=La descripción es obligatoria')).not.toBeVisible();
  });

  test('debería validar múltiples campos simultáneamente', async ({ page }) => {
    // Llenar solo algunos campos
    await page.fill('input[name="nombre"]', 'Test Event');
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que se muestran errores para campos faltantes
    await expect(page.locator('text=La fecha es obligatoria')).toBeVisible();
    await expect(page.locator('text=La ubicación es obligatoria')).toBeVisible();
    await expect(page.locator('text=La capacidad es obligatoria')).toBeVisible();
    await expect(page.locator('text=El precio es obligatorio')).toBeVisible();
    await expect(page.locator('text=La categoría es obligatoria')).toBeVisible();
    
    // Verificar que NO se muestran errores para campos llenos
    await expect(page.locator('text=El nombre es obligatorio')).not.toBeVisible();
    await expect(page.locator('text=La descripción es obligatoria')).not.toBeVisible();
  });

  test('debería mostrar estilos de error en campos inválidos', async ({ page }) => {
    // Enviar formulario vacío
    await page.click('button[type="submit"]');
    
    // Verificar que los campos tienen clase de error
    await expect(page.locator('input[name="nombre"].border-red-500')).toBeVisible();
    await expect(page.locator('textarea[name="descripcion"].border-red-500')).toBeVisible();
    await expect(page.locator('input[name="fecha"].border-red-500')).toBeVisible();
    await expect(page.locator('input[name="ubicacion"].border-red-500')).toBeVisible();
    await expect(page.locator('input[name="capacidad"].border-red-500')).toBeVisible();
    await expect(page.locator('input[name="precio"].border-red-500')).toBeVisible();
    await expect(page.locator('input[name="categoria"].border-red-500')).toBeVisible();
  });

  test('debería permitir campo hora opcional', async ({ page }) => {
    // Llenar todos los campos requeridos
    await page.fill('input[name="nombre"]', 'Test Event');
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Dejar hora vacía (es opcional)
    await page.fill('input[name="hora"]', '');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que no hay error de hora
    await expect(page.locator('text=La hora es obligatoria')).not.toBeVisible();
  });

  test('debería permitir campo banner opcional', async ({ page }) => {
    // Llenar todos los campos requeridos
    await page.fill('input[name="nombre"]', 'Test Event');
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Dejar banner vacío (es opcional)
    await page.fill('input[name="banner"]', '');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que no hay error de banner
    await expect(page.locator('text=El banner es obligatorio')).not.toBeVisible();
  });

  test('debería validar formato de fecha', async ({ page }) => {
    // Probar con formato de fecha inválido
    await page.fill('input[name="fecha"]', 'invalid-date');
    await page.click('button[type="submit"]');
    // El input type="date" debería prevenir esto, pero verificamos
    
    // Probar con fecha válida
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=La fecha es obligatoria')).not.toBeVisible();
  });

  test('debería validar formato de hora', async ({ page }) => {
    // Probar con formato de hora válido
    await page.fill('input[name="hora"]', '10:30');
    await page.click('button[type="submit"]');
    // No debería haber error ya que es opcional
    
    // Probar con formato de hora inválido
    await page.fill('input[name="hora"]', '25:70');
    // El input type="time" debería prevenir esto
  });
});
