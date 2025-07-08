const { query } = require('../src/config/database');

async function verifyRentalIntegrity() {
  try {
    console.log('🔍 Verificando integridad de datos de alquileres...\n');
    
    // 1. Verificar vehículos alquilados sin información de alquiler
    console.log('📋 1. Vehículos alquilados sin información de alquiler:');
    const vehiculosAlquiladosSinInfo = await query(`
      SELECT v.vehiculo_id, v.marca, v.modelo, v.matricula, v.estado
      FROM vehiculos v
      WHERE v.estado = 'alquilado'
      AND NOT EXISTS (
        SELECT 1 FROM alquileres a 
        WHERE a.vehiculo_id = v.vehiculo_id 
        AND a.estado = 'abierto'
      )
    `);
    
    if (vehiculosAlquiladosSinInfo.rows.length > 0) {
      console.log(`❌ Encontrados ${vehiculosAlquiladosSinInfo.rows.length} vehículos alquilados sin información de alquiler:`);
      vehiculosAlquiladosSinInfo.rows.forEach(v => {
        console.log(`   - ${v.marca} ${v.modelo} (${v.matricula})`);
      });
    } else {
      console.log('✅ Todos los vehículos alquilados tienen información de alquiler');
    }
    
    // 2. Verificar alquileres sin información de cliente
    console.log('\n📋 2. Alquileres sin información de cliente:');
    const alquileresSinCliente = await query(`
      SELECT a.alquiler_id, a.vehiculo_id, v.marca, v.modelo, v.matricula
      FROM alquileres a
      LEFT JOIN vehiculos v ON a.vehiculo_id = v.vehiculo_id
      WHERE a.cliente_id IS NULL OR a.cliente_id NOT IN (SELECT cliente_id FROM clientes)
    `);
    
    if (alquileresSinCliente.rows.length > 0) {
      console.log(`❌ Encontrados ${alquileresSinCliente.rows.length} alquileres sin cliente válido:`);
      alquileresSinCliente.rows.forEach(a => {
        console.log(`   - Alquiler ${a.alquiler_id}: ${a.marca} ${a.modelo} (${a.matricula})`);
      });
    } else {
      console.log('✅ Todos los alquileres tienen clientes válidos');
    }
    
    // 3. Verificar alquileres abiertos sin información completa
    console.log('\n📋 3. Alquileres abiertos con información incompleta:');
    const alquileresIncompletos = await query(`
      SELECT 
        a.alquiler_id,
        v.marca, v.modelo, v.matricula,
        c.nombre as cliente_nombre,
        a.fecha_recogida_real,
        a.fecha_devolucion_real,
        a.pickup_ubicacion_id,
        a.dropoff_ubicacion_id,
        a.km_salida,
        a.nivel_combustible_salida
      FROM alquileres a
      JOIN vehiculos v ON a.vehiculo_id = v.vehiculo_id
      LEFT JOIN clientes c ON a.cliente_id = c.cliente_id
      WHERE a.estado = 'abierto'
      AND (
        a.cliente_id IS NULL OR
        a.fecha_recogida_real IS NULL OR
        a.fecha_devolucion_real IS NULL OR
        a.pickup_ubicacion_id IS NULL OR
        a.dropoff_ubicacion_id IS NULL OR
        a.km_salida IS NULL OR
        a.nivel_combustible_salida IS NULL
      )
    `);
    
    if (alquileresIncompletos.rows.length > 0) {
      console.log(`❌ Encontrados ${alquileresIncompletos.rows.length} alquileres abiertos con información incompleta:`);
      alquileresIncompletos.rows.forEach(a => {
        console.log(`   - Alquiler ${a.alquiler_id}: ${a.marca} ${a.modelo} (${a.matricula})`);
        console.log(`     Cliente: ${a.cliente_nombre || 'N/A'}`);
        console.log(`     Fecha recogida: ${a.fecha_recogida_real || 'N/A'}`);
        console.log(`     Fecha devolución: ${a.fecha_devolucion_real || 'N/A'}`);
        console.log(`     Ubicación recogida: ${a.pickup_ubicacion_id || 'N/A'}`);
        console.log(`     Ubicación devolución: ${a.dropoff_ubicacion_id || 'N/A'}`);
        console.log(`     Km salida: ${a.km_salida || 'N/A'}`);
        console.log(`     Combustible salida: ${a.nivel_combustible_salida || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('✅ Todos los alquileres abiertos tienen información completa');
    }
    
    // 4. Verificar vehículos con estado incorrecto
    console.log('\n📋 4. Vehículos con estado incorrecto:');
    const vehiculosEstadoIncorrecto = await query(`
      SELECT 
        v.vehiculo_id, v.marca, v.modelo, v.matricula, v.estado,
        CASE 
          WHEN EXISTS (SELECT 1 FROM alquileres a WHERE a.vehiculo_id = v.vehiculo_id AND a.estado = 'abierto') THEN 'alquilado'
          WHEN EXISTS (SELECT 1 FROM reservas r WHERE r.vehiculo_id = v.vehiculo_id AND r.estado_entrega = 'pendiente' AND r.fecha_recogida_prevista >= CURRENT_DATE) THEN 'reservado'
          WHEN EXISTS (SELECT 1 FROM mantenimientos m WHERE m.vehiculo_id = v.vehiculo_id) THEN 'taller'
          ELSE 'disponible'
        END as estado_correcto
      FROM vehiculos v
      WHERE v.estado != CASE 
        WHEN EXISTS (SELECT 1 FROM alquileres a WHERE a.vehiculo_id = v.vehiculo_id AND a.estado = 'abierto') THEN 'alquilado'
        WHEN EXISTS (SELECT 1 FROM reservas r WHERE r.vehiculo_id = v.vehiculo_id AND r.estado_entrega = 'pendiente' AND r.fecha_recogida_prevista >= CURRENT_DATE) THEN 'reservado'
        WHEN EXISTS (SELECT 1 FROM mantenimientos m WHERE m.vehiculo_id = v.vehiculo_id) THEN 'taller'
        ELSE 'disponible'
      END
    `);
    
    if (vehiculosEstadoIncorrecto.rows.length > 0) {
      console.log(`❌ Encontrados ${vehiculosEstadoIncorrecto.rows.length} vehículos con estado incorrecto:`);
      vehiculosEstadoIncorrecto.rows.forEach(v => {
        console.log(`   - ${v.marca} ${v.modelo} (${v.matricula})`);
        console.log(`     Estado actual: ${v.estado}`);
        console.log(`     Estado correcto: ${v.estado_correcto}`);
        console.log('');
      });
    } else {
      console.log('✅ Todos los vehículos tienen el estado correcto');
    }
    
    // 5. Estadísticas generales
    console.log('\n📊 Estadísticas generales:');
    const estadisticas = await query(`
      SELECT 
        COUNT(*) as total_vehiculos,
        COUNT(CASE WHEN estado = 'disponible' THEN 1 END) as disponibles,
        COUNT(CASE WHEN estado = 'alquilado' THEN 1 END) as alquilados,
        COUNT(CASE WHEN estado = 'reservado' THEN 1 END) as reservados,
        COUNT(CASE WHEN estado = 'taller' THEN 1 END) as en_mantenimiento,
        COUNT(CASE WHEN estado = 'vendido' THEN 1 END) as vendidos
      FROM vehiculos
    `);
    
    const stats = estadisticas.rows[0];
    console.log(`   Total vehículos: ${stats.total_vehiculos}`);
    console.log(`   Disponibles: ${stats.disponibles}`);
    console.log(`   Alquilados: ${stats.alquilados}`);
    console.log(`   Reservados: ${stats.reservados}`);
    console.log(`   En mantenimiento: ${stats.en_mantenimiento}`);
    console.log(`   Vendidos: ${stats.vendidos}`);
    
    // 6. Alquileres activos
    const alquileresActivos = await query(`
      SELECT COUNT(*) as total_alquileres_activos
      FROM alquileres 
      WHERE estado = 'abierto'
    `);
    
    console.log(`   Alquileres activos: ${alquileresActivos.rows[0].total_alquileres_activos}`);
    
    console.log('\n✅ Verificación de integridad completada');
    
  } catch (error) {
    console.error('❌ Error verificando integridad:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verifyRentalIntegrity();
}

module.exports = { verifyRentalIntegrity }; 