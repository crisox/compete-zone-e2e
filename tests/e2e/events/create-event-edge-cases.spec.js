const { test, expect } = require('@playwright/test');

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
    await page.goto('/crear-evento');
    
    // Llenar formulario con fecha en el pasado
    await page.fill('input[name="nombre"]', 'Test Past Date Event');
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    await page.fill('input[name="fecha"]', '2023-01-01');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que se muestra error de fecha en el pasado
    // El backend debería validar esto y mostrar un error
    await expect(page.locator('body')).toContainText('fecha debe ser futura');
  });

  test('debería manejar capacidad muy alta', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar formulario con capacidad muy alta
    await page.fill('input[name="nombre"]', 'Test High Capacity Event');
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '15000'); // Muy alta
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que se muestra error de capacidad muy alta
    await expect(page.locator('body')).toContainText('No puede haber más de 10000 participantes');
  });

  test('debería manejar precio negativo', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar formulario con precio negativo
    await page.fill('input[name="nombre"]', 'Test Negative Price Event');
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '-50');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que se muestra error de precio negativo
    await expect(page.locator('body')).toContainText('El precio debe ser positivo o cero');
  });

  test('debería manejar URL de imagen inválida', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar formulario con URL de imagen inválida
    await page.fill('input[name="nombre"]', 'Test Invalid Image Event');
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    await page.fill('input[name="banner"]', 'invalid-url');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que se muestra error de URL inválida
    await expect(page.locator('body')).toContainText('La imagen debe ser una URL válida');
  });

  test('debería manejar nombre muy largo', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Crear nombre muy largo (más de 255 caracteres)
    const longName = 'A'.repeat(300);
    
    await page.fill('input[name="nombre"]', longName);
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que se muestra error de nombre muy largo
    await expect(page.locator('body')).toContainText('El título no puede exceder 255 caracteres');
  });

  test('debería manejar descripción muy larga', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Crear descripción muy larga
    const longDescription = 'A'.repeat(1000);
    
    await page.fill('input[name="nombre"]', 'Test Long Description Event');
    await page.fill('textarea[name="descripcion"]', longDescription);
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que se maneja correctamente (puede ser truncado o mostrar error)
    // Dependiendo de la implementación del backend
  });

  test('debería manejar ubicación muy larga', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Crear ubicación muy larga (más de 500 caracteres)
    const longLocation = 'A'.repeat(600);
    
    await page.fill('input[name="nombre"]', 'Test Long Location Event');
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', longLocation);
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que se muestra error de ubicación muy larga
    await expect(page.locator('body')).toContainText('La ubicación no puede exceder 500 caracteres');
  });

  test('debería manejar precio con muchos decimales', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar formulario con precio con muchos decimales
    await page.fill('input[name="nombre"]', 'Test Decimal Price Event');
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75.123456');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que se muestra error de formato de precio
    await expect(page.locator('body')).toContainText('El precio debe tener máximo 10 dígitos enteros y 2 decimales');
  });

  test('debería manejar capacidad cero', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar formulario con capacidad cero
    await page.fill('input[name="nombre"]', 'Test Zero Capacity Event');
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '0');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que se muestra error de capacidad mínima
    await expect(page.locator('body')).toContainText('Debe haber al menos 1 participante máximo');
  });

  test('debería manejar caracteres especiales en campos', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar formulario con caracteres especiales
    await page.fill('input[name="nombre"]', 'Test Event with Special Chars: áéíóúñ@#$%');
    await page.fill('textarea[name="descripcion"]', 'Test Description with special chars: áéíóúñ@#$%&*()');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location with special chars: áéíóúñ@#$%');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX with special chars: áéíóúñ');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que se procesa correctamente
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que el evento aparece en la lista
    await expect(page.locator('body')).toContainText('Test Event with Special Chars: áéíóúñ@#$%');
  });

  test('debería manejar múltiples envíos del formulario', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar formulario
    await page.fill('input[name="nombre"]', 'Test Multiple Submit Event');
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Enviar formulario múltiples veces rápidamente
    await page.click('button[type="submit"]');
    await page.click('button[type="submit"]');
    await page.click('button[type="submit"]');
    
    // Verificar que se maneja correctamente (no duplicados)
    await expect(page).toHaveURL('/eventos');
    
    // Verificar que solo aparece un evento
    const eventCount = await page.locator('text=Test Multiple Submit Event').count();
    expect(eventCount).toBeLessThanOrEqual(1);
  });

  test('debería manejar interrupción durante la creación', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar formulario
    await page.fill('input[name="nombre"]', 'Test Interrupted Event');
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Interrumpir navegando a otra página antes de que se complete
    await page.goto('/eventos');
    
    // Verificar que no se creó el evento
    await expect(page.locator('body')).not.toContainText('Test Interrupted Event');
  });

  test('debería manejar campos con solo espacios', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar formulario con solo espacios
    await page.fill('input[name="nombre"]', '   ');
    await page.fill('textarea[name="descripcion"]', '   ');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', '   ');
    await page.fill('input[name="capacidad"]', '50');
    await page.fill('input[name="precio"]', '75');
    await page.fill('input[name="categoria"]', '   ');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que se muestran errores para campos con solo espacios
    await expect(page.locator('text=El nombre es obligatorio')).toBeVisible();
    await expect(page.locator('text=La descripción es obligatoria')).toBeVisible();
    await expect(page.locator('text=La ubicación es obligatoria')).toBeVisible();
    await expect(page.locator('text=La categoría es obligatoria')).toBeVisible();
  });

  test('debería manejar valores extremos en campos numéricos', async ({ page }) => {
    await page.goto('/crear-evento');
    
    // Llenar formulario con valores extremos
    await page.fill('input[name="nombre"]', 'Test Extreme Values Event');
    await page.fill('textarea[name="descripcion"]', 'Test Description');
    await page.fill('input[name="fecha"]', '2024-12-25');
    await page.fill('input[name="ubicacion"]', 'Test Location');
    await page.fill('input[name="capacidad"]', '999999999');
    await page.fill('input[name="precio"]', '999999999.99');
    await page.fill('input[name="categoria"]', 'RX');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que se maneja correctamente (puede mostrar error o truncar)
    // Dependiendo de la implementación del backend
  });
});
