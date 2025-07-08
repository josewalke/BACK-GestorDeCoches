const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth');
const vehicleController = require('../controllers/vehicleController');

// Aplicar autenticación a todas las rutas de vehículos
router.use(authenticateToken);

// Obtener todos los vehículos
router.get('/', async (req, res) => {
  console.log('🚗 [VEHICLES] Obteniendo lista de vehículos');
  try {
    await vehicleController.getAllVehicles(req, res);
  } catch (error) {
    console.error('❌ [VEHICLES] Error obteniendo vehículos:', error.message);
    res.status(500).json({ error: 'Error obteniendo vehículos' });
  }
});

// Obtener todas las ubicaciones
router.get('/ubicaciones', async (req, res) => {
  console.log('📍 [VEHICLES] Obteniendo lista de ubicaciones');
  try {
    await vehicleController.getAllLocations(req, res);
  } catch (error) {
    console.error('❌ [VEHICLES] Error obteniendo ubicaciones:', error.message);
    res.status(500).json({ error: 'Error obteniendo ubicaciones' });
  }
});

// Obtener dashboard con todos los datos
router.get('/dashboard', async (req, res) => {
  console.log('📊 [VEHICLES] Obteniendo dashboard');
  try {
    await vehicleController.getDashboard(req, res);
  } catch (error) {
    console.error('❌ [VEHICLES] Error obteniendo dashboard:', error.message);
    res.status(500).json({ error: 'Error obteniendo dashboard' });
  }
});

// Obtener reservas de un vehículo específico
router.get('/:vehicleId/reservations', async (req, res) => {
  console.log('📅 [VEHICLES] Obteniendo reservas del vehículo ID:', req.params.vehicleId);
  try {
    await vehicleController.getVehicleReservations(req, res);
  } catch (error) {
    console.error('❌ [VEHICLES] Error obteniendo reservas:', error.message);
    res.status(500).json({ error: 'Error obteniendo reservas' });
  }
});

// Obtener un vehículo por ID
router.get('/:id', async (req, res) => {
  console.log('🚗 [VEHICLES] Obteniendo vehículo ID:', req.params.id);
  try {
    await vehicleController.getVehicleById(req, res);
  } catch (error) {
    console.error('❌ [VEHICLES] Error obteniendo vehículo:', error.message);
    res.status(500).json({ error: 'Error obteniendo vehículo' });
  }
});

// Crear un nuevo vehículo
router.post('/', requireRole(['admin']), async (req, res) => {
  console.log('🚗 [VEHICLES] Creando nuevo vehículo');
  try {
    await vehicleController.createVehicle(req, res);
  } catch (error) {
    console.error('❌ [VEHICLES] Error creando vehículo:', error.message);
    res.status(500).json({ error: 'Error creando vehículo' });
  }
});

// Actualizar un vehículo
router.put('/:id', requireRole(['admin']), async (req, res) => {
  console.log('🚗 [VEHICLES] Actualizando vehículo ID:', req.params.id);
  try {
    await vehicleController.updateVehicle(req, res);
  } catch (error) {
    console.error('❌ [VEHICLES] Error actualizando vehículo:', error.message);
    res.status(500).json({ error: 'Error actualizando vehículo' });
  }
});

// Eliminar un vehículo
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  console.log('🚗 [VEHICLES] Eliminando vehículo ID:', req.params.id);
  try {
    await vehicleController.deleteVehicle(req, res);
  } catch (error) {
    console.error('❌ [VEHICLES] Error eliminando vehículo:', error.message);
    res.status(500).json({ error: 'Error eliminando vehículo' });
  }
});

module.exports = router; 