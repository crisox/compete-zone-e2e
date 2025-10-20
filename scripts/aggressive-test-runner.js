#!/usr/bin/env node

const { BaseTestRunner } = require('./base-test-runner');

/**
 * Test Runner con configuración ultra-optimizada para rendimiento máximo
 */
class AggressiveTestRunner extends BaseTestRunner {
  constructor(options = {}) {
    super({
      mode: 'aggressive',
      description: '🚀 Ultra-Optimized Aggressive Test Runner',
      timeout: 600000, // 10 minutos para modo agresivo
      cleanup: false, // No limpiar automáticamente
      ...options
    });
  }

  /**
   * Sobreescribir configuración para modo agresivo
   */
  getDefaultOptions() {
    return {
      ...super.getDefaultOptions(),
      mode: 'aggressive',
      description: '🚀 Ultra-Optimized Aggressive Test Runner',
      timeout: 600000,
      verbose: true,
      cleanup: false
    };
  }

  /**
   * Configuración específica para modo agresivo
   */
  buildPlaywrightArgs() {
    const args = super.buildPlaywrightArgs();

    // Añadir configuraciones agresivas específicas
    args.push('--reporter=list'); // Reporter en tiempo real
    args.push('--max-failures=5'); // Fail fast

    // Si es Mac M3 Pro, añadir optimizaciones específicas
    if (process.platform === 'darwin' && process.arch === 'arm64') {
      console.log('🍎 Detected Mac M3 Pro - applying ultra-optimizations...');
    }

    return args;
  }

  /**
   * Variables de entorno específicas para modo agresivo
   */
  getPlaywrightEnv() {
    return {
      ...super.getPlaywrightEnv(),
      // Forzar máximas optimizaciones
      FORCE_MAX_WORKERS: 'true',
      DISABLE_VIDEO: 'true',
      DISABLE_TRACE: 'true',
      // Configuración de navegador optimizada
      CHROME_FLAGS: '--disable-dev-shm-usage,--disable-gpu,--disable-software-rasterizer,--disable-background-timer-throttling,--disable-backgrounding-occluded-windows,--disable-renderer-backgrounding'
    };
  }

  /**
   * Logging mejorado para modo agresivo
   */
  printHeader() {
    super.printHeader();

    console.log('\n⚡ AGGRESSIVE MODE ACTIVATED');
    console.log('🎯 Configuration:');
    console.log(`   - Workers: ${this.config.performance.workers} (auto-detected)`);
    console.log(`   - Timeout: ${this.config.performance.timeout}ms (optimized)`);
    console.log(`   - Max Failures: 5 (fail-fast)`);
    console.log(`   - Reporter: list (real-time)`);
    console.log(`   - Retries: ${this.config.performance.retries} (fast execution)`);

    if (this.config.performance.memoryGB) {
      console.log(`   - Available Memory: ${this.config.performance.memoryGB}GB`);
    }

    console.log(`   - CPU Cores: ${this.config.performance.cpuCount}`);
    console.log('\n🚀 Starting ultra-optimized execution...\n');
  }

  /**
   * Manejo específico para modo agresivo
   */
  async handleError(error) {
    // En modo agresivo, log más detallado para debugging rápido
    console.error('\n💥 AGGRESSIVE MODE ERROR DETECTED');
    console.error('================================================================================');

    await super.handleError(error);

    // Sugerencias específicas para modo agresivo
    console.error('\n🔧 AGGRESSIVE MODE RECOMMENDATIONS:');
    console.error('   1. Consider reducing worker count if memory issues persist');
    console.error('   2. Check Docker resource limits');
    console.error('   3. Verify all services are healthy before running');
    console.error('   4. Use --verbose flag for detailed debugging');
  }

  /**
   * Resumen mejorado para modo agresivo
   */
  printSummary() {
    const duration = Date.now() - this.startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    console.log('================================================================================');
    console.log('🚀 AGGRESSIVE MODE EXECUTION SUMMARY');
    console.log('================================================================================');
    console.log(`⏱️ Total Duration: ${minutes}m ${seconds}s`);
    console.log(`💻 Workers Used: ${this.config.performance.workers}`);
    console.log(`🖥️ Platform: ${this.config.performance.platform} (${this.config.performance.cpuCount} cores)`);

    if (this.config.performance.memoryGB) {
      console.log(`💾 Available Memory: ${this.config.performance.memoryGB}GB`);
    }

    console.log(`✅ Passed: ${this.stats.passed}`);
    console.log(`❌ Failed: ${this.stats.failed}`);
    console.log(`⏭️ Skipped: ${this.stats.skipped}`);
    console.log(`📈 Total: ${this.stats.total}`);

    // Métricas de rendimiento
    const testsPerMinute = this.stats.total > 0 ? (this.stats.total / (duration / 60000)).toFixed(1) : 0;
    console.log(`⚡ Performance: ${testsPerMinute} tests/minute`);

    if (this.stats.failed === 0) {
      console.log('\n🎉🎉🎉 ALL TESTS PASSED IN AGGRESSIVE MODE! 🎉🎉🎉');
      console.log('✨ Ultra-optimized configuration successful!');
    } else {
      console.log(`\n❌ ${this.stats.failed} test(s) failed in aggressive mode`);
      console.log('🔧 Consider reducing parallelization or increasing timeouts');
    }

    console.log('================================================================================');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const runner = new AggressiveTestRunner();

  runner.run()
    .then((stats) => {
      process.exit(stats.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('💥 Aggressive test runner failed:', error.message);
      process.exit(1);
    });
}

module.exports = { AggressiveTestRunner };