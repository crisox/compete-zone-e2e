#!/usr/bin/env node

const { exec } = require('child_process');
const os = require('os');

const DOZZLE_URL = 'http://localhost:8085';

function openBrowser(url) {
  const platform = os.platform();
  
  let command;
  
  switch (platform) {
    case 'darwin': // macOS
      command = `open "${url}"`;
      break;
    case 'win32': // Windows
      command = `start "${url}"`;
      break;
    default: // Linux y otros
      command = `xdg-open "${url}"`;
      break;
  }
  
  exec(command, (error) => {
    if (error) {
      console.error('❌ Error al abrir Dozzle en el navegador:', error.message);
      console.log(`🌐 Abre manualmente: ${DOZZLE_URL}`);
      return;
    }
    
    console.log('✅ Dozzle abierto en el navegador');
    console.log(`🔗 URL: ${DOZZLE_URL}`);
  });
}

// Verificar si Dozzle está ejecutándose
exec('docker ps --filter "name=compete-zone-dozzle-e2e" --format "{{.Names}}"', (error, stdout) => {
  if (error) {
    console.error('❌ Error al verificar contenedor Dozzle:', error.message);
    return;
  }
  
  if (stdout.trim() === 'compete-zone-dozzle-e2e') {
    console.log('🚀 Abriendo Dozzle...');
    openBrowser(DOZZLE_URL);
  } else {
    console.log('⚠️  Dozzle no está ejecutándose');
    console.log('💡 Ejecuta: npm run logs:dozzle:start');
    console.log(`🌐 O abre manualmente: ${DOZZLE_URL}`);
  }
});
