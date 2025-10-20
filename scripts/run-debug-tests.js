#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');

/**
 * Script para ejecutar tests en modo debug ultra-optimizados para Mac M3 Pro
 */
async function runDebugTests() {
  console.log('🔍 Ejecutando tests en modo debug ultra-optimizados para Mac M3 Pro...\n');

  // Configuración especial para debug
  const cpuCount = os.cpus().length;
  const workers = 1; // Un solo worker para debug
  const timeout = 60000; // Timeout extendido para debug

  console.log(`💻 CPU Cores detectados: ${cpuCount}`);
  console.log(`⚡ Workers configurados: ${workers} (modo debug)`);
  console.log(`⏱️ Timeout: ${timeout}ms (extendido para debug)`);
  console.log(`🎯 Tipo: Tests en modo debug interactivo`);
  console.log(`🚀 Configuración: Debug optimizado para Mac M3 Pro\n`);

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

    console.log('\n🔧 Iniciando modo debug interactivo...');
    console.log('📋 Características del modo debug:');
    console.log('   • Ejecución paso a paso');
    console.log('   • Browser visible (headed mode)');
    console.log('   • Timeout extendido (60s)');
    console.log('   • Un solo worker para mejor control');
    console.log('   • Snapshots y traces habilitados');
    console.log('   • Pausa en puntos de interrupción');
    console.log(''.padEnd(80, '='));
    console.log('💡 Usa los controles del Playwright Inspector para depurar');
    console.log(''.padEnd(80, '='));
    
    const child = spawn('npx', ['playwright', 'test',
      '--headed', // Browser visible
      '--debug', // Modo debug interactivo
      '--workers=1', // Un solo worker
      '--timeout=60000', // Timeout extendido
      '--reporter=list',
      '--retries=0',
      '--trace=on', // Habilitar traces
      '--video=retain-on-failure' // Video en fallos
    ], {
      stdio: 'inherit', // Mostrar output en tiempo real
      env: {
        ...process.env,
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0',
        NODE_OPTIONS: '--max-old-space-size=4096',
        PWDEBUG: '1', // Debug mode habilitado
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
          console.log('\n✅ Debug completado exitosamente');
          console.log('📊 Revisa los traces y videos en test-results/');
          resolve();
        } else {
          console.log('\n🔍 Debug finalizado con errores');
          console.log('📊 Revisa los traces y videos en test-results/ para análisis');
          console.log('💡 Usa los resultados para identificar y corregir los problemas');
          reject(new Error(`Debug tests failed with exit code ${code}`));
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
  runDebugTests();
}

module.exports = { runDebugTests };