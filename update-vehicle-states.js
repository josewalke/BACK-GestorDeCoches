require('dotenv').config();
const { query } = require('./database-pg');

async function updateVehicleStates() {
  try {
    console.log('🚗 Actualizando estados de vehículos basándose en datos reales...\n');
    
    // 1. Mostrar estado actual de los vehículos
    console.log('📊 Estado actual de los vehículos:');
    const currentStates = await query(`
      SELECT estado, COUNT(*) as total
      FROM vehiculos
      GROUP BY estado
      ORDER BY total DESC
    `);
    
    currentStates.rows.forEach(state => {
      console.log(`   ${state.estado}: ${state.total} vehículos`);
    });
    
    // 2. Identificar vehículos alquilados (con alquileres activos)
    console.log('\n🔍 Identificando vehículos alquilados...');
    const alquilados = await query(`
      SELECT DISTINCT vehiculo_id
      FROM alquileres
      WHERE estado = 'abierto'
    `);
    
    console.log(`   Vehículos alquilados encontrados: ${alquilados.rows.length}`);
    
    // 3. Identificar vehículos reservados (con reservas confirmadas)
    console.log('\n📅 Identificando vehículos reservados...');
    const reservados = await query(`
      SELECT DISTINCT vehiculo_id
      FROM reservas
      WHERE estado_entrega = 'pendiente' 
      AND fecha_recogida_prevista >= CURRENT_DATE
    `);
    
    console.log(`   Vehículos reservados encontrados: ${reservados.rows.length}`);
    
    // 4. Actualizar estados de vehículos
    console.log('\n🔄 Actualizando estados...');
    
    // Primero, resetear todos los vehículos a 'disponible'
    await query(`
      UPDATE vehiculos 
      SET estado = 'disponible'
    `);
    console.log('✅ Todos los vehículos marcados como disponibles');
    
    // Marcar vehículos alquilados
    if (alquilados.rows.length > 0) {
      const alquiladosIds = alquilados.rows.map(row => row.vehiculo_id).join(',');
      await query(`
        UPDATE vehiculos 
        SET estado = 'alquilado'
        WHERE vehiculo_id IN (${alquiladosIds})
      `);
      console.log(`✅ ${alquilados.rows.length} vehículos marcados como alquilados`);
    }
    
    // Marcar vehículos reservados (pero no alquilados)
    if (reservados.rows.length > 0) {
      const reservadosIds = reservados.rows.map(row => row.vehiculo_id).join(',');
      await query(`
        UPDATE vehiculos 
        SET estado = 'reservado'
        WHERE vehiculo_id IN (${reservadosIds})
        AND estado != 'alquilado'
      `);
      console.log(`✅ Vehículos reservados marcados (excluyendo los ya alquilados)`);
    }
    
    // 5. Mostrar estado final
    console.log('\n📊 Estado final de los vehículos:');
    const finalStates = await query(`
      SELECT estado, COUNT(*) as total
      FROM vehiculos
      GROUP BY estado
      ORDER BY total DESC
    `);
    
    finalStates.rows.forEach(state => {
      console.log(`   ${state.estado}: ${state.total} vehículos`);
    });
    
    // 6. Mostrar algunos ejemplos de vehículos con sus estados
    console.log('\n📋 Ejemplos de vehículos con sus estados actualizados:');
    const examples = await query(`
      SELECT v.vehiculo_id, v.marca, v.modelo, v.estado,
             CASE 
               WHEN a.alquiler_id IS NOT NULL THEN 'Alquilado desde: ' || a.fecha_recogida_real::date
               WHEN r.reserva_id IS NOT NULL THEN 'Reservado para: ' || r.fecha_recogida_prevista::date
               ELSE 'Disponible'
             END as detalle
      FROM vehiculos v
      LEFT JOIN alquileres a ON v.vehiculo_id = a.vehiculo_id AND a.estado = 'abierto'
      LEFT JOIN reservas r ON v.vehiculo_id = r.vehiculo_id AND r.estado_entrega = 'pendiente'
      ORDER BY v.estado, v.vehiculo_id
      LIMIT 10
    `);
    
    examples.rows.forEach(vehiculo => {
      console.log(`   ${vehiculo.marca} ${vehiculo.modelo} (ID: ${vehiculo.vehiculo_id}): ${vehiculo.estado} - ${vehiculo.detalle}`);
    });
    
    console.log('\n✅ Estados de vehículos actualizados correctamente');
    
  } catch (error) {
    console.error('❌ Error actualizando estados:', error.message);
  }
}

if (require.main === module) {
  updateVehicleStates();
}

module.exports = { updateVehicleStates }; 