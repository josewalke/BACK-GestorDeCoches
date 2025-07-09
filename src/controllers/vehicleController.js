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
              alq.alquiler_id, 
              alq.cliente_id, 
              c.nombre as cliente_nombre,
              c.apellidos as cliente_apellidos,
              c.email as cliente_email,
              c.telefono as cliente_telefono,
              c.dni_pasaporte as cliente_dni,
              alq.fecha_recogida_real, 
              alq.fecha_devolucion_real,
              alq.pickup_ubicacion_id, 
              alq.dropoff_ubicacion_id,
              pickup_ub.nombre as pickup_ubicacion_nombre,
              dropoff_ub.nombre as dropoff_ubicacion_nombre,
              alq.km_salida, 
              alq.nivel_combustible_salida,
              alq.km_entrada, 
              alq.nivel_combustible_entrada,
              alq.precio_por_dia,
              alq.total_dias,
              alq.ingreso_total,
              alq.ingreso_final,
              alq.estado
            FROM alquileres alq
            JOIN clientes c ON alq.cliente_id = c.cliente_id
            LEFT JOIN ubicaciones pickup_ub ON alq.pickup_ubicacion_id = pickup_ub.ubicacion_id
            LEFT JOIN ubicaciones dropoff_ub ON alq.dropoff_ubicacion_id = dropoff_ub.ubicacion_id
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
        ) as mantenimiento_activo,
        -- Información de venta
        (
          SELECT row_to_json(venta) FROM (
            SELECT 
              vent.fecha_venta, vent.monto_venta, vent.metodo_pago,
              vent.cliente_nombre, vent.cliente_apellidos, vent.cliente_dni,
              vent.cliente_email, vent.cliente_telefono, vent.cliente_direccion,
              vent.notas
            FROM ventas vent
            WHERE vent.vehiculo_id = v.vehiculo_id
            ORDER BY vent.fecha_venta DESC
            LIMIT 1
          ) venta
        ) as venta_info,
        -- Estadísticas de alquileres e ingresos
        (
          SELECT row_to_json(stats) FROM (
            SELECT 
              COUNT(a.alquiler_id) as total_alquileres,
              COUNT(CASE WHEN a.estado = 'cerrado' THEN 1 END) as alquileres_completados,
              COALESCE(SUM(a.ingreso_final), 0) as ingresos_totales_alquileres,
              COALESCE(SUM(a.total_dias), 0) as dias_total_alquilado,
              CASE 
                WHEN COUNT(a.alquiler_id) > 0 THEN 
                  COALESCE(SUM(a.ingreso_final), 0) / COUNT(a.alquiler_id)
                ELSE 0 
              END as ingreso_promedio_por_alquiler,
              CASE 
                WHEN COUNT(a.alquiler_id) > 0 THEN 
                  COALESCE(SUM(a.ingreso_final), 0) / NULLIF(SUM(a.total_dias), 0)
                ELSE 0 
              END as ingreso_promedio_por_dia
            FROM alquileres a
            WHERE a.vehiculo_id = v.vehiculo_id
          ) stats
        ) as estadisticas_alquileres
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
              alq.alquiler_id, 
              alq.cliente_id, 
              c.nombre as cliente_nombre,
              c.apellidos as cliente_apellidos,
              c.email as cliente_email,
              c.telefono as cliente_telefono,
              c.dni_pasaporte as cliente_dni,
              alq.fecha_recogida_real, 
              alq.fecha_devolucion_real,
              alq.pickup_ubicacion_id, 
              alq.dropoff_ubicacion_id,
              pickup_ub.nombre as pickup_ubicacion_nombre,
              dropoff_ub.nombre as dropoff_ubicacion_nombre,
              alq.km_salida, 
              alq.nivel_combustible_salida,
              alq.km_entrada, 
              alq.nivel_combustible_entrada,
              alq.precio_por_dia,
              alq.total_dias,
              alq.ingreso_total,
              alq.ingreso_final,
              alq.estado
            FROM alquileres alq
            JOIN clientes c ON alq.cliente_id = c.cliente_id
            LEFT JOIN ubicaciones pickup_ub ON alq.pickup_ubicacion_id = pickup_ub.ubicacion_id
            LEFT JOIN ubicaciones dropoff_ub ON alq.dropoff_ubicacion_id = dropoff_ub.ubicacion_id
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
        ) as mantenimiento_activo,
        -- Información de venta
        (
          SELECT row_to_json(venta) FROM (
            SELECT 
              vent.fecha_venta, vent.monto_venta, vent.metodo_pago,
              vent.cliente_nombre, vent.cliente_apellidos, vent.cliente_dni,
              vent.cliente_email, vent.cliente_telefono, vent.cliente_direccion,
              vent.notas
            FROM ventas vent
            WHERE vent.vehiculo_id = v.vehiculo_id
            ORDER BY vent.fecha_venta DESC
            LIMIT 1
          ) venta
        ) as venta_info,
        -- Estadísticas de alquileres e ingresos
        (
          SELECT row_to_json(stats) FROM (
            SELECT 
              COUNT(a.alquiler_id) as total_alquileres,
              COUNT(CASE WHEN a.estado = 'cerrado' THEN 1 END) as alquileres_completados,
              COALESCE(SUM(a.ingreso_final), 0) as ingresos_totales_alquileres,
              COALESCE(SUM(a.total_dias), 0) as dias_total_alquilado,
              CASE 
                WHEN COUNT(a.alquiler_id) > 0 THEN 
                  COALESCE(SUM(a.ingreso_final), 0) / COUNT(a.alquiler_id)
                ELSE 0 
              END as ingreso_promedio_por_alquiler,
              CASE 
                WHEN COUNT(a.alquiler_id) > 0 THEN 
                  COALESCE(SUM(a.ingreso_final), 0) / NULLIF(SUM(a.total_dias), 0)
                ELSE 0 
              END as ingreso_promedio_por_dia
            FROM alquileres a
            WHERE a.vehiculo_id = v.vehiculo_id
          ) stats
        ) as estadisticas_alquileres
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

