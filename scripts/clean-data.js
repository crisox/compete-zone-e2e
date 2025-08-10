#!/usr/bin/env node

const { cleanupDatabase } = require('../utils/database');
const { cleanupMedia } = require('../utils/media-cleanup');

/**
 * Script independiente para limpiar datos de prueba
 * Útil para CI/CD o ejecución manual
 */
async function main() {
  console.log('🧹 Iniciando limpieza de datos de prueba...');

  try {
    // Limpiar base de datos
    console.log('🗄️ Limpiando base de datos...');
    await cleanupDatabase();

    // Limpiar archivos de media
    console.log('📁 Limpiando archivos de media...');
    await cleanupMedia();

    console.log('✅ Limpieza completada exitosamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error en limpieza:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { main };
