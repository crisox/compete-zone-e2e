const { chromium } = require('@playwright/test');
const { setupDatabase, seedTestData } = require('./database');
const { waitForServices } = require('./wait-for-services');

/**
 * Configuración global que se ejecuta antes de todas las pruebas
 * - Verifica que los servicios estén disponibles
 * - Prepara la base de datos
 * - Carga datos de prueba
 */
async function globalSetup() {
  console.log('🚀 Iniciando configuración global para pruebas E2E...');

  try {
    // 1. Esperar a que todos los servicios estén listos
    console.log('⏳ Esperando que los servicios estén disponibles...');
    await waitForServices();

    // 2. Configurar base de datos
    console.log('🗄️ Configurando base de datos...');
    await setupDatabase();

    // 3. Cargar datos de prueba
    console.log('📊 Cargando datos de prueba...');
    await seedTestData();

    // 4. Verificar que el frontend esté funcionando
    console.log('🌐 Verificando frontend...');
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
      await page.goto(process.env.FRONTEND_URL || 'http://localhost:5175');
      await page.waitForLoadState('networkidle');
      
      // Verificar que la página cargue correctamente
      const title = await page.title();
      console.log(`✅ Frontend cargado correctamente: ${title}`);
    } catch (error) {
      console.error('❌ Error al verificar frontend:', error.message);
      throw error;
    } finally {
      await browser.close();
    }

    // 5. Verificar que la API esté funcionando
    console.log('🔌 Verificando API...');
    const { default: axios } = require('axios');
    
    try {
      const response = await axios.get(`${process.env.API_URL || 'http://localhost:8082'}/actuator/health`, {
        timeout: 10000
      });
      
      if (response.status === 200) {
        console.log('✅ API funcionando correctamente');
      } else {
        throw new Error(`API respondió con status ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error al verificar API:', error.message);
      throw error;
    }

    console.log('✅ Configuración global completada exitosamente');

  } catch (error) {
    console.error('❌ Error en configuración global:', error);
    throw error;
  }
}

module.exports = globalSetup;
