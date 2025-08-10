#!/usr/bin/env node

const { seedTestData } = require('../utils/database');

/**
 * Script independiente para cargar datos de prueba
 * Útil para CI/CD o ejecución manual
 */
async function main() {
  console.log('🌱 Iniciando carga de datos de prueba...');

  try {
    // Cargar datos de prueba
    await seedTestData();

    console.log('✅ Datos de prueba cargados exitosamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error cargando datos de prueba:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { main };