// Obtener todas las ubicaciones
const getAllLocations = async (req, res) => {
  console.log('🔍 [VEHICLE_CONTROLLER] Ejecutando getAllLocations');
  try {
    const result = await query(`
      SELECT ubicacion_id, nombre
      FROM ubicaciones
      ORDER BY nombre
    `);
    
    console.log(`✅ [VEHICLE_CONTROLLER] Se obtuvieron ${result.rows.length} ubicaciones`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ [VEHICLE_CONTROLLER] Error en getAllLocations:', error.message);
    throw error;
  }
};

// Obtener todas las reservas de un vehículo
const getVehicleReservations = async (req, res) => {
  console.log(`🔍 [VEHICLE_CONTROLLER] Ejecutando getVehicleReservations para vehículo ID: ${req.params.vehicleId}`);
  try {
    const result = await query(`
      SELECT 
        res.reserva_id,
        res.fecha_recogida_prevista,
        res.fecha_devolucion_prevista,
        res.estado_entrega,
        res.estado_devolucion,
        c.nombre as cliente_nombre,
        c.apellidos as cliente_apellidos,
        CONCAT(c.nombre, ' ', c.apellidos) as cliente_nombre_completo,
        cat.nombre as categoria_nombre,
        pickup_ub.nombre as pickup_ubicacion_nombre,
        dropoff_ub.nombre as dropoff_ubicacion_nombre
      FROM reservas res
      JOIN clientes c ON res.cliente_id = c.cliente_id
      JOIN categorias_vehiculo cat ON res.categoria_id = cat.categoria_id
      LEFT JOIN ubicaciones pickup_ub ON res.pickup_ubicacion_id = pickup_ub.ubicacion_id
      LEFT JOIN ubicaciones dropoff_ub ON res.dropoff_ubicacion_id = dropoff_ub.ubicacion_id
      WHERE res.vehiculo_id = $1
      ORDER BY res.fecha_recogida_prevista ASC
    `, [req.params.vehicleId]);
    
    console.log(`✅ [VEHICLE_CONTROLLER] Se obtuvieron ${result.rows.length} reservas para el vehículo ${req.params.vehicleId}`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ [VEHICLE_CONTROLLER] Error en getVehicleReservations:', error.message);
    throw error;
  }
};

// Obtener dashboard con estadísticas generales
const getDashboard = async (req, res) => {
  console.log('🔍 [VEHICLE_CONTROLLER] Ejecutando getDashboard');
  try {
    // Obtener estadísticas generales
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_vehiculos,
        COUNT(CASE WHEN estado = 'disponible' THEN 1 END) as vehiculos_disponibles,
        COUNT(CASE WHEN estado = 'alquilado' THEN 1 END) as vehiculos_alquilados,
        COUNT(CASE WHEN estado = 'vendido' THEN 1 END) as vehiculos_vendidos,
        COUNT(CASE WHEN estado = 'taller' THEN 1 END) as vehiculos_en_taller,
        COUNT(CASE WHEN estado = 'reservado' THEN 1 END) as vehiculos_reservados
      FROM vehiculos
    `);

    // Obtener estadísticas de alquileres
    const rentalStatsResult = await query(`
      SELECT 
        COUNT(*) as total_alquileres,
        COUNT(CASE WHEN estado = 'abierto' THEN 1 END) as alquileres_abiertos,
        COUNT(CASE WHEN estado = 'cerrado' THEN 1 END) as alquileres_cerrados,
        COALESCE(SUM(ingreso_final), 0) as ingresos_totales,
        COALESCE(AVG(ingreso_final), 0) as ingreso_promedio
      FROM alquileres
    `);

    // Obtener estadísticas de ventas
    const salesStatsResult = await query(`
      SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(monto_venta), 0) as ingresos_ventas,
        COALESCE(AVG(monto_venta), 0) as venta_promedio
      FROM ventas
    `);

    // Obtener top 5 vehículos por ingresos
    const topVehiclesResult = await query(`
      SELECT 
        v.vehiculo_id,
        v.marca,
        v.modelo,
        v.matricula,
        v.estado,
        COALESCE(SUM(a.ingreso_final), 0) as ingresos_totales,
        COUNT(a.alquiler_id) as total_alquileres
      FROM vehiculos v
      LEFT JOIN alquileres a ON v.vehiculo_id = a.vehiculo_id
      GROUP BY v.vehiculo_id, v.marca, v.modelo, v.matricula, v.estado
      ORDER BY ingresos_totales DESC
      LIMIT 5
    `);

    // Obtener estadísticas por marca
    const brandStatsResult = await query(`
      SELECT 
        marca,
        COUNT(*) as total_vehiculos,
        COUNT(CASE WHEN estado = 'disponible' THEN 1 END) as disponibles,
        COUNT(CASE WHEN estado = 'alquilado' THEN 1 END) as alquilados,
        COUNT(CASE WHEN estado = 'vendido' THEN 1 END) as vendidos
      FROM vehiculos
      GROUP BY marca
      ORDER BY total_vehiculos DESC
    `);

    const dashboard = {
      estadisticas_generales: statsResult.rows[0],
      estadisticas_alquileres: rentalStatsResult.rows[0],
      estadisticas_ventas: salesStatsResult.rows[0],
      top_vehiculos: topVehiclesResult.rows,
      estadisticas_por_marca: brandStatsResult.rows
    };

    console.log('✅ [VEHICLE_CONTROLLER] Dashboard generado exitosamente');
    res.json(dashboard);
  } catch (error) {
    console.error('❌ [VEHICLE_CONTROLLER] Error en getDashboard:', error.message);
    throw error;
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAllLocations,
  getVehicleReservations,
  getDashboard
}; 