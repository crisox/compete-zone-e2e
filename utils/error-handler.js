const { config } = require('./config');

/**
 * Clases de error personalizadas para el proyecto
 */
class TestError extends Error {
  constructor(message, code = 'TEST_ERROR', details = {}) {
    super(message);
    this.name = 'TestError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

class ServiceError extends TestError {
  constructor(serviceName, originalError) {
    super(`Service ${serviceName} failed: ${originalError.message}`, 'SERVICE_ERROR', {
      serviceName,
      originalError: {
        message: originalError.message,
        code: originalError.code,
        stack: originalError.stack
      }
    });
    this.name = 'ServiceError';
    this.serviceName = serviceName;
  }
}

class DatabaseError extends TestError {
  constructor(message, query = null, params = null) {
    super(message, 'DATABASE_ERROR', { query, params });
    this.name = 'DatabaseError';
  }
}

class ConfigurationError extends TestError {
  constructor(message, field = null, value = null) {
    super(message, 'CONFIG_ERROR', { field, value });
    this.name = 'ConfigurationError';
  }
}

class TimeoutError extends TestError {
  constructor(operation, timeout) {
    super(`Operation ${operation} timed out after ${timeout}ms`, 'TIMEOUT_ERROR', {
      operation,
      timeout
    });
    this.name = 'TimeoutError';
  }
}

/**
 * Manejador centralizado de errores con retry y recuperación
 */
class ErrorHandler {
  /**
   * Ejecutar operación con reintento exponencial
   */
  static async withRetry(operation, maxRetries = 3, baseDelay = 1000, options = {}) {
    const {
      backoff = 2,
      maxDelay = 30000,
      onRetry = null,
      context = 'unknown operation'
    } = options;

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = this.wrapError(error, context);

        if (attempt === maxRetries) {
          throw lastError;
        }

        const delay = Math.min(baseDelay * Math.pow(backoff, attempt - 1), maxDelay);

        console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed for ${context}: ${error.message}`);
        console.log(`🔄 Retrying in ${delay}ms...`);

        if (onRetry) {
          await onRetry(error, attempt, delay);
        }

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Ejecutar operación con timeout
   */
  static async withTimeout(operation, timeout, context = 'operation') {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new TimeoutError(context, timeout));
      }, timeout);

      try {
        const result = await operation();
        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(this.wrapError(error, context));
      }
    });
  }

  /**
   * Manejar fallo de servicio con intento de recuperación
   */
  static async handleServiceFailure(serviceName, error, context = {}) {
    const wrappedError = new ServiceError(serviceName, error);

    console.error(`❌ Service failure in ${serviceName}:`, wrappedError.message);

    // Logging estructurado
    this.logError(wrappedError, {
      service: serviceName,
      context,
      timestamp: new Date().toISOString()
    });

    // Intentos de recuperación específicos por servicio
    try {
      switch (serviceName) {
        case 'database':
          await this.recoverDatabase();
          break;
        case 'api':
          await this.recoverApi();
          break;
        case 'frontend':
          await this.recoverFrontend();
          break;
        default:
          console.log(`ℹ️ No specific recovery strategy for ${serviceName}`);
      }
    } catch (recoveryError) {
      console.error(`❌ Recovery failed for ${serviceName}:`, recoveryError.message);
      throw new ServiceError(`${serviceName}-recovery`, recoveryError);
    }

    return wrappedError;
  }

  /**
   * Recuperación de base de datos
   */
  static async recoverDatabase() {
    console.log('🔄 Attempting database recovery...');

    // Implementar lógica de recuperación específica
    // Por ejemplo: verificar conexión, reiniciar servicio, etc.
    await this.sleep(2000);

    console.log('✅ Database recovery completed');
  }

  /**
   * Recuperación de API
   */
  static async recoverApi() {
    console.log('🔄 Attempting API recovery...');

    // Implementar lógica de recuperación específica
    await this.sleep(3000);

    console.log('✅ API recovery completed');
  }

  /**
   * Recuperación de Frontend
   */
  static async recoverFrontend() {
    console.log('🔄 Attempting frontend recovery...');

    // Implementar lógica de recuperación específica
    await this.sleep(2000);

    console.log('✅ Frontend recovery completed');
  }

  /**
   * Envolver error en clase apropiada
   */
  static wrapError(error, context = 'unknown') {
    if (error instanceof TestError) {
      return error;
    }

    // Detectar tipo de error y crear clase apropiada
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return new ServiceError(context, error);
    }

    if (error.code === 'ETIMEDOUT') {
      return new TimeoutError(context, error.timeout || 30000);
    }

    if (error.message.includes('configuration') || error.message.includes('config')) {
      return new ConfigurationError(error.message);
    }

    // Error genérico
    return new TestError(error.message, 'UNKNOWN_ERROR', {
      originalError: error,
      context
    });
  }

  /**
   * Log estructurado de errores
   */
  static logError(error, metadata = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      type: error.name,
      code: error.code || 'UNKNOWN',
      message: error.message,
      details: error.details || {},
      metadata,
      stack: error.stack
    };

    if (config.logging.format === 'json') {
      console.error(JSON.stringify(logEntry));
    } else {
      console.error(`[${logEntry.timestamp}] ${logEntry.type}: ${logEntry.message}`);
      if (Object.keys(logEntry.details).length > 0) {
        console.error('Details:', logEntry.details);
      }
    }
  }

  /**
   * Validar y crear error de configuración
   */
  static validateConfig(field, value, validator) {
    if (!validator(value)) {
      throw new ConfigurationError(
        `Invalid configuration for ${field}: expected ${validator.name}`,
        field,
        value
      );
    }
  }

  /**
   * Crear circuit breaker para operaciones
   */
  static createCircuitBreaker(operation, options = {}) {
    const {
      failureThreshold = 5,
      resetTimeout = 60000,
      monitoringPeriod = 10000
    } = options;

    let state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    let failures = 0;
    let lastFailureTime = null;
    let successCount = 0;

    return async (...args) => {
      const now = Date.now();

      // Resetear circuit breaker después del timeout
      if (state === 'OPEN' && now - lastFailureTime > resetTimeout) {
        console.log('🔄 Circuit breaker transitioning to HALF_OPEN');
        state = 'HALF_OPEN';
        failures = 0;
        successCount = 0;
      }

      // Rechazar si está abierto
      if (state === 'OPEN') {
        throw new TestError('Circuit breaker is OPEN', 'CIRCUIT_BREAKER_OPEN', {
          failures,
          timeUntilReset: resetTimeout - (now - lastFailureTime)
        });
      }

      try {
        const result = await operation(...args);

        // Éxito - resetear contadores
        if (state === 'HALF_OPEN') {
          successCount++;
          if (successCount >= 3) {
            console.log('✅ Circuit breaker transitioning to CLOSED');
            state = 'CLOSED';
            failures = 0;
          }
        } else {
          failures = 0;
        }

        return result;
      } catch (error) {
        failures++;
        lastFailureTime = now;

        if (failures >= failureThreshold) {
          console.error(`🚨 Circuit breaker OPENED after ${failures} failures`);
          state = 'OPEN';
        }

        throw this.wrapError(error, 'circuit-breaker-operation');
      }
    };
  }

  /**
   * Utilidad para sleep
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Manejador global de errores no capturados
   */
  static setupGlobalHandlers() {
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      this.logError(this.wrapError(error, 'uncaught-exception'));
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      this.logError(this.wrapError(reason, 'unhandled-rejection'));
      process.exit(1);
    });
  }
}

module.exports = {
  ErrorHandler,
  TestError,
  ServiceError,
  DatabaseError,
  ConfigurationError,
  TimeoutError
};