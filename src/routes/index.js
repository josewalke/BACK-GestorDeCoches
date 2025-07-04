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

// Ruta raíz
router.get('/', (req, res) => {
  console.log('🏠 [ROOT] Ruta raíz accedida');
  res.send('¡Bienvenido a la API de GestorDeCoches!');
});

module.exports = router; 