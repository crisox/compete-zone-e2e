#!/usr/bin/env node

const { spawn } = require('child_process');
const { config } = require('../utils/config');
const { ErrorHandler, ServiceError } = require('../utils/error-handler');
const { waitForServices } = require('../utils/wait-for-services');

/**
 * Clase base para ejecutores de tests con configuración unificada
 */
class BaseTestRunner {
  constructor(options = {}) {
    this.options = {
      ...this.getDefaultOptions(),
      ...options
    };

    this.config = config;
    this.startTime = Date.now();
    this.stats = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0
    };
  }

  /**
   * Opciones por defecto
   */
  getDefaultOptions() {
    return {
      mode: 'base',
      description: 'Base test runner',
      timeout: 300000, // 5 minutos
      verbose: false,
      dryRun: false,
      servicesOnly: false,
      skipServices: false,
      skipDataLoad: false
    };
  }

  /**
   * Ejecutar flujo completo de pruebas
   */
  async run() {
    try {
      this.printHeader();

      // Validar configuración
      this.validateConfiguration();

      // Iniciar servicios Docker
      if (!this.options.skipServices) {
        await this.startServices();
      }

      // Esperar que los servicios estén listos
      if (!this.options.servicesOnly && !this.options.skipServices) {
        await this.ensureServicesReady();
      }

      // Cargar datos de prueba
      if (!this.options.servicesOnly && !this.options.skipDataLoad) {
        await this.loadTestData();
      }

      // Ejecutar tests
      if (!this.options.servicesOnly) {
        await this.executeTests();
      }

      // Mostrar resumen
      this.printSummary();

      return this.stats;

    } catch (error) {
      await this.handleError(error);
      throw error;
    } finally {
      // Cleanup
      await this.cleanup();
    }
  }

  /**
   * Imprimir cabecera informativa
   */
  printHeader() {
    console.log(`🚀 ${this.options.description}`);
    console.log('================================================================================');

    const summary = this.config.getSummary();
    console.log(`📊 Environment: ${summary.environment}`);
    console.log(`💻 Workers: ${summary.workers}`);
    console.log(`⏱️ Timeout: ${summary.timeout}ms`);
    console.log(`🖥️ Platform: ${summary.platform}`);
    console.log(`🔗 Services:`);
    console.log(`   - API: ${summary.services.api}`);
    console.log(`   - Frontend: ${summary.services.frontend}`);
    console.log(`   - Database: ${summary.services.database}`);
    console.log('================================================================================');
  }

  /**
   * Validar configuración
   */
  validateConfiguration() {
    const validation = this.config.validate();

    if (!validation.isValid) {
      throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }

    console.log('✅ Configuration validation passed');
  }

  /**
   * Iniciar servicios Docker
   */
  async startServices() {
    console.log('🐳 Starting Docker services...');

    return new Promise((resolve, reject) => {
      const dockerCompose = spawn('docker-compose', [
        '-f', 'docker-compose.e2e.yml',
        'up', '-d'
      ], {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      let output = '';
      let errorOutput = '';

      dockerCompose.stdout.on('data', (data) => {
        output += data.toString();
      });

      dockerCompose.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      dockerCompose.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Docker services started');
          resolve(output);
        } else {
          console.error('❌ Failed to start Docker services');
          console.error('Error output:', errorOutput);
          reject(new Error(`Docker compose failed with code ${code}`));
        }
      });
    });
  }

  /**
   * Esperar que los servicios estén listos
   */
  async ensureServicesReady() {
    console.log('⏳ Waiting for services to be ready...');

    await ErrorHandler.withRetry(
      () => waitForServices(),
      3,
      5000,
      {
        context: 'service-wait',
        onRetry: (error, attempt, delay) => {
          console.log(`🔄 Service check attempt ${attempt} failed, retrying in ${delay}ms...`);
        }
      }
    );

    console.log('✅ All services are ready');
  }

  /**
   * Cargar datos de prueba
   */
  async loadTestData() {
    console.log('📊 Loading test data...');

    // Implementar lógica de carga de datos si es necesario
    // Por ahora solo verificamos que podemos conectar a la BD
    const { seedTestData } = require('../utils/database');

    try {
      await seedTestData();
      console.log('✅ Test data loaded successfully');
    } catch (error) {
      throw new Error(`Failed to load test data: ${error.message}`);
    }
  }

  /**
   * Ejecutar tests Playwright
   */
  async executeTests() {
    console.log('🧪 Executing tests...');

    const playwrightArgs = this.buildPlaywrightArgs();

    return new Promise((resolve, reject) => {
      const playwright = spawn('npx', ['playwright', 'test', ...playwrightArgs], {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: {
          ...process.env,
          ...this.getPlaywrightEnv()
        }
      });

      playwright.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Tests completed successfully');
          resolve(code);
        } else {
          console.error(`❌ Tests failed with code ${code}`);
          reject(new Error(`Playwright tests failed with code ${code}`));
        }
      });

      playwright.on('error', (error) => {
        reject(new Error(`Playwright process error: ${error.message}`));
      });
    });
  }

  /**
   * Construir argumentos para Playwright
   */
  buildPlaywrightArgs() {
    const args = [];

    // Workers
    if (this.config.performance.workers) {
      args.push(`--workers=${this.config.performance.workers}`);
    }

    // Reporter
    if (this.config.playwright.reporter) {
      args.push(`--reporter=${this.config.playwright.reporter}`);
    }

    // Timeout
    if (this.config.performance.timeout) {
      args.push(`--timeout=${this.config.performance.timeout}`);
    }

    // Retries
    if (this.config.performance.retries !== undefined) {
      args.push(`--retries=${this.config.performance.retries}`);
    }

    // Headed mode para debug
    if (!this.config.playwright.headless) {
      args.push('--headed');
    }

    // Output directory
    if (this.config.playwright.outputDir) {
      args.push(`--output=${this.config.playwright.outputDir}`);
    }

    // Test pattern específico si se proporciona
    if (this.options.testPattern) {
      args.push(this.options.testPattern);
    }

    return args;
  }

  /**
   * Variables de entorno para Playwright
   */
  getPlaywrightEnv() {
    return {
      NODE_ENV: this.config.performance.isCI ? 'ci' : 'test',
      ...this.config.getAllConfig()
    };
  }

  /**
   * Manejar errores
   */
  async handleError(error) {
    const wrappedError = ErrorHandler.wrapError(error, this.options.mode);

    console.error('\n❌ ERROR OCCURRED:');
    console.error(`Type: ${wrappedError.name}`);
    console.error(`Message: ${wrappedError.message}`);

    if (wrappedError.details && Object.keys(wrappedError.details).length > 0) {
      console.error('Details:', wrappedError.details);
    }

    // Logging estructurado
    ErrorHandler.logError(wrappedError, {
      mode: this.options.mode,
      duration: Date.now() - this.startTime,
      config: this.config.getSummary()
    });

    // Intentar recuperación si es error de servicio
    if (wrappedError instanceof ServiceError) {
      try {
        await ErrorHandler.handleServiceFailure(wrappedError.serviceName, wrappedError);
      } catch (recoveryError) {
        console.error('❌ Recovery failed:', recoveryError.message);
      }
    }
  }

  /**
   * Imprimir resumen final
   */
  printSummary() {
    const duration = Date.now() - this.startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    console.log('================================================================================');
    console.log('📊 EXECUTION SUMMARY');
    console.log('================================================================================');
    console.log(`⏱️ Duration: ${minutes}m ${seconds}s`);
    console.log(`✅ Passed: ${this.stats.passed}`);
    console.log(`❌ Failed: ${this.stats.failed}`);
    console.log(`⏭️ Skipped: ${this.stats.skipped}`);
    console.log(`📈 Total: ${this.stats.total}`);

    if (this.stats.failed === 0) {
      console.log('🎉 ALL TESTS PASSED!');
    } else {
      console.log(`❌ ${this.stats.failed} test(s) failed`);
    }

    console.log('================================================================================');
  }

  /**
   * Cleanup final
   */
  async cleanup() {
    if (this.options.cleanup) {
      console.log('🧹 Cleaning up...');

      try {
        await this.stopServices();
        console.log('✅ Cleanup completed');
      } catch (error) {
        console.warn('⚠️ Cleanup warning:', error.message);
      }
    }
  }

  /**
   * Detener servicios Docker
   */
  async stopServices() {
    return new Promise((resolve, reject) => {
      const dockerCompose = spawn('docker-compose', [
        '-f', 'docker-compose.e2e.yml',
        'down', '-v'
      ], {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      dockerCompose.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Docker down failed with code ${code}`));
        }
      });
    });
  }
}

module.exports = { BaseTestRunner };
