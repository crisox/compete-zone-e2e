#!/bin/bash

# Script para iniciar el entorno de desarrollo con Dozzle
# Uso: ./scripts/dev-with-logs.sh

set -e

echo "🚀 Iniciando CompeteZone E2E con Dozzle..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que Docker esté ejecutándose
if ! docker info > /dev/null 2>&1; then
    print_error "Docker no está ejecutándose. Por favor inicia Docker y vuelve a intentar."
    exit 1
fi

# Verificar que docker-compose esté disponible
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose no está instalado. Por favor instálalo y vuelve a intentar."
    exit 1
fi

print_status "Iniciando servicios..."
docker-compose -f docker-compose.e2e.yml up -d

print_status "Esperando que los servicios estén listos..."
sleep 10

# Verificar que Dozzle esté ejecutándose
if docker ps --filter "name=compete-zone-dozzle-e2e" --format "{{.Names}}" | grep -q "compete-zone-dozzle-e2e"; then
    print_success "Dozzle está ejecutándose en http://localhost:8085"
    
    # Esperar un poco más para que Dozzle esté completamente listo
    sleep 3
    
    print_status "Abriendo Dozzle en el navegador..."
    if command -v node &> /dev/null; then
        node scripts/open-dozzle.js
    else
        print_warning "Node.js no está disponible. Abre manualmente: http://localhost:8085"
    fi
else
    print_error "Dozzle no se inició correctamente"
    exit 1
fi

print_success "Entorno de desarrollo iniciado!"
echo ""
echo "📊 Servicios disponibles:"
echo "  • Frontend: http://localhost:5173"
echo "  • API: http://localhost:8081"
echo "  • Base de datos: localhost:5434"
echo "  • Dozzle (logs): http://localhost:8085"
echo ""
echo "🔧 Comandos útiles:"
echo "  • Ver logs: npm run logs:services"
echo "  • Ejecutar pruebas: npm run test:all"
echo "  • Detener servicios: npm run teardown:services"
echo ""
print_status "Presiona Ctrl+C para detener los servicios"
