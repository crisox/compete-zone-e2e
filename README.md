# 🧪 CompeteZone E2E Testing Suite

Solución completa de pruebas end-to-end para CompeteZone utilizando Playwright.

## 🎯 Objetivo

Proporcionar una suite de pruebas automatizadas que valide el flujo completo de la aplicación, desde la interfaz de usuario hasta la persistencia en base de datos, simulando casos de uso reales.

## 🏗️ Arquitectura

```
compete-zone-e2e/
├── docker-compose.e2e.yml          # Orquestación de servicios para pruebas
├── playwright.config.js            # Configuración principal de Playwright
├── package.json                    # Dependencias y scripts
├── tests/                          # Pruebas organizadas por tipo
│   ├── e2e/                        # Pruebas end-to-end completas
│   │   ├── auth/                   # Flujos de autenticación
│   │   ├── events/                 # Gestión de eventos
│   │   ├── gyms/                   # Gestión de gimnasios
│   │   └── athletes/               # Gestión de atletas
│   ├── api/                        # Pruebas de API directas
│   └── ui/                         # Pruebas de componentes UI
├── fixtures/                       # Datos de prueba
│   ├── users.json                  # Usuarios de prueba
│   ├── events.json                 # Eventos de prueba
│   └── gyms.json                   # Gimnasios de prueba
├── utils/                          # Utilidades y helpers
│   ├── database.js                 # Operaciones de base de datos
│   ├── auth.js                     # Helpers de autenticación
│   └── api.js                      # Cliente API
├── scripts/                        # Scripts de automatización
│   ├── setup-e2e.sh               # Preparación del entorno
│   ├── teardown-e2e.sh            # Limpieza del entorno
│   ├── seed-data.sh               # Carga de datos de prueba
│   ├── open-dozzle.js             # Script para abrir Dozzle
│   └── dev-with-logs.sh           # Desarrollo con logs en tiempo real
└── reports/                        # Reportes de ejecución

# Servicios Docker (docker-compose.e2e.yml)
├── postgres-e2e                    # Base de datos PostgreSQL
├── api-e2e                        # Backend Spring Boot
├── frontend-e2e                   # Frontend React + Vite
├── wait-for-services              # Monitoreo de servicios
└── dozzle                         # Monitor de logs en tiempo real
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- Docker y Docker Compose
- Java 21 (para compilar el backend)

### Instalación

```bash
# Clonar el repositorio (si no está en el mismo workspace)
cd compete-zone-e2e

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

### Configuración del Entorno

**Variables de Entorno** (`.env`):
```env
# Servicios
API_URL=http://localhost:8080
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=5433
DB_NAME=competezone_e2e
DB_USER=postgres
DB_PASSWORD=postgres

# Playwright
PLAYWRIGHT_BROWSERS=0
PLAYWRIGHT_HEADLESS=true

# Datos de Prueba
TEST_ADMIN_EMAIL=admin@competezone.test
TEST_ADMIN_PASSWORD=admin123
TEST_ATHLETE_EMAIL=athlete@competezone.test
TEST_ATHLETE_PASSWORD=athlete123
TEST_GYM_EMAIL=gym@competezone.test
TEST_GYM_PASSWORD=gym123
```

## 🏃‍♂️ Ejecución de Pruebas

### Ejecución Completa

```bash
# Levantar servicios y ejecutar todas las pruebas
npm run test:e2e

# O paso a paso:
npm run setup:services    # Levantar servicios
npm run seed:data        # Cargar datos de prueba
npm run test:all         # Ejecutar pruebas
npm run teardown         # Limpiar entorno

# Desarrollo con logs en tiempo real:
npm run dev:with-logs     # Inicia servicios + Dozzle + abre navegador
```

### Ejecución Selectiva

```bash
# Solo pruebas de autenticación
npm run test:auth

# Solo pruebas de eventos
npm run test:events

# Solo pruebas de API
npm run test:api

# Solo pruebas de UI
npm run test:ui

# Ejecutar en modo debug (navegador visible)
npm run test:debug
```

### Ejecución en CI/CD

```bash
# Instalar navegadores y ejecutar en CI
npx playwright install --with-deps
npm run test:ci
```

## 📊 Reportes y Monitoreo

### Reportes de Pruebas

Los reportes se generan automáticamente en `reports/`:

- **HTML Report**: `reports/html/index.html`
- **JUnit XML**: `reports/junit.xml`
- **Videos**: `reports/videos/`
- **Screenshots**: `reports/screenshots/`

### 📊 Dozzle - Monitor de Logs en Tiempo Real

Dozzle proporciona una interfaz web para monitorear logs de todos los contenedores:

- **URL**: http://localhost:8085
- **Características**:
  - Logs en tiempo real de todos los servicios
  - Filtrado por contenedor
  - Búsqueda en logs
  - Interfaz web intuitiva
  - Actualización automática

**Comandos de Logs**:
```bash
# Ver logs de servicios
npm run logs:services

# Ver logs de Playwright
npm run logs:playwright

# Abrir Dozzle
npm run logs:dozzle

# Iniciar solo Dozzle
npm run logs:dozzle:start

# Detener Dozzle
npm run logs:dozzle:stop
```

## 🔧 Mantenimiento y Debugging

### Agregar Nuevas Pruebas

1. Crear archivo en `tests/e2e/[categoria]/`
2. Usar el patrón de Page Object Model
3. Agregar datos de prueba en `fixtures/`
4. Documentar en este README

### Actualizar Datos de Prueba

```bash
# Regenerar datos de prueba
npm run fixtures:generate

# Validar estructura de datos
npm run fixtures:validate
```

### Debugging

```bash
# Ejecutar con navegador visible
npm run test:debug

# Ejecutar con modo trace
npm run test:trace

# Abrir reporte HTML
npx playwright show-report
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Servicios no inician**: Verificar puertos disponibles
2. **Base de datos no conecta**: Verificar credenciales en `.env`
3. **Pruebas fallan**: Verificar datos de prueba en `fixtures/`

## 📝 Casos de Uso Cubiertos

### 🔐 Autenticación
- Registro de atletas
- Registro de gimnasios
- Login/logout
- Recuperación de contraseña

### 🏋️ Eventos
- Creación de eventos por gimnasios
- Búsqueda y filtrado de eventos
- Inscripción de atletas
- Gestión de inscripciones

### 🏢 Gimnasios
- Registro y configuración
- Gestión de eventos
- Reseñas y calificaciones

### 👤 Perfiles
- Actualización de información
- Subida de imágenes
- Gestión de preferencias

## 🤝 Contribución

1. Crear rama para nueva funcionalidad
2. Agregar pruebas correspondientes
3. Ejecutar suite completa
4. Crear Pull Request

## 📄 Licencia

MIT License - Ver LICENSE para detalles.
