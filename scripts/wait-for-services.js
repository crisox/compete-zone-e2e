#!/usr/bin/env node

const { waitForServices, checkServicesHealth } = require('../utils/wait-for-services');

/**
 * Script independiente para esperar a que los servicios estén listos
 * Útil para CI/CD o ejecución manual
 */
async function main() {
  console.log('🚀 Iniciando verificación de servicios...');

  try {
    // Esperar a que todos los servicios estén listos
    await waitForServices();

    // Verificar estado final
    const health = await checkServicesHealth();
    console.log('📊 Estado final de servicios:', health);

    if (health.postgres && health.api && health.frontend) {
      console.log('✅ Todos los servicios están funcionando correctamente');
      process.exit(0);
    } else {
      console.error('❌ Algunos servicios no están funcionando');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error verificando servicios:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { main };
