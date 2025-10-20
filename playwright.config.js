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
         /* Configuración de workers ultra-optimizada para Mac M3 Pro */
         workers: process.env.CI ? 4 : 20, // 20 workers para máximo rendimiento en Mac M3 Pro
           /* Reporter para usar */
         reporter: [
           ['html', { outputFolder: 'playwright-report' }],
           ['junit', { outputFile: 'test-results/junit.xml' }],
           ['list']
         ],
  /* Directorio compartido para archivos de test */
  use: {
    /* Base URL para usar en acciones como `await page.goto('/')` */
    baseURL: process.env.FRONTEND_URL || 'http://localhost:5173',
    
             /* Configuración de trazas y media OPTIMIZADA */
         trace: 'off', // Desactivado para máxima velocidad
         
         /* Screenshots solo en fallos críticos */
         screenshot: 'only-on-failure',
         
         /* Videos desactivados para máxima velocidad */
         video: 'off',
    
             /* Timeouts globales ultra-optimizados para Mac M3 Pro */
         actionTimeout: 8000, // Optimizado para Mac M3 Pro
         navigationTimeout: 12000, // Reducido para navegación más rápida
         
         /* Optimizaciones específicas para macOS */
         ...(process.platform === 'darwin' && {
           launchOptions: {
             args: [
               '--disable-dev-shm-usage',
               '--disable-web-security',
               '--disable-features=VizDisplayCompositor',
               '--no-sandbox',
               '--disable-setuid-sandbox',
               '--disable-background-timer-throttling',
               '--disable-backgrounding-occluded-windows',
               '--disable-renderer-backgrounding',
               '--disable-field-trial-config',
               '--disable-ipc-flooding-protection',
               '--enable-automation',
               '--disable-blink-features=AutomationControlled'
             ]
           }
         })
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

           /* Configuración global de timeouts ultra-optimizada para Mac M3 Pro */
         timeout: 15000, // Reducido para feedback más rápido
         expect: {
           timeout: 8000, // Optimizado para Mac M3 Pro
         },

  /* Configuración para CI */
  ...(process.env.CI && {
    use: {
      baseURL: process.env.FRONTEND_URL || 'http://localhost:5173',
    },
  }),

           /* Configuración de webServer OPTIMIZADA */
         webServer: process.env.NODE_ENV === 'development' && !process.env.DOCKER_TESTS ? {
           command: 'npm run dev',
           url: 'http://localhost:5173',
           reuseExistingServer: !process.env.CI,
           timeout: 60 * 1000, // Reducido para inicio más rápido
         } : undefined,

  /* Configuración de globalSetup y globalTeardown */
  globalSetup: require.resolve('./utils/global-setup.js'),
  globalTeardown: require.resolve('./utils/global-teardown.js'),
});
