#!/bin/bash

# Script para cargar variables de entorno del proyecto en zsh
# Uso: source scripts/load-env.sh

echo "🔧 Cargando variables de entorno para compete-zone-e2e..."

# Verificar que estamos en el directorio correcto
if [ ! -f ".env" ]; then
    echo "❌ Error: No se encuentra el archivo .env en el directorio actual"
    echo "💡 Asegúrate de estar en el directorio compete-zone-e2e"
    return 1
fi

# Cargar variables de entorno del archivo .env
set -a
source .env
set +a

# Verificar que las variables clave se hayan cargado
echo "✅ Variables de entorno cargadas:"
echo "   📊 DB_PORT: $DB_PORT"
echo "   🔌 API_URL: $API_URL"
echo "   🌐 FRONTEND_URL: $FRONTEND_URL"
echo "   🗄️ DB_NAME: $DB_NAME"
echo ""
echo "🎯 Ahora puedes ejecutar los tests con:"
echo "   npm run test"
echo "   npm run test:quick"
echo ""
echo "🐳 O iniciar los servicios Docker con:"
echo "   docker-compose -f docker-compose.e2e.yml up -d"