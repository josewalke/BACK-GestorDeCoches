const { query } = require('../config/database');

// Obtener todos los vehículos con información contextual
const getAllVehicles = async (req, res) => {
  console.log('🔍 [VEHICLE_CONTROLLER] Ejecutando getAllVehicles');
  try {
    const result = await query(`
      SELECT 
        v.*,
        cv.nombre as categoria_nombre,
        u.nombre as ubicacion_nombre,
        -- Alquiler activo
        (
          SELECT row_to_json(a) FROM (
            SELECT 
              alq.alquiler_id, alq.cliente_id, c.nombre as cliente_nombre,
              alq.fecha_recogida_real, alq.fecha_devolucion_real,
              alq.pickup_ubicacion_id, alq.dropoff_ubicacion_id,
              alq.km_salida, alq.nivel_combustible_salida,
              alq.km_entrada, alq.nivel_combustible_entrada,
              alq.estado
            FROM alquileres alq
            JOIN clientes c ON alq.cliente_id = c.cliente_id
            WHERE alq.vehiculo_id = v.vehiculo_id AND alq.estado = 'abierto'
            LIMIT 1
          ) a
        ) as alquiler_activo,
        -- Reserva activa
        (
          SELECT row_to_json(r) FROM (
            SELECT 
              res.reserva_id, res.cliente_id, c2.nombre as cliente_nombre,
              res.fecha_recogida_prevista, res.fecha_devolucion_prevista,
              res.pickup_ubicacion_id, res.dropoff_ubicacion_id,
              res.categoria_id, cat.nombre as categoria_nombre,
              res.estado_entrega, res.estado_devolucion
            FROM reservas res
            JOIN clientes c2 ON res.cliente_id = c2.cliente_id
            JOIN categorias_vehiculo cat ON res.categoria_id = cat.categoria_id
            WHERE res.vehiculo_id = v.vehiculo_id AND res.estado_entrega = 'pendiente' AND res.fecha_recogida_prevista >= CURRENT_DATE
            LIMIT 1
          ) r
        ) as reserva_activa,
        -- Mantenimiento activo
        (
          SELECT row_to_json(m) FROM (
            SELECT 
              mnt.mantenimiento_id, mnt.fecha_servicio, mnt.km_servicio,
              mnt.descripcion, mnt.coste, mnt.proveedor, mnt.proximo_servicio_km
            FROM mantenimientos mnt
            WHERE mnt.vehiculo_id = v.vehiculo_id
            ORDER BY mnt.fecha_servicio DESC
            LIMIT 1
          ) m
        ) as mantenimiento_activo
      FROM vehiculos v
      LEFT JOIN categorias_vehiculo cv ON v.categoria_id = cv.categoria_id
      LEFT JOIN ubicaciones u ON v.ubicacion_id = u.ubicacion_id
      ORDER BY v.fecha_compra DESC
    `);
    
    console.log(`✅ [VEHICLE_CONTROLLER] Se obtuvieron ${result.rows.length} vehículos`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ [VEHICLE_CONTROLLER] Error en getAllVehicles:', error.message);
    throw error;
  }
};

// Obtener un vehículo por ID con información detallada
const getVehicleById = async (req, res) => {
  console.log(`🔍 [VEHICLE_CONTROLLER] Ejecutando getVehicleById para ID: ${req.params.id}`);
  try {
    const result = await query(`
      SELECT 
        v.*,
        cv.nombre as categoria_nombre,
        u.nombre as ubicacion_nombre,
        -- Alquiler activo
        (
          SELECT row_to_json(a) FROM (
            SELECT 
              alq.alquiler_id, alq.cliente_id, c.nombre as cliente_nombre,
              alq.fecha_recogida_real, alq.fecha_devolucion_real,
              alq.pickup_ubicacion_id, alq.dropoff_ubicacion_id,
              alq.km_salida, alq.nivel_combustible_salida,
              alq.km_entrada, alq.nivel_combustible_entrada,
              alq.estado
            FROM alquileres alq
            JOIN clientes c ON alq.cliente_id = c.cliente_id
            WHERE alq.vehiculo_id = v.vehiculo_id AND alq.estado = 'abierto'
            LIMIT 1
          ) a
        ) as alquiler_activo,
        -- Reserva activa
        (
          SELECT row_to_json(r) FROM (
            SELECT 
              res.reserva_id, res.cliente_id, c2.nombre as cliente_nombre,
              res.fecha_recogida_prevista, res.fecha_devolucion_prevista,
              res.pickup_ubicacion_id, res.dropoff_ubicacion_id,
              res.categoria_id, cat.nombre as categoria_nombre,
              res.estado_entrega, res.estado_devolucion
            FROM reservas res
            JOIN clientes c2 ON res.cliente_id = c2.cliente_id
            JOIN categorias_vehiculo cat ON res.categoria_id = cat.categoria_id
            WHERE res.vehiculo_id = v.vehiculo_id AND res.estado_entrega = 'pendiente' AND res.fecha_recogida_prevista >= CURRENT_DATE
            LIMIT 1
          ) r
        ) as reserva_activa,
        -- Mantenimiento activo
        (
          SELECT row_to_json(m) FROM (
            SELECT 
              mnt.mantenimiento_id, mnt.fecha_servicio, mnt.km_servicio,
              mnt.descripcion, mnt.coste, mnt.proveedor, mnt.proximo_servicio_km
            FROM mantenimientos mnt
            WHERE mnt.vehiculo_id = v.vehiculo_id
            ORDER BY mnt.fecha_servicio DESC
            LIMIT 1
          ) m
        ) as mantenimiento_activo
      FROM vehiculos v
      LEFT JOIN categorias_vehiculo cv ON v.categoria_id = cv.categoria_id
      LEFT JOIN ubicaciones u ON v.ubicacion_id = u.ubicacion_id
      WHERE v.vehiculo_id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      console.log(`❌ [VEHICLE_CONTROLLER] Vehículo no encontrado con ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    console.log(`✅ [VEHICLE_CONTROLLER] Vehículo encontrado con ID: ${req.params.id}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ [VEHICLE_CONTROLLER] Error en getVehicleById:', error.message);
    throw error;
  }
};

// Crear un nuevo vehículo
const createVehicle = async (req, res) => {
  console.log('🔍 [VEHICLE_CONTROLLER] Ejecutando createVehicle');
  try {
    const {
      vin, matricula, marca, modelo, anio, color, fecha_matricula, fecha_compra, 
      km_compra, km_actuales, transmision, condicion, precio_compra_base, 
      igic_compra, precio_compra_total, precio_venta_base, igic_venta, 
      precio_venta_total, estado, categoria_id, ubicacion_id
    } = req.body;
    
    const result = await query(`
      INSERT INTO vehiculos (vin, matricula, marca, modelo, anio, color, fecha_matricula, 
        fecha_compra, km_compra, km_actuales, transmision, condicion, precio_compra_base, 
        igic_compra, precio_compra_total, precio_venta_base, igic_venta, precio_venta_total, 
        estado, categoria_id, ubicacion_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
      RETURNING *
    `, [vin, matricula, marca, modelo, anio, color, fecha_matricula, fecha_compra, 
         km_compra, km_actuales, transmision, condicion, precio_compra_base, igic_compra, 
         precio_compra_total, precio_venta_base, igic_venta, precio_venta_total, estado, 
         categoria_id, ubicacion_id]);
    
    console.log(`✅ [VEHICLE_CONTROLLER] Vehículo creado con ID: ${result.rows[0].vehiculo_id}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ [VEHICLE_CONTROLLER] Error en createVehicle:', error.message);
    throw error;
  }
};

// Actualizar un vehículo
const updateVehicle = async (req, res) => {
  console.log(`🔍 [VEHICLE_CONTROLLER] Ejecutando updateVehicle para ID: ${req.params.id}`);
  try {
    const {
      vin, matricula, marca, modelo, anio, color, fecha_matricula, fecha_compra, 
      km_compra, km_actuales, transmision, condicion, precio_compra_base, 
      igic_compra, precio_compra_total, precio_venta_base, igic_venta, 
      precio_venta_total, estado, categoria_id, ubicacion_id
    } = req.body;
    
    const result = await query(`
      UPDATE vehiculos SET vin=$1, matricula=$2, marca=$3, modelo=$4, anio=$5, 
        color=$6, fecha_matricula=$7, fecha_compra=$8, km_compra=$9, km_actuales=$10, 
        transmision=$11, condicion=$12, precio_compra_base=$13, igic_compra=$14, 
        precio_compra_total=$15, precio_venta_base=$16, igic_venta=$17, 
        precio_venta_total=$18, estado=$19, categoria_id=$20, ubicacion_id=$21
      WHERE vehiculo_id = $22 RETURNING *
    `, [vin, matricula, marca, modelo, anio, color, fecha_matricula, fecha_compra, 
         km_compra, km_actuales, transmision, condicion, precio_compra_base, igic_compra, 
         precio_compra_total, precio_venta_base, igic_venta, precio_venta_total, estado, 
         categoria_id, ubicacion_id, req.params.id]);
    
    if (result.rows.length === 0) {
      console.log(`❌ [VEHICLE_CONTROLLER] Vehículo no encontrado para actualizar con ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    console.log(`✅ [VEHICLE_CONTROLLER] Vehículo actualizado con ID: ${req.params.id}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ [VEHICLE_CONTROLLER] Error en updateVehicle:', error.message);
    throw error;
  }
};

// Eliminar un vehículo
const deleteVehicle = async (req, res) => {
  console.log(`🔍 [VEHICLE_CONTROLLER] Ejecutando deleteVehicle para ID: ${req.params.id}`);
  try {
    const result = await query('DELETE FROM vehiculos WHERE vehiculo_id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      console.log(`❌ [VEHICLE_CONTROLLER] Vehículo no encontrado para eliminar con ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    console.log(`✅ [VEHICLE_CONTROLLER] Vehículo eliminado con ID: ${req.params.id}`);
    res.json({ mensaje: 'Vehículo eliminado', vehiculo: result.rows[0] });
  } catch (error) {
    console.error('❌ [VEHICLE_CONTROLLER] Error en deleteVehicle:', error.message);
    throw error;
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
}; 