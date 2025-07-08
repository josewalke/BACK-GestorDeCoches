const express = require('express');
const router = express.Router();

// Importar rutas específicas
const authRoutes = require('./auth');
const vehicleRoutes = require('./vehicles');

// Configurar rutas
router.use('/auth', authRoutes);
router.use('/vehiculos', vehicleRoutes);

// Ruta de prueba
router.get('/test', async (req, res) => {
  console.log('🔍 [TEST] Endpoint de prueba llamado');
  try {
    const { query } = require('../config/database');
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ [TEST] Conexión a base de datos exitosa');
    res.json({ 
      message: 'Conexión exitosa a PostgreSQL',
      timestamp: result.rows[0].current_time
    });
  } catch (error) {
    console.error('❌ [TEST] Error de conexión a la base de datos:', error.message);
    res.status(500).json({ error: 'Error de conexión a la base de datos' });
  }
});

// Ruta principal
router.get('/', (req, res) => {
  res.json({
    message: 'API de Gestión de Coches',
    version: '1.0.0',
    status: 'OK',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      vehicles: '/api/vehicles',
      health: '/health'
    }
  });
});

// Ruta de información del sistema
router.get('/info', (req, res) => {
  res.json({
    name: 'Gestor de Coches API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version,
    platform: process.platform
  });
});

module.exports = router; 