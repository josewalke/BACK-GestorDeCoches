const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth');
const vehicleController = require('../controllers/vehicleController');

// Obtener todos los vehículos
router.get('/', authenticateToken, async (req, res) => {
  console.log('🚗 [VEHICLES] Obteniendo lista de vehículos');
  try {
    await vehicleController.getAllVehicles(req, res);
  } catch (error) {
    console.error('❌ [VEHICLES] Error obteniendo vehículos:', error.message);
    res.status(500).json({ error: 'Error obteniendo vehículos' });
  }
});

// Obtener un vehículo por ID
router.get('/:id', authenticateToken, async (req, res) => {
  console.log('🚗 [VEHICLES] Obteniendo vehículo ID:', req.params.id);
  try {
    await vehicleController.getVehicleById(req, res);
  } catch (error) {
    console.error('❌ [VEHICLES] Error obteniendo vehículo:', error.message);
    res.status(500).json({ error: 'Error obteniendo vehículo' });
  }
});

// Crear un nuevo vehículo
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  console.log('🚗 [VEHICLES] Creando nuevo vehículo');
  try {
    await vehicleController.createVehicle(req, res);
  } catch (error) {
    console.error('❌ [VEHICLES] Error creando vehículo:', error.message);
    res.status(500).json({ error: 'Error creando vehículo' });
  }
});

// Actualizar un vehículo
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  console.log('🚗 [VEHICLES] Actualizando vehículo ID:', req.params.id);
  try {
    await vehicleController.updateVehicle(req, res);
  } catch (error) {
    console.error('❌ [VEHICLES] Error actualizando vehículo:', error.message);
    res.status(500).json({ error: 'Error actualizando vehículo' });
  }
});

// Eliminar un vehículo
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  console.log('🚗 [VEHICLES] Eliminando vehículo ID:', req.params.id);
  try {
    await vehicleController.deleteVehicle(req, res);
  } catch (error) {
    console.error('❌ [VEHICLES] Error eliminando vehículo:', error.message);
    res.status(500).json({ error: 'Error eliminando vehículo' });
  }
});

module.exports = router; 