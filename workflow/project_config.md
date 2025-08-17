# CompeteZone E2E Testing - Configuración del Proyecto

## Objetivo Principal
Tests end-to-end para validar flujos completos de la aplicación CompeteZone.

## Stack Tecnológico
- **Framework**: Playwright
- **Lenguaje**: JavaScript/Node.js
- **Entorno**: Docker Compose
- **Base de Datos**: PostgreSQL (test)
- **API**: Spring Boot (test)
- **Frontend**: React (test)

## Patrones Críticos y Convenciones

### Estructura de Tests
- **E2E**: `tests/e2e/` - Tests de flujos completos
- **API**: `tests/api/` - Tests de endpoints
- **UI**: `tests/ui/` - Tests de componentes UI
- **Fixtures**: `fixtures/` - Datos de prueba

### Organización por Funcionalidad
- **Auth**: `tests/e2e/auth/` - Login, registro, roles
- **Events**: `tests/e2e/events/` - Crear, editar, inscribirse
- **Basic**: `tests/e2e/basic/` - Health checks, navegación
- **Integration**: `tests/integration/` - Tests de integración

### Datos de Prueba
- **Users**: `fixtures/users.json` - Usuarios de prueba
- **Events**: `fixtures/events.json` - Eventos de prueba
- **Gyms**: `fixtures/gyms.json` - Gimnasios de prueba
- **SQL**: `fixtures/init-e2e-data.sql` - Setup de base de datos

### Configuración de Entorno
- **Docker Compose**: `docker-compose.e2e.yml` - Entorno completo
- **Variables**: `env.example` - Configuración de entorno
- **Scripts**: `scripts/` - Utilidades de testing

### Patrones de Testing
- **Setup/Teardown**: Limpieza automática de datos
- **Page Objects**: Patrón para interacciones con UI
- **API Helpers**: Funciones auxiliares para llamadas API
- **Assertions**: Validaciones específicas del dominio

### Flujos de Prueba Principales
- **Registro de Usuario**: Athlete, Gym, Admin
- **Autenticación**: Login con diferentes roles
- **Gestión de Eventos**: Crear, editar, eliminar
- **Inscripciones**: Inscribirse, cancelar, ver lista
- **Navegación**: Rutas protegidas y públicas

## Limitaciones Importantes
- **Entorno Aislado**: Tests no afectan datos de desarrollo
- **Datos Limpios**: Cada test inicia con estado conocido
- **Tiempo de Ejecución**: Tests deben ser rápidos y confiables
- **Paralelización**: Tests independientes para ejecución paralela

## Convenciones de Código
- **Naming**: `*.spec.js` para archivos de test
- **Descriptions**: Nombres descriptivos de tests
- **Setup**: Before/after hooks apropiados
- **Assertions**: Validaciones claras y específicas
- **Error Handling**: Captura y reporte de errores

## Dependencias Principales
- playwright
- @playwright/test
- axios (para tests de API)
- dotenv (configuración)

## Scripts de Utilidad
- **dev-with-logs.sh**: Desarrollo con logs
- **wait-for-services.js**: Esperar servicios
- **seed-data.js**: Poblar datos de prueba
- **clean-data.js**: Limpiar datos de prueba
- **analyze-results.js**: Analizar resultados

## Configuración de Playwright
- **playwright.config.js**: Configuración principal
- **Browsers**: Chrome, Firefox, Safari
- **Screenshots**: Capturas en fallos
- **Videos**: Grabación de ejecución
- **Reports**: Reportes HTML detallados
