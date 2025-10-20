#!/usr/bin/env node

/**
 * Script de diagnóstico para el problema de proxy en las rutas de autenticación
 */

const http = require('http');

const FRONTEND_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:8082';

async function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 500) // Primeros 500 caracteres
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function diagnoseProxyIssue() {
  console.log('🔍 DIAGNÓSTICO DEL PROBLEMA DE PROXY');
  console.log('='.repeat(50));

  try {
    // Test 1: Página principal (debería funcionar)
    console.log('\n1. Probando página principal (/)...');
    const mainPage = await makeRequest(`${FRONTEND_URL}/`);
    console.log(`   Status: ${mainPage.statusCode}`);
    console.log(`   Contiene HTML: ${mainPage.data.includes('<!doctype html>')}`);
    console.log(`   Contiene CompeteZone: ${mainPage.data.includes('CompeteZone')}`);

    // Test 2: Ruta de login (debería ser manejada por frontend pero va al backend)
    console.log('\n2. Probando ruta /auth/login...');
    const loginPage = await makeRequest(`${FRONTEND_URL}/auth/login`);
    console.log(`   Status: ${loginPage.statusCode}`);
    console.log(`   Es error de Spring Boot: ${loginPage.data.includes('Whitelabel Error Page') || loginPage.data.includes('Method Not Allowed')}`);
    console.log(`   Contiene JSON: ${loginPage.data.includes('"timestamp"')}`);

    // Test 3: Ruta de registro (debería ser manejada por frontend pero va al backend)
    console.log('\n3. Probando ruta /auth/registro...');
    const registerPage = await makeRequest(`${FRONTEND_URL}/auth/registro`);
    console.log(`   Status: ${registerPage.statusCode}`);
    console.log(`   Es error de Spring Boot: ${registerPage.data.includes('Whitelabel Error Page') || registerPage.data.includes('Not Found')}`);

    // Test 4: Verificar que el backend responde directamente
    console.log('\n4. Probando directamente al backend /auth/login...');
    const backendLogin = await makeRequest(`${API_URL}/auth/login`);
    console.log(`   Status: ${backendLogin.statusCode}`);
    console.log(`   Es el mismo error: ${backendLogin.data.includes('Method Not Allowed')}`);

    console.log('\n📊 ANÁLISIS DE RESULTADOS:');
    console.log('='.repeat(50));
    
    if (loginPage.data.includes('Method Not Allowed') || registerPage.data.includes('Not Found')) {
      console.log('❌ PROBLEMA CONFIRMADO: Las rutas /auth están siendo reenviadas al backend');
      console.log('❌ El frontend debería manejar GET /auth/login y GET /auth/registro');
      console.log('❌ El proxy está reenviando TODO /auth/* al backend');
      console.log('\n✅ SOLUCIÓN: Configurar el proxy para reenviar solo POST /auth/* al backend');
    } else {
      console.log('✅ Las rutas parecen funcionar correctamente');
    }

  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error.message);
  }
}

if (require.main === module) {
  diagnoseProxyIssue();
}

module.exports = { diagnoseProxyIssue };