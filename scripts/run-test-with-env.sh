#!/bin/bash

# Script para ejecutar tests con variables de entorno cargadas automáticamente
# Uso: ./scripts/run-test-with-env.sh [test-command]

set -e

echo "🔧 Cargando variables de entorno para compete-zone-e2e..."

# Cargar variables de entorno del archivo .env
set -a
source .env
set +a

echo "✅ Variables de entorno cargadas:"
echo "   📊 DB_PORT: $DB_PORT"
echo "   🔌 API_URL: $API_URL"
echo "   🌐 FRONTEND_URL: $FRONTEND_URL"
echo ""

# Determinar qué comando ejecutar
if [ $# -eq 0 ]; then
    TEST_COMMAND="npm run test"
    echo "🧪 Ejecutando tests completos..."
else
    TEST_COMMAND="$*"
    echo "🧪 Ejecutando: $TEST_COMMAND"
fi

echo ""

# Ejecutar el comando de test
eval $TEST_COMMAND