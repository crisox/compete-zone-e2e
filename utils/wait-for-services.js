require('dotenv').config();
const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');
const { config } = require('./config');
const { ErrorHandler } = require('./error-handler');

const execAsync = promisify(exec);

/**
 * Espera a que todos los servicios estén disponibles
 */
async function waitForServices() {
  console.log('⏳ Waiting for services to be ready...');

  const maxRetries = config.performance.isCI ? 60 : 30; // Más intentos en CI
  const retryInterval = config.performance.isCI ? 15000 : 10000; // Más tiempo en CI

  try {
    // Verificar PostgreSQL
    await ErrorHandler.withRetry(
      () => waitForPostgreSQL(maxRetries, retryInterval),
      3,
      2000,
      { context: 'postgresql-wait' }
    );

    // Verificar API
    await ErrorHandler.withRetry(
      () => waitForAPI(maxRetries, retryInterval),
      3,
      2000,
      { context: 'api-wait' }
    );

    // Verificar Frontend
    await ErrorHandler.withRetry(
      () => waitForFrontend(maxRetries, retryInterval),
      3,
      2000,
      { context: 'frontend-wait' }
    );

    console.log('✅ All services are ready');

  } catch (error) {
    throw ErrorHandler.wrapError(error, 'service-wait');
  }
}

/**
 * Espera a que PostgreSQL esté disponible
 */
async function waitForPostgreSQL(maxRetries, retryInterval) {
  console.log('🗄️ Waiting for PostgreSQL...');
  console.log(`🔍 Connecting to: ${config.database.host}:${config.database.port}@${config.database.user}`);

  for (let i = 0; i < maxRetries; i++) {
    try {
      const { stdout } = await execAsync(
        `pg_isready -h ${config.database.host} -p ${config.database.port} -U ${config.database.user}`
      );

      if (stdout.includes('accepting connections') || stdout.includes('aceptando conexiones')) {
        console.log('✅ PostgreSQL is ready');
        return;
      }
    } catch (error) {
      if (i === 0) {
        console.log(`❌ Connection attempt failed: ${error.message}`);
      }
    }

    if (i < maxRetries - 1) {
      console.log(`⏳ PostgreSQL not ready, retrying in ${retryInterval / 1000}s... (${i + 1}/${maxRetries})`);
      await sleep(retryInterval);
    }
  }

  throw new Error(`PostgreSQL not available after ${maxRetries} attempts`);
}

/**
 * Espera a que la API esté disponible
 */
async function waitForAPI(maxRetries, retryInterval) {
  console.log('🔌 Waiting for API...');

  const healthEndpoint = `${config.services.apiUrl}/actuator/health`;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(healthEndpoint, {
        timeout: config.services.timeout,
        validateStatus: (status) => status < 500
      });

      if (response.status === 200) {
        console.log('✅ API is ready');
        return;
      }
    } catch (error) {
      if (i === 0) {
        console.log(`❌ API health check failed: ${error.message}`);
      }
    }

    if (i < maxRetries - 1) {
      console.log(`⏳ API not ready, retrying in ${retryInterval / 1000}s... (${i + 1}/${maxRetries})`);
      await sleep(retryInterval);
    }
  }

  throw new Error(`API not available after ${maxRetries} attempts`);
}

/**
 * Espera a que el Frontend esté disponible
 */
async function waitForFrontend(maxRetries, retryInterval) {
  console.log('🌐 Waiting for Frontend...');

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(config.services.frontendUrl, {
        timeout: config.services.timeout,
        validateStatus: (status) => status < 500
      });

      if (response.status === 200) {
        console.log('✅ Frontend is ready');
        return;
      }
    } catch (error) {
      if (i === 0) {
        console.log(`❌ Frontend health check failed: ${error.message}`);
      }
    }

    if (i < maxRetries - 1) {
      console.log(`⏳ Frontend not ready, retrying in ${retryInterval / 1000}s... (${i + 1}/${maxRetries})`);
      await sleep(retryInterval);
    }
  }

  throw new Error(`Frontend not available after ${maxRetries} attempts`);
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
    health.postgres = stdout.includes('accepting connections') || stdout.includes('aceptando conexiones');
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
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
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
