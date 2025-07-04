const { Pool } = require('pg');

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gestordecoches',
  password: 'Evangelion01',
  port: 5432,
  ssl: false
});

// Función para probar la conexión
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Conexión a PostgreSQL establecida correctamente');
    client.release();
    return true;
  } catch (err) {
    console.error('Error conectando a PostgreSQL:', err);
    return false;
  }
}

// Función para ejecutar consultas
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query ejecutada en', duration, 'ms');
    return res;
  } catch (err) {
    console.error('Error ejecutando query:', err);
    throw err;
  }
}

// Función para obtener un cliente
async function getClient() {
  return await pool.connect();
}

// Función para cerrar la conexión
async function closePool() {
  await pool.end();
  console.log('Pool de conexiones cerrado');
}

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  closePool
}; 