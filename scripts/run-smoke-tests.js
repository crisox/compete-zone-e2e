#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');

/**
 * Script para ejecutar tests críticos de smoke ultra-optimizados para Mac M3 Pro
 */
async function runSmokeTests() {
  console.log('🚀 Ejecutando tests críticos de smoke ultra-optimizados para Mac M3 Pro...\n');

  // Configuración ultra-optimizada para Mac M3 Pro
  const cpuCount = os.cpus().length;
  const workers = 20; // Máximo rendimiento
  const timeout = 15000; // Optimizado para feedback rápido

  console.log(`💻 CPU Cores detectados: ${cpuCount}`);
  console.log(`⚡ Workers configurados: ${workers} (máximo rendimiento)`);
  console.log(`⏱️ Timeout: ${timeout}ms (optimizado)`);
  console.log(`🎯 Tipo: Tests críticos de smoke`);
  console.log(`🚀 Configuración: Ultra-optimizada para Mac M3 Pro\n`);

  try {
    console.log('🔍 Verificando servicios disponibles...');
    
    // Verificar que los servicios estén corriendo
    const checkServices = spawn('docker-compose', ['-f', 'docker-compose.e2e.yml', 'ps'], {
      stdio: 'pipe'
    });
    
    await new Promise((resolve, reject) => {
      checkServices.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Servicios Docker verificados');
          resolve();
        } else {
          console.log('❌ Los servicios Docker no están corriendo');
          console.log('💡 Ejecuta primero: npm run test');
          reject(new Error('Servicios no disponibles'));
        }
      });
    });

    console.log('\n🧪 Ejecutando tests críticos de smoke...');
    console.log('📋 Tests incluidos:');
    console.log('   • Verificación de salud del sistema');
    console.log('   • Autenticación básica');
    console.log('   • Acceso a páginas principales');
    console.log(''.padEnd(80, '='));
    
    const child = spawn('npx', ['playwright', 'test',
      'tests/e2e/basic/',
      'tests/e2e/auth/',
      `--workers=${workers}`,
      `--timeout=${timeout}`,
      '--reporter=list',
      '--max-failures=3', // Fail-fast más agresivo para smoke
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
          console.log('\n✅ Tests críticos de smoke completados exitosamente');
          console.log('🎉 Sistema funciona correctamente');
          resolve();
        } else {
          console.log('\n❌ Tests críticos de smoke fallaron');
          console.log('🚨 Se detectaron problemas críticos en el sistema');
          reject(new Error(`Smoke tests failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });

  } catch (error) {
    console.error('❌ Error durante la ejecución:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runSmokeTests();
}

module.exports = { runSmokeTests };