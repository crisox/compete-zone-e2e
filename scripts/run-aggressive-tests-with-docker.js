#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const os = require('os');

const execAsync = promisify(exec);

/**
 * Script para ejecutar tests agresivos con gestión completa de servicios Docker
 * Inicia los servicios, espera que estén listos, ejecuta tests y limpia
 */
async function runAggresiveTestsWithDocker() {
  console.log('🚀 Ejecutando tests agresivos con gestión Docker...\n');

  // Configuración ultra-optimizada para Mac M3 Pro (12 cores de rendimiento + 18 cores GPU)
  const cpuCount = os.cpus().length;
  const workers = 10; // Optimizado específicamente para Mac M3 Pro
  const timeout = 15000; // Reducido para feedback más rápido
  const maxFailures = 5; // Fail-fast para detener rápidamente si hay problemas críticos

  console.log(`💻 CPU Cores detectados: ${cpuCount}`);
  console.log(`⚡ Workers configurados: ${workers} (máximo rendimiento Mac M3 Pro)`);
  console.log(`⏱️ Timeout: ${timeout}ms (optimizado)`);
  console.log(`🎯 Max failures: ${maxFailures} (fail-fast)`);
  console.log(`🚀 Configuración: Ultra-optimizada para Mac M3 Pro\n`);

  try {
    // 1. Iniciar servicios Docker
    console.log('🐳 Iniciando servicios Docker...');
    await execAsync('docker-compose -f docker-compose.e2e.yml up -d', {
      timeout: 60000
    });
    console.log('✅ Servicios Docker iniciados\n');

    // 2. Esperar a que los servicios estén listos
    console.log('⏳ Esperando que los servicios estén disponibles...');
    console.log('🔧 Ejecutando: node scripts/wait-for-services.js');
    
    try {
      const { stdout, stderr } = await execAsync('node scripts/wait-for-services.js', {
        timeout: 180000 // 3 minutos máximo
      });
      console.log('✅ wait-for-services.js completado');
      if (stdout) console.log('📋 Output:', stdout);
      if (stderr) console.log('⚠️ Warnings:', stderr);
    } catch (error) {
      console.error('❌ Error en wait-for-services.js:', error.message);
      throw error;
    }
    
    console.log('✅ Todos los servicios están listos\n');

    // 3. Cargar datos de prueba
    console.log('📊 Cargando datos de prueba...');
    await execAsync('node scripts/seed-data.js', {
      timeout: 60000
    });
    console.log('✅ Datos de prueba cargados\n');

    // 4. Ejecutar tests con configuración ultra-optimizada para Mac M3 Pro
    console.log('🧪 Ejecutando tests en modo ultra-optimizado...');
    
    // Optimización específica para Mac M3 Pro
    console.log('🎬 Iniciando ejecución de tests Playwright...');
    console.log('📊 Se ejecutarán todos los tests disponibles con la configuración ultra-optimizada');
    console.log(`⚡ Workers: ${workers} (máximo rendimiento Mac M3 Pro)`);
    console.log(`⏱️ Timeout: ${timeout}ms (optimizado para velocidad)`);
    console.log(`🎯 Max failures: ${maxFailures} (fail-fast)`);
    console.log('📋 Reporter: list (tiempo real)');
    console.log('🔄 Retries: 0 (fail-fast)');
    console.log(''.padEnd(80, '='));
    
    const child = spawn('npx', ['playwright', 'test',
      `--workers=${workers}`,
      `--timeout=${timeout}`,
      '--reporter=list',
      `--max-failures=${maxFailures}`,
      '--retries=0'
    ], {
      stdio: 'inherit', // Mostrar output en tiempo real
      env: {
        ...process.env,
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0',
        NODE_OPTIONS: '--max-old-space-size=6144',
        PWDEBUG: '0',
        DOCKER_TESTS: 'true',
        ...(process.platform === 'darwin' && {
          PLAYWRIGHT_BROWSERS_PATH: '0'
        })
      }
    });

    // Esperar a que el proceso termine
    await new Promise((resolve, reject) => {
      child.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Tests ejecutados exitosamente');
          resolve();
        } else {
          reject(new Error(`Tests failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });

    console.log('\n✅ Tests completados exitosamente');

    // 5. Generar reportes si existen
    console.log('\n📊 Generando reportes...');
    try {
      await execAsync('ls -la playwright-report/ 2>/dev/null || echo "No hay reportes generados"', { timeout: 5000 });
      console.log('📄 Reportes disponibles en playwright-report/');
    } catch (error) {
      console.log('📊 No se pudieron mostrar los reportes (puede ser normal)');
    }

  } catch (error) {
    console.error('❌ Error durante la ejecución:', error.message);

    // Mostrar logs de servicios para diagnóstico
    console.log('\n📋 Mostrando logs de servicios para diagnóstico...');
    try {
      const { stdout: logs } = await execAsync('docker-compose -f docker-compose.e2e.yml logs --tail=50', {
        timeout: 30000
      });
      console.log(logs);
    } catch (logError) {
      console.error('No se pudieron obtener los logs:', logError.message);
    }

    process.exit(1);

  } finally {
    // 6. Limpiar servicios Docker (opcional, comentado para depuración)
    console.log('\n🧹 Limpiando servicios Docker...');
    try {
      await execAsync('docker-compose -f docker-compose.e2e.yml down -v', {
        timeout: 60000
      });
      console.log('✅ Servicios Docker detenidos y limpiados');
    } catch (cleanupError) {
      console.error('⚠️ Error durante la limpieza:', cleanupError.message);
      console.log('💡 Puedes limpiar manualmente con: npm run teardown:services');
    }
  }
}

/**
 * Ejecutar solo los tests (asumiendo que los servicios ya están corriendo)
 */
async function runTestsOnly() {
  console.log('🧪 Ejecutando tests ultra-optimizados para Mac M3 Pro (servicios ya deberían estar corriendo)...\n');

  const workers = 20; // Optimizado para Mac M3 Pro
  const timeout = 15000; // Optimizado
  const maxFailures = 5; // Fail-fast

  console.log(`⚡ Workers configurados: ${workers} (máximo rendimiento)`);
  console.log(`⏱️ Timeout: ${timeout}ms (optimizado)`);
  console.log(`🎯 Max failures: ${maxFailures} (fail-fast)`);
  console.log('🔄 Retries: 0 (fail-fast)');

  try {
    console.log('\n🎬 Iniciando ejecución de tests Playwright...');
    console.log('📊 Se ejecutarán todos los tests disponibles');
    console.log(`⚡ Workers: ${workers} (máximo rendimiento Mac M3 Pro)`);
    console.log(`⏱️ Timeout: ${timeout}ms (optimizado para velocidad)`);
    console.log(`🎯 Max failures: ${maxFailures} (fail-fast)`);
    console.log('📋 Reporter: list (tiempo real)');
    console.log(''.padEnd(80, '='));
    
    const child = spawn('npx', ['playwright', 'test',
      `--workers=${workers}`,
      `--timeout=${timeout}`,
      '--reporter=list',
      `--max-failures=${maxFailures}`,
      '--retries=0'
    ], {
      stdio: 'inherit', // Mostrar output en tiempo real
      env: {
        ...process.env,
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0',
        NODE_OPTIONS: '--max-old-space-size=6144',
        PWDEBUG: '0',
        DOCKER_TESTS: 'true',
        ...(process.platform === 'darwin' && {
          PLAYWRIGHT_BROWSERS_PATH: '0'
        })
      }
    });

    // Esperar a que el proceso termine
    await new Promise((resolve, reject) => {
      child.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Tests ejecutados exitosamente');
          resolve();
        } else {
          reject(new Error(`Tests failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });

    console.log('\n✅ Tests completados');

  } catch (error) {
    console.error('❌ Error ejecutando tests:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help' || '-h')) {
    console.log(`
Uso: node scripts/run-aggressive-tests-with-docker.js [opciones]

Opciones:
  --tests-only    Ejecutar solo los tests (asume que los servicios Docker ya están corriendo)
  --help, -h      Muestra esta ayuda

Ejemplos:
  npm run test:aggressive:docker           # Inicia servicios + ejecuta tests + limpia
  npm run test:aggressive:docker --tests-only  # Solo ejecuta tests
`);
    process.exit(0);
  }

  if (args.includes('--tests-only')) {
    runTestsOnly();
  } else {
    runAggresiveTestsWithDocker();
  }
}

module.exports = {
  runAggresiveTestsWithDocker,
  runTestsOnly
};