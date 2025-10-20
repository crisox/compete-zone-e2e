require('dotenv').config();
const os = require('os');

/**
 * Configuración centralizada para pruebas E2E
 * Gestiona toda la configuración desde variables de entorno y valores por defecto
 */
class Config {
  constructor() {
    this.performance = this.getPerformanceConfig();
    this.services = this.getServicesConfig();
    this.database = this.getDatabaseConfig();
    this.playwright = this.getPlaywrightConfig();
    this.logging = this.getLoggingConfig();
    this.security = this.getSecurityConfig();
  }

  /**
   * Configuración de rendimiento basada en recursos del sistema
   */
  getPerformanceConfig() {
    const cpuCount = os.cpus().length;
    const memoryGB = os.totalmem() / (1024 ** 3);
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

    // Workers dinámicos basados en recursos
    let workers;
    if (isCI) {
      workers = Math.min(cpuCount, 4); // CI: conservador
    } else if (memoryGB < 8) {
      workers = Math.min(cpuCount, 4); // Baja memoria
    } else if (memoryGB < 16) {
      workers = Math.min(cpuCount, 8); // Memoria media
    } else {
      workers = Math.min(cpuCount, 20); // Alta memoria - Ultra agresivo
    }

    return {
      workers,
      timeout: isCI ? 30000 : 15000,
      maxFailures: isCI ? 10 : 5,
      retries: isCI ? 2 : 0,
      cpuCount,
      memoryGB,
      isCI,
      platform: process.platform,
      macOptimizations: process.platform === 'darwin' ? {
        args: [
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI,BlinkGenPropertyTrees'
        ]
      } : {}
    };
  }

  /**
   * Configuración de servicios externos
   */
  getServicesConfig() {
    return {
      apiUrl: process.env.API_URL || 'http://localhost:8082',
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
      dozzleUrl: process.env.DOZZLE_URL || 'http://localhost:8086',
      mediaUrl: process.env.MEDIA_URL || 'http://localhost:8081',
      timeout: parseInt(process.env.API_TIMEOUT) || 10000,
      retries: parseInt(process.env.API_RETRIES) || 3
    };
  }

  /**
   * Configuración de base de datos
   */
  getDatabaseConfig() {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5435,
      database: process.env.DB_NAME || 'competezone_e2e',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 5000,
      queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT) || 30000,
      ssl: process.env.DB_SSL === 'true'
    };
  }

  /**
   * Configuración de Playwright
   */
  getPlaywrightConfig() {
    return {
      browsers: process.env.PLAYWRIGHT_BROWSERS || 'chromium',
      headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
      timeout: parseInt(process.env.PLAYWRIGHT_TIMEOUT) || 60000,
      retries: parseInt(process.env.PLAYWRIGHT_RETRIES) || 2,
      reporter: process.env.PLAYWRIGHT_REPORTER || 'list',
      outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR || 'test-results',
      trace: process.env.PLAYWRIGHT_TRACE === 'true' ? 'on' : 'off',
      video: process.env.PLAYWRIGHT_VIDEO === 'true' ? 'on' : 'off'
    };
  }

  /**
   * Configuración de logging
   */
  getLoggingConfig() {
    return {
      level: process.env.LOG_LEVEL || 'info',
      file: process.env.LOG_FILE || 'reports/playwright.log',
      format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
      timestamp: true,
      colors: process.env.NODE_ENV !== 'production'
    };
  }

  /**
   * Configuración de seguridad
   */
  getSecurityConfig() {
    return {
      validateInputs: process.env.NODE_ENV === 'production',
      sanitizeLogs: process.env.SANITIZE_LOGS !== 'false',
      maxFileSize: parseInt(process.env.MEDIA_MAX_SIZE_MB) || 10,
      allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)
    };
  }

  /**
   * Configuración de datos de prueba
   */
  getTestDataConfig() {
    return {
      admin: {
        email: process.env.TEST_ADMIN_EMAIL || 'admin@competezone.test',
        password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
        name: process.env.TEST_ADMIN_NAME || 'Admin Test',
        role: process.env.TEST_ADMIN_ROLE || 'admin'
      },
      athlete: {
        email: process.env.TEST_ATHLETE_EMAIL || 'athlete@competezone.test',
        password: process.env.TEST_ATHLETE_PASSWORD || 'athlete123',
        name: process.env.TEST_ATHLETE_NAME || 'Athlete Test',
        role: process.env.TEST_ATHLETE_ROLE || 'athlete',
        bio: process.env.TEST_ATHLETE_BIO || 'Test athlete bio',
        location: process.env.TEST_ATHLETE_LOCATION || 'Madrid, Spain'
      },
      gym: {
        email: process.env.TEST_GYM_EMAIL || 'gym@competezone.test',
        password: process.env.TEST_GYM_PASSWORD || 'gym123',
        name: process.env.TEST_GYM_NAME || 'Test Gym',
        role: process.env.TEST_GYM_ROLE || 'gym',
        description: process.env.TEST_GYM_DESCRIPTION || 'Test gym description',
        address: process.env.TEST_GYM_ADDRESS || 'Test Address 123',
        phone: process.env.TEST_GYM_PHONE || '+34 123 456 789'
      }
    };
  }

  /**
   * Obtener configuración completa como objeto plano
   */
  getAllConfig() {
    return {
      performance: this.performance,
      services: this.services,
      database: this.database,
      playwright: this.playwright,
      logging: this.logging,
      security: this.security,
      testData: this.getTestDataConfig()
    };
  }

  /**
   * Validar configuración actual
   */
  validate() {
    const errors = [];

    // Validar puertos
    if (this.database.port < 1 || this.database.port > 65535) {
      errors.push('Database port must be between 1 and 65535');
    }

    // Validar URLs
    try {
      new URL(this.services.apiUrl);
      new URL(this.services.frontendUrl);
    } catch (error) {
      errors.push('Invalid API or Frontend URL format');
    }

    // Validar timeouts
    if (this.performance.timeout < 5000) {
      errors.push('Timeout must be at least 5000ms');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtener summary de configuración para logging
   */
  getSummary() {
    return {
      environment: process.env.NODE_ENV || 'test',
      workers: this.performance.workers,
      timeout: this.performance.timeout,
      platform: this.performance.platform,
      services: {
        api: this.services.apiUrl,
        frontend: this.services.frontendUrl,
        database: `${this.database.host}:${this.database.port}/${this.database.database}`
      }
    };
  }
}

// Exportar instancia singleton
const config = new Config();

module.exports = {
  config,
  Config
};