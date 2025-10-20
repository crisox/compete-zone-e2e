const { exec } = require('child_process');
const { promisify } = require('util');
const axios = require('axios');

const execAsync = promisify(exec);

/**
 * Script de debugging rápido para verificar el estado de los servicios
 */
async function debugServices() {
  console.log('🔍 Debugging de servicios E2E...\n');
  
  // 1. Verificar contenedores Docker
  console.log('📦 Estado de contenedores:');
  try {
    const { stdout } = await execAsync('docker-compose -f docker-compose.e2e.yml ps');
    console.log(stdout);
  } catch (error) {
    console.error('❌ Error al verificar contenedores:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 2. Verificar logs de la API
  console.log('🔌 Logs de la API (últimas 10 líneas):');
  try {
    const { stdout } = await execAsync('docker-compose -f docker-compose.e2e.yml logs --tail=10 api-e2e');
    console.log(stdout);
  } catch (error) {
    console.error('❌ Error al obtener logs de API:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 3. Verificar conectividad de red
  console.log('🌐 Verificando conectividad:');
  
  // PostgreSQL
  try {
    await execAsync('pg_isready -h localhost -p 5433 -U postgres');
    console.log('✅ PostgreSQL: Conectado');
  } catch (error) {
    console.log('❌ PostgreSQL: No conectado');
  }
  
  // API
  try {
    const response = await axios.get('http://localhost:8081/actuator/health', {
      timeout: 3000
    });
    console.log(`✅ API: Respondiendo (Status: ${response.status})`);
  } catch (error) {
    console.log(`❌ API: No responde (${error.message})`);
  }
  
  // Frontend
  try {
    const response = await axios.get('http://localhost:5173', {
      timeout: 3000
    });
    console.log(`✅ Frontend: Respondiendo (Status: ${response.status})`);
  } catch (error) {
    console.log(`❌ Frontend: No responde (${error.message})`);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 4. Verificar puertos en uso
  console.log('🔌 Puertos en uso:');
  try {
    const { stdout } = await execAsync('lsof -i :5433,8081,5173 | head -10');
    console.log(stdout || 'No se encontraron procesos en los puertos especificados');
  } catch (error) {
    console.log('No se pudo verificar puertos en uso');
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 5. Comandos útiles para debugging
  console.log('🛠️ Comandos útiles para debugging:');
  console.log('- Ver todos los logs: docker-compose -f docker-compose.e2e.yml logs');
  console.log('- Ver logs de API: docker-compose -f docker-compose.e2e.yml logs api-e2e');
  console.log('- Ver logs de Frontend: docker-compose -f docker-compose.e2e.yml logs frontend-e2e');
  console.log('- Ver logs de DB: docker-compose -f docker-compose.e2e.yml logs postgres-e2e');
  console.log('- Reiniciar servicios: docker-compose -f docker-compose.e2e.yml restart');
  console.log('- Detener servicios: docker-compose -f docker-compose.e2e.yml down');
  console.log('- Iniciar servicios: docker-compose -f docker-compose.e2e.yml up -d');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  debugServices().catch(console.error);
}

module.exports = { debugServices };
