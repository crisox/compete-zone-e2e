const { cleanupDatabase } = require('./database');
const { cleanupMedia } = require('./media-cleanup');

/**
 * Limpieza global que se ejecuta después de todas las pruebas
 * - Limpia la base de datos
 * - Elimina archivos de media temporales
 * - Genera reportes finales
 */
async function globalTeardown() {
  console.log('🧹 Iniciando limpieza global...');

  try {
    // 1. Limpiar base de datos
    console.log('🗄️ Limpiando base de datos...');
    await cleanupDatabase();

    // 2. Limpiar archivos de media temporales
    console.log('📁 Limpiando archivos de media...');
    await cleanupMedia();

    // 3. Generar reporte final
    console.log('📊 Generando reporte final...');
    await generateFinalReport();

    console.log('✅ Limpieza global completada exitosamente');

  } catch (error) {
    console.error('❌ Error en limpieza global:', error);
    // No lanzar error para no fallar las pruebas por problemas de limpieza
  }
}

/**
 * Genera un reporte final con estadísticas de las pruebas
 */
async function generateFinalReport() {
  const fs = require('fs').promises;
  const path = require('path');

  try {
    const reportPath = path.join(__dirname, '../reports');
    const finalReportPath = path.join(reportPath, 'final-report.json');

    // Crear directorio si no existe
    await fs.mkdir(reportPath, { recursive: true });

    const finalReport = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      services: {
        api: process.env.API_URL || 'http://localhost:8082',
        frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
        database: `${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5435'}`
      },
      cleanup: {
        database: 'completed',
        media: 'completed',
        timestamp: new Date().toISOString()
      }
    };

    await fs.writeFile(finalReportPath, JSON.stringify(finalReport, null, 2));
    console.log(`📄 Reporte final generado: ${finalReportPath}`);

  } catch (error) {
    console.error('❌ Error generando reporte final:', error.message);
  }
}

module.exports = globalTeardown;
