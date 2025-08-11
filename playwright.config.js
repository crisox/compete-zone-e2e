// @ts-check
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
           /* Ejecutar tests en archivos en paralelo */
         fullyParallel: true,
         /* Fallar el build en CI si tienes tests rotos */
         forbidOnly: !!process.env.CI,
         /* Retry en CI si tienes tests flaky */
         retries: process.env.CI ? 2 : 0,
         /* Configuración de workers para ejecución paralela AGRESIVA */
         workers: process.env.CI ? 1 : 8, // 8 workers en desarrollo para máxima velocidad
           /* Reporter para usar */
         reporter: [
           ['html', { outputFolder: 'playwright-report' }],
           ['junit', { outputFile: 'test-results/junit.xml' }],
           ['list']
         ],
  /* Directorio compartido para archivos de test */
  use: {
    /* Base URL para usar en acciones como `await page.goto('/')` */
    baseURL: process.env.FRONTEND_URL || 'http://localhost:5175',
    
             /* Configuración de trazas y media OPTIMIZADA */
         trace: 'off', // Desactivado para máxima velocidad
         
         /* Screenshots solo en fallos críticos */
         screenshot: 'only-on-failure',
         
         /* Videos desactivados para máxima velocidad */
         video: 'off',
    
             /* Timeouts globales OPTIMIZADOS */
         actionTimeout: 5000, // Reducido para acciones más rápidas
         navigationTimeout: 15000, // Reducido para navegación más rápida
  },

           /* Configurar proyectos para diferentes navegadores OPTIMIZADOS */
         projects: [
           {
             name: 'chromium',
             use: { 
               ...devices['Desktop Chrome'],
               // Configuraciones agresivas para máxima velocidad
               launchOptions: {
                 args: [
                   '--disable-dev-shm-usage',
                   '--disable-gpu',
                   '--disable-web-security',
                   '--disable-features=VizDisplayCompositor',
                   '--no-sandbox',
                   '--disable-setuid-sandbox',
                   '--disable-background-timer-throttling',
                   '--disable-backgrounding-occluded-windows',
                   '--disable-renderer-backgrounding',
                   '--disable-field-trial-config',
                   '--disable-ipc-flooding-protection'
                 ]
               }
             },
           },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test contra dispositivos móviles */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test contra navegadores con viewport específico */
    {
      name: 'tablet',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],

           /* Directorio de salida para archivos generados */
         outputDir: 'test-results/',

           /* Configuración global de timeouts OPTIMIZADA */
         timeout: 30000, // Reducido para tests más rápidos
         expect: {
           timeout: 5000, // Reducido para assertions más rápidas
         },

  /* Configuración para CI */
  ...(process.env.CI && {
    use: {
      baseURL: process.env.FRONTEND_URL || 'http://localhost:5175',
    },
  }),

           /* Configuración de webServer OPTIMIZADA */
         webServer: process.env.NODE_ENV === 'development' ? {
           command: 'npm run dev',
           url: 'http://localhost:5175',
           reuseExistingServer: !process.env.CI,
           timeout: 60 * 1000, // Reducido para inicio más rápido
         } : undefined,

  /* Configuración de globalSetup y globalTeardown */
  globalSetup: require.resolve('./utils/global-setup.js'),
  globalTeardown: require.resolve('./utils/global-teardown.js'),
});
