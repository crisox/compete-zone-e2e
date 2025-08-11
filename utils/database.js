const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

/**
 * Cliente de base de datos para pruebas E2E
 */
let dbClient = null;

/**
 * Obtiene una conexión a la base de datos
 */
async function getDatabaseClient() {
  if (!dbClient) {
    dbClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5435,
      database: process.env.DB_NAME || 'competezone_e2e',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 5000,
      query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT) || 30000,
    });

    await dbClient.connect();
  }
  return dbClient;
}

/**
 * Configura la base de datos para pruebas
 */
async function setupDatabase() {
  const client = await getDatabaseClient();

  try {
    // Verificar conexión
    await client.query('SELECT 1');
    console.log('✅ Conexión a base de datos establecida');

    // Verificar que las tablas existan
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);

    const expectedTables = [
      'users', 'gyms', 'events', 'categories', 
      'event_registrations', 'gym_reviews', 'refresh_tokens', 'media'
    ];

    const existingTables = tablesResult.rows.map(row => row.table_name);
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));

    if (missingTables.length > 0) {
      throw new Error(`Tablas faltantes: ${missingTables.join(', ')}`);
    }

    console.log('✅ Estructura de base de datos verificada');

  } catch (error) {
    console.error('❌ Error configurando base de datos:', error.message);
    throw error;
  }
}

/**
 * Carga datos de prueba en la base de datos
 */
async function seedTestData() {
  const client = await getDatabaseClient();

  try {
    // Cargar datos desde fixtures
    const fixturesPath = path.join(__dirname, '../fixtures');
    
    // Cargar usuarios de prueba
    const usersData = await loadFixture('users.json');
    await seedUsers(client, usersData);

    // Cargar gimnasios de prueba
    const gymsData = await loadFixture('gyms.json');
    await seedGyms(client, gymsData);

    // Cargar eventos de prueba
    const eventsData = await loadFixture('events.json');
    await seedEvents(client, eventsData);

    console.log('✅ Datos de prueba cargados exitosamente');

  } catch (error) {
    console.error('❌ Error cargando datos de prueba:', error.message);
    throw error;
  }
}

/**
 * Carga un archivo fixture
 */
async function loadFixture(filename) {
  try {
    const fixturePath = path.join(__dirname, '../fixtures', filename);
    const data = await fs.readFile(fixturePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.warn(`⚠️ No se pudo cargar fixture ${filename}:`, error.message);
    return [];
  }
}

/**
 * Carga usuarios de prueba
 */
async function seedUsers(client, usersData) {
  for (const user of usersData) {
    await client.query(`
      INSERT INTO users (id, email, password_hash, role, name, bio, location, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        name = EXCLUDED.name,
        bio = EXCLUDED.bio,
        location = EXCLUDED.location,
        updated_at = NOW()
    `, [
      user.id, user.email, user.password_hash, user.role, 
      user.name, user.bio, user.location
    ]);
  }
}

/**
 * Carga gimnasios de prueba
 */
async function seedGyms(client, gymsData) {
  for (const gym of gymsData) {
    await client.query(`
      INSERT INTO gyms (id, name, description, location_text, contact_phone, owner_user_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        location_text = EXCLUDED.location_text,
        contact_phone = EXCLUDED.contact_phone,
        owner_user_id = EXCLUDED.owner_user_id,
        updated_at = NOW()
    `, [
      gym.id, gym.name, gym.description, gym.location_text, 
      gym.contact_phone, gym.owner_user_id
    ]);
  }
}

/**
 * Carga eventos de prueba
 */
async function seedEvents(client, eventsData) {
  for (const event of eventsData) {
    await client.query(`
      INSERT INTO events (id, title, description, date, "time", location_text, max_participants, 
                         registration_deadline, gym_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        date = EXCLUDED.date,
        "time" = EXCLUDED."time",
        location_text = EXCLUDED.location_text,
        max_participants = EXCLUDED.max_participants,
        registration_deadline = EXCLUDED.registration_deadline,
        gym_id = EXCLUDED.gym_id,
        updated_at = NOW()
    `, [
      event.id, event.title, event.description, event.date, event.time,
      event.location_text, event.max_participants, 
      event.registration_deadline, event.gym_id
    ]);
  }
}

/**
 * Limpia la base de datos después de las pruebas
 */
async function cleanupDatabase() {
  if (!dbClient) return;

  try {
    // Limpiar datos de prueba en orden inverso a las dependencias
    await dbClient.query('DELETE FROM event_registrations WHERE registered_at > NOW() - INTERVAL \'1 hour\'');
    await dbClient.query('DELETE FROM gym_reviews WHERE created_at > NOW() - INTERVAL \'1 hour\'');
    await dbClient.query('DELETE FROM media WHERE created_at > NOW() - INTERVAL \'1 hour\'');
    await dbClient.query('DELETE FROM events WHERE created_at > NOW() - INTERVAL \'1 hour\'');
    await dbClient.query('DELETE FROM gyms WHERE created_at > NOW() - INTERVAL \'1 hour\'');
    await dbClient.query('DELETE FROM users WHERE created_at > NOW() - INTERVAL \'1 hour\'');
    await dbClient.query('DELETE FROM refresh_tokens WHERE created_at > NOW() - INTERVAL \'1 hour\'');

    console.log('✅ Base de datos limpiada');

  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error.message);
  } finally {
    await dbClient.end();
    dbClient = null;
  }
}

/**
 * Ejecuta una consulta SQL
 */
async function executeQuery(query, params = []) {
  const client = await getDatabaseClient();
  return await client.query(query, params);
}

/**
 * Verifica si un usuario existe
 */
async function userExists(email) {
  const result = await executeQuery('SELECT id FROM users WHERE email = $1', [email]);
  return result.rows.length > 0;
}

/**
 * Obtiene un usuario por email
 */
async function getUserByEmail(email) {
  const result = await executeQuery('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

module.exports = {
  getDatabaseClient,
  setupDatabase,
  seedTestData,
  cleanupDatabase,
  executeQuery,
  userExists,
  getUserByEmail
};
