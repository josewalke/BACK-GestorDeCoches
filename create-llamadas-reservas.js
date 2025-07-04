require('dotenv').config();
const { query } = require('./database-pg');

async function createLlamadasReservas() {
  try {
    console.log('📞 Creando tabla llamadas_reservas...');
    
    // Crear la tabla llamadas_reservas
    const createTable = `
      CREATE TABLE IF NOT EXISTS llamadas_reservas (
        llamada_id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(cliente_id),
        vehiculo_id INTEGER REFERENCES vehiculos(vehiculo_id),
        categoria_id INTEGER REFERENCES categorias_vehiculo(categoria_id),
        fecha_llamada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_reserva_deseada DATE NOT NULL,
        fecha_devolucion_deseada DATE NOT NULL,
        pickup_ubicacion_id INTEGER REFERENCES ubicaciones(ubicacion_id),
        dropoff_ubicacion_id INTEGER REFERENCES ubicaciones(ubicacion_id),
        estado_llamada llamada_estado_enum DEFAULT 'pendiente',
        motivo_llamada TEXT,
        notas_operador TEXT,
        operador_id INTEGER REFERENCES usuarios(usuario_id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Crear el tipo enum para el estado de la llamada
    const createEnum = `
      DO $$ BEGIN
        CREATE TYPE llamada_estado_enum AS ENUM (
          'pendiente',
          'confirmada',
          'rechazada',
          'cancelada',
          'completada'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    // Crear índices para mejorar el rendimiento
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_llamadas_reservas_cliente_id ON llamadas_reservas(cliente_id);
      CREATE INDEX IF NOT EXISTS idx_llamadas_reservas_vehiculo_id ON llamadas_reservas(vehiculo_id);
      CREATE INDEX IF NOT EXISTS idx_llamadas_reservas_fecha_llamada ON llamadas_reservas(fecha_llamada);
      CREATE INDEX IF NOT EXISTS idx_llamadas_reservas_estado ON llamadas_reservas(estado_llamada);
    `;
    
    // Ejecutar las consultas
    await query(createEnum);
    console.log('✅ Tipo enum creado');
    
    await query(createTable);
    console.log('✅ Tabla llamadas_reservas creada');
    
    await query(createIndexes);
    console.log('✅ Índices creados');
    
    // Verificar que la tabla se creó correctamente
    const checkTable = await query(`
      SELECT COUNT(*) as total 
      FROM information_schema.tables 
      WHERE table_name = 'llamadas_reservas'
    `);
    
    if (checkTable.rows[0].total > 0) {
      console.log('✅ Tabla llamadas_reservas creada exitosamente');
      
      // Mostrar la estructura de la tabla
      const structure = await query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'llamadas_reservas' 
        ORDER BY ordinal_position
      `);
      
      console.log('\n📋 Estructura de la tabla llamadas_reservas:');
      structure.rows.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error creando tabla:', error.message);
  }
}

if (require.main === module) {
  createLlamadasReservas();
}

module.exports = { createLlamadasReservas }; 