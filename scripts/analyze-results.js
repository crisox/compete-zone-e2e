#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script para analizar resultados de tests E2E
 */
function analyzeResults() {
  console.log('📊 ANÁLISIS DE RESULTADOS DE TESTS E2E\n');
  console.log('='.repeat(60));
  
  // Leer el archivo de última ejecución
  const lastRunPath = path.join(__dirname, '../test-results/.last-run.json');
  let lastRun = null;
  
  try {
    if (fs.existsSync(lastRunPath)) {
      lastRun = JSON.parse(fs.readFileSync(lastRunPath, 'utf8'));
    }
  } catch (error) {
    console.log('❌ No se pudo leer el archivo de última ejecución');
  }
  
  // Contar directorios de resultados
  const testResultsDir = path.join(__dirname, '../test-results');
  const directories = fs.readdirSync(testResultsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`📁 Total de ejecuciones de tests: ${directories.length}`);
  
  // Analizar por navegador
  const browserStats = {};
  const statusStats = { passed: 0, failed: 0 };
  
  directories.forEach(dir => {
    const testResultPath = path.join(testResultsDir, dir, 'test-results.json');
    
    if (fs.existsSync(testResultPath)) {
      try {
        const testResult = JSON.parse(fs.readFileSync(testResultPath, 'utf8'));
        
        // Extraer navegador del nombre del directorio
        let browser = 'unknown';
        if (dir.includes('chromium')) browser = 'Chromium';
        else if (dir.includes('firefox')) browser = 'Firefox';
        else if (dir.includes('webkit')) browser = 'WebKit';
        else if (dir.includes('Mobile-Chrome')) browser = 'Mobile Chrome';
        else if (dir.includes('Mobile-Safari')) browser = 'Mobile Safari';
        else if (dir.includes('tablet')) browser = 'Tablet';
        
        if (!browserStats[browser]) {
          browserStats[browser] = { passed: 0, failed: 0 };
        }
        
        if (testResult.status === 'passed') {
          browserStats[browser].passed++;
          statusStats.passed++;
        } else {
          browserStats[browser].failed++;
          statusStats.failed++;
        }
        
      } catch (error) {
        // Ignorar archivos corruptos
      }
    }
  });
  
  // Mostrar estadísticas generales
  const total = statusStats.passed + statusStats.failed;
  const passRate = total > 0 ? ((statusStats.passed / total) * 100).toFixed(1) : 0;
  
  console.log(`\n📈 ESTADÍSTICAS GENERALES:`);
  console.log(`   ✅ Tests pasados: ${statusStats.passed}`);
  console.log(`   ❌ Tests fallidos: ${statusStats.failed}`);
  console.log(`   📊 Total: ${total}`);
  console.log(`   🎯 Tasa de éxito: ${passRate}%`);
  
  // Mostrar estadísticas por navegador
  console.log(`\n🌐 ESTADÍSTICAS POR NAVEGADOR:`);
  Object.entries(browserStats).forEach(([browser, stats]) => {
    const total = stats.passed + stats.failed;
    const rate = total > 0 ? ((stats.passed / total) * 100).toFixed(1) : 0;
    console.log(`   ${browser}:`);
    console.log(`     ✅ Pasados: ${stats.passed}`);
    console.log(`     ❌ Fallidos: ${stats.failed}`);
    console.log(`     📊 Tasa: ${rate}%`);
  });
  
  // Mostrar estado de la última ejecución
  if (lastRun) {
    console.log(`\n🔄 ÚLTIMA EJECUCIÓN:`);
    console.log(`   Estado: ${lastRun.status === 'failed' ? '❌ Fallida' : '✅ Exitosa'}`);
    console.log(`   Tests fallidos: ${lastRun.failedTests ? lastRun.failedTests.length : 0}`);
  }
  
  // Mostrar problemas comunes
  console.log(`\n🔍 PROBLEMAS DETECTADOS:`);
  console.log(`   • Problema de texto: "Iniciar Sesión" vs "Iniciar sesión"`);
  console.log(`   • Elementos no encontrados: [data-testid="email-error"]`);
  console.log(`   • Enlaces no encontrados: a[href="/auth/register"]`);
  console.log(`   • Timeouts en formularios de login`);
  
  console.log(`\n💡 RECOMENDACIONES:`);
  console.log(`   • Revisar selectores de elementos en el frontend`);
  console.log(`   • Verificar que los data-testid existan`);
  console.log(`   • Corregir enlaces de navegación`);
  console.log(`   • Ajustar timeouts si es necesario`);
  
  console.log('\n' + '='.repeat(60));
}

// Ejecutar si se llama directamente
if (require.main === module) {
  analyzeResults();
}

module.exports = { analyzeResults };
