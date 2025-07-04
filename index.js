require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { query } = require('./database-pg');
const { 
  authenticateToken, 
  requireRole, 
  login, 
  getCurrentUser, 
  changePassword 
} = require('./auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar JWT_SECRET si no está definido
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'mi_clave_secreta_super_segura_2024';
}

// Middleware para CORS y parsear JSON
app.use(cors());
app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de GestorDeCoches!');
});

// ===== RUTAS DE AUTENTICACIÓN =====

// Login
app.post('/api/auth/login', login);

// Obtener usuario actual
app.get('/api/auth/me', authenticateToken, getCurrentUser);

// Cambiar contraseña
app.post('/api/auth/change-password', authenticateToken, changePassword);

// ===== RUTAS DE VEHICULOS (PROTEGIDAS) =====

// Obtener todos los vehículos con información contextual
app.get('/api/vehiculos', authenticateToken, async (req, res) => {
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
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo vehículos:', error);
    res.status(500).json({ error: 'Error obteniendo vehículos' });
  }
});

// Obtener un vehículo por ID con información detallada
app.get('/api/vehiculos/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        v.*,
        cv.nombre as categoria_nombre,
        u.nombre as ubicacion_nombre,
        -- Información de reservas activas
        CASE 
          WHEN r.reserva_id IS NOT NULL THEN 
            json_build_object(
              'reserva_id', r.reserva_id,
              'cliente_nombre', c.nombre,
              'fecha_recogida', r.fecha_recogida_prevista,
              'fecha_devolucion', r.fecha_devolucion_prevista,
              'estado_entrega', r.estado_entrega
            )
          ELSE NULL
        END as reserva_activa,
        -- Información de alquileres activos
        CASE 
          WHEN a.alquiler_id IS NOT NULL THEN 
            json_build_object(
              'alquiler_id', a.alquiler_id,
              'cliente_nombre', ca.nombre,
              'fecha_recogida', a.fecha_recogida_real,
              'fecha_devolucion', a.fecha_devolucion_real,
              'estado', a.estado
            )
          ELSE NULL
        END as alquiler_activo
      FROM vehiculos v
      LEFT JOIN categorias_vehiculo cv ON v.categoria_id = cv.categoria_id
      LEFT JOIN ubicaciones u ON v.ubicacion_id = u.ubicacion_id
      LEFT JOIN reservas r ON v.vehiculo_id = r.vehiculo_id 
        AND r.estado_entrega = 'pendiente' 
        AND r.fecha_recogida_prevista >= CURRENT_DATE
      LEFT JOIN clientes c ON r.cliente_id = c.cliente_id
      LEFT JOIN alquileres a ON v.vehiculo_id = a.vehiculo_id 
        AND a.estado = 'abierto'
      LEFT JOIN clientes ca ON a.cliente_id = ca.cliente_id
      WHERE v.vehiculo_id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo vehículo:', error);
    res.status(500).json({ error: 'Error obteniendo vehículo' });
  }
});

// Crear un nuevo vehículo
app.post('/api/vehiculos', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const {
      vin, matricula, marca, modelo, anio, color, fecha_matricula, fecha_compra, km_compra, km_actuales, transmision, condicion, precio_compra_base, igic_compra, precio_compra_total, precio_venta_base, igic_venta, precio_venta_total, estado, categoria_id, ubicacion_id
    } = req.body;
    const result = await query(`
      INSERT INTO vehiculos (vin, matricula, marca, modelo, anio, color, fecha_matricula, fecha_compra, km_compra, km_actuales, transmision, condicion, precio_compra_base, igic_compra, precio_compra_total, precio_venta_base, igic_venta, precio_venta_total, estado, categoria_id, ubicacion_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
      RETURNING *
    `, [vin, matricula, marca, modelo, anio, color, fecha_matricula, fecha_compra, km_compra, km_actuales, transmision, condicion, precio_compra_base, igic_compra, precio_compra_total, precio_venta_base, igic_venta, precio_venta_total, estado, categoria_id, ubicacion_id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando vehículo:', error);
    res.status(500).json({ error: 'Error creando vehículo' });
  }
});

// Actualizar un vehículo
app.put('/api/vehiculos/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const {
      vin, matricula, marca, modelo, anio, color, fecha_matricula, fecha_compra, km_compra, km_actuales, transmision, condicion, precio_compra_base, igic_compra, precio_compra_total, precio_venta_base, igic_venta, precio_venta_total, estado, categoria_id, ubicacion_id
    } = req.body;
    const result = await query(`
      UPDATE vehiculos SET vin=$1, matricula=$2, marca=$3, modelo=$4, anio=$5, color=$6, fecha_matricula=$7, fecha_compra=$8, km_compra=$9, km_actuales=$10, transmision=$11, condicion=$12, precio_compra_base=$13, igic_compra=$14, precio_compra_total=$15, precio_venta_base=$16, igic_venta=$17, precio_venta_total=$18, estado=$19, categoria_id=$20, ubicacion_id=$21
      WHERE vehiculo_id = $22 RETURNING *
    `, [vin, matricula, marca, modelo, anio, color, fecha_matricula, fecha_compra, km_compra, km_actuales, transmision, condicion, precio_compra_base, igic_compra, precio_compra_total, precio_venta_base, igic_venta, precio_venta_total, estado, categoria_id, ubicacion_id, req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando vehículo:', error);
    res.status(500).json({ error: 'Error actualizando vehículo' });
  }
});

// Eliminar un vehículo
app.delete('/api/vehiculos/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await query('DELETE FROM vehiculos WHERE vehiculo_id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    res.json({ mensaje: 'Vehículo eliminado', vehiculo: result.rows[0] });
  } catch (error) {
    console.error('Error eliminando vehículo:', error);
    res.status(500).json({ error: 'Error eliminando vehículo' });
  }
});

// ===== RUTA DE PRUEBA =====

// Ruta para probar la conexión a la base de datos
app.get('/api/test', async (req, res) => {
  try {
    const result = await query('SELECT NOW() as current_time');
    res.json({ 
      message: 'Conexión exitosa a PostgreSQL',
      timestamp: result.rows[0].current_time
    });
  } catch (error) {
    console.error('Error en test:', error);
    res.status(500).json({ error: 'Error de conexión a la base de datos' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: PostgreSQL`);
  console.log(`🔐 Autenticación: JWT habilitada`);
}); 