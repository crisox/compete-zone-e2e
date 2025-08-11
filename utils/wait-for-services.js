const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Espera a que todos los servicios estén disponibles
 */
async function waitForServices() {
  console.log('⏳ Esperando que los servicios estén listos...');

  const maxRetries = 30; // 5 minutos máximo
  const retryInterval = 10000; // 10 segundos

  // Verificar PostgreSQL
  await waitForPostgreSQL(maxRetries, retryInterval);

  // Verificar API
  await waitForAPI(maxRetries, retryInterval);

  // Verificar Frontend
  await waitForFrontend(maxRetries, retryInterval);

  console.log('✅ Todos los servicios están listos');
}

/**
 * Espera a que PostgreSQL esté disponible
 */
async function waitForPostgreSQL(maxRetries, retryInterval) {
  console.log('🗄️ Esperando PostgreSQL...');

  for (let i = 0; i < maxRetries; i++) {
    try {
      const { stdout } = await execAsync(
        `pg_isready -h ${process.env.DB_HOST || 'localhost'} -p ${process.env.DB_PORT || '5435'} -U ${process.env.DB_USER || 'postgres'}`
      );
      
      if (stdout.includes('accepting connections')) {
        console.log('✅ PostgreSQL está listo');
        return;
      }
    } catch (error) {
      // Ignorar errores y continuar intentando
    }

    if (i < maxRetries - 1) {
      console.log(`⏳ PostgreSQL no está listo, reintentando en ${retryInterval / 1000}s... (${i + 1}/${maxRetries})`);
      await sleep(retryInterval);
    }
  }

  throw new Error('PostgreSQL no está disponible después de múltiples intentos');
}

/**
 * Espera a que la API esté disponible
 */
async function waitForAPI(maxRetries, retryInterval) {
  console.log('🔌 Esperando API...');

  const apiUrl = process.env.API_URL || 'http://localhost:8082';
  const healthEndpoint = `${apiUrl}/actuator/health`;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(healthEndpoint, {
        timeout: 5000,
        validateStatus: (status) => status < 500 // Aceptar cualquier status < 500
      });

      if (response.status === 200) {
        console.log('✅ API está lista');
        return;
      }
    } catch (error) {
      // Ignorar errores y continuar intentando
    }

    if (i < maxRetries - 1) {
      console.log(`⏳ API no está lista, reintentando en ${retryInterval / 1000}s... (${i + 1}/${maxRetries})`);
      await sleep(retryInterval);
    }
  }

  throw new Error('API no está disponible después de múltiples intentos');
}

/**
 * Espera a que el Frontend esté disponible
 */
async function waitForFrontend(maxRetries, retryInterval) {
  console.log('🌐 Esperando Frontend...');

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5175';

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(frontendUrl, {
        timeout: 5000,
        validateStatus: (status) => status < 500 // Aceptar cualquier status < 500
      });

      if (response.status === 200) {
        console.log('✅ Frontend está listo');
        return;
      }
    } catch (error) {
      // Ignorar errores y continuar intentando
    }

    if (i < maxRetries - 1) {
      console.log(`⏳ Frontend no está listo, reintentando en ${retryInterval / 1000}s... (${i + 1}/${maxRetries})`);
      await sleep(retryInterval);
    }
  }

  throw new Error('Frontend no está disponible después de múltiples intentos');
}

/**
 * Función de utilidad para dormir
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verifica el estado de todos los servicios
 */
async function checkServicesHealth() {
  const health = {
    postgres: false,
    api: false,
    frontend: false,
    timestamp: new Date().toISOString()
  };

  try {
    // Verificar PostgreSQL
    const { stdout } = await execAsync(
      `pg_isready -h ${process.env.DB_HOST || 'localhost'} -p ${process.env.DB_PORT || '5435'} -U ${process.env.DB_USER || 'postgres'}`
    );
    health.postgres = stdout.includes('accepting connections');
  } catch (error) {
    health.postgres = false;
  }

  try {
    // Verificar API
    const apiUrl = process.env.API_URL || 'http://localhost:8082';
    const response = await axios.get(`${apiUrl}/actuator/health`, { timeout: 5000 });
    health.api = response.status === 200;
  } catch (error) {
    health.api = false;
  }

  try {
    // Verificar Frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5175';
    const response = await axios.get(frontendUrl, { timeout: 5000 });
    health.frontend = response.status === 200;
  } catch (error) {
    health.frontend = false;
  }

  return health;
}

module.exports = {
  waitForServices,
  waitForPostgreSQL,
  waitForAPI,
  waitForFrontend,
  checkServicesHealth
};
