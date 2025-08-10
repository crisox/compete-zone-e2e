const fs = require('fs').promises;
const path = require('path');

/**
 * Limpia archivos de media temporales creados durante las pruebas
 */
async function cleanupMedia() {
  const mediaPath = process.env.MEDIA_UPLOAD_PATH || './volumes/media-uploads-e2e';

  try {
    // Verificar si el directorio existe
    try {
      await fs.access(mediaPath);
    } catch (error) {
      console.log('📁 Directorio de media no existe, saltando limpieza');
      return;
    }

    // Obtener todos los archivos en el directorio
    const files = await getAllFiles(mediaPath);
    
    // Filtrar archivos creados en la última hora (durante las pruebas)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentFiles = [];

    for (const file of files) {
      try {
        const stats = await fs.stat(file);
        if (stats.mtime > oneHourAgo) {
          recentFiles.push(file);
        }
      } catch (error) {
        // Ignorar archivos que no se pueden acceder
      }
    }

    // Eliminar archivos recientes
    let deletedCount = 0;
    for (const file of recentFiles) {
      try {
        await fs.unlink(file);
        deletedCount++;
      } catch (error) {
        console.warn(`⚠️ No se pudo eliminar archivo ${file}:`, error.message);
      }
    }

    console.log(`✅ Limpieza de media completada: ${deletedCount} archivos eliminados`);

  } catch (error) {
    console.error('❌ Error limpiando archivos de media:', error.message);
  }
}

/**
 * Obtiene todos los archivos en un directorio recursivamente
 */
async function getAllFiles(dirPath) {
  const files = [];

  try {
    const items = await fs.readdir(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      
      try {
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
          const subFiles = await getAllFiles(fullPath);
          files.push(...subFiles);
        } else {
          files.push(fullPath);
        }
      } catch (error) {
        // Ignorar archivos/directorios que no se pueden acceder
      }
    }
  } catch (error) {
    // Ignorar directorios que no se pueden leer
  }

  return files;
}

/**
 * Crea un archivo de prueba temporal
 */
async function createTestFile(filename, content = 'test content') {
  const mediaPath = process.env.MEDIA_UPLOAD_PATH || './volumes/media-uploads-e2e';
  
  try {
    // Crear directorio si no existe
    await fs.mkdir(mediaPath, { recursive: true });
    
    const filePath = path.join(mediaPath, filename);
    await fs.writeFile(filePath, content);
    
    return filePath;
  } catch (error) {
    console.error('❌ Error creando archivo de prueba:', error.message);
    throw error;
  }
}

/**
 * Verifica si un archivo existe
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Obtiene información de un archivo
 */
async function getFileInfo(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return {
      exists: true,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory()
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
}

module.exports = {
  cleanupMedia,
  createTestFile,
  fileExists,
  getFileInfo
};
