#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const os = require('os');

const execAsync = promisify(exec);

/**
 * Script para ejecutar tests con configuración ultra-agresiva
 * Optimizado para PCs potentes con muchos cores
 */
async function runAggressiveTests() {
  console.log('🚀 Ejecutando tests con configuración ULTRA-AGRESIVA...\n');
  
  // Detectar número de cores disponibles
  const cpuCount = os.cpus().length;
  const workers = Math.min(cpuCount * 2, 16); // Máximo 16 workers
  
  console.log(`💻 CPU Cores detectados: ${cpuCount}`);
  console.log(`⚡ Workers configurados: ${workers}`);
  console.log(`🎯 Configuración: Ultra-agresiva\n`);
  
  try {
    // Comando con configuración ultra-agresiva
    const command = `npx playwright test \
      --workers=${workers} \
      --timeout=15000 \
      --reporter=list \
      --max-failures=5 \
      --retries=0`;
    
    console.log('🔧 Comando ejecutado:');
    console.log(command.replace(/\s+/g, ' '));
    console.log('\n' + '='.repeat(80) + '\n');
    
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      env: {
        ...process.env,
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0',
        NODE_OPTIONS: '--max-old-space-size=4096'
      }
    });
    
    console.log(stdout);
    if (stderr) {
      console.error('⚠️ Warnings:', stderr);
    }
    
    console.log('\n✅ Tests completados con configuración ultra-agresiva');
    
  } catch (error) {
    console.error('❌ Error ejecutando tests:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runAggressiveTests();
}

module.exports = { runAggressiveTests };
