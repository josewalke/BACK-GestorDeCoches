require('dotenv').config();
const { query } = require('./database-pg');

async function updateVehicleStatesCorrected() {
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
    
    // Para los vehículos reservados, los mantenemos como 'disponible' 
    // pero podemos crear una vista o consulta especial para identificarlos
    console.log(`ℹ️  ${reservados.rows.length} vehículos tienen reservas activas pero se mantienen como 'disponible'`);
    
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
    
    // 6. Mostrar vehículos con reservas activas
    console.log('\n📋 Vehículos con reservas activas (marcados como disponibles):');
    const reservadosInfo = await query(`
      SELECT v.vehiculo_id, v.marca, v.modelo, v.estado,
             r.fecha_recogida_prevista, r.fecha_devolucion_prevista,
             c.nombre as cliente_nombre
      FROM vehiculos v
      JOIN reservas r ON v.vehiculo_id = r.vehiculo_id
      JOIN clientes c ON r.cliente_id = c.cliente_id
      WHERE r.estado_entrega = 'pendiente' 
      AND r.fecha_recogida_prevista >= CURRENT_DATE
      ORDER BY r.fecha_recogida_prevista
      LIMIT 10
    `);
    
    reservadosInfo.rows.forEach(vehiculo => {
      console.log(`   ${vehiculo.marca} ${vehiculo.modelo} (ID: ${vehiculo.vehiculo_id}): Reservado por ${vehiculo.cliente_nombre} del ${vehiculo.fecha_recogida_prevista} al ${vehiculo.fecha_devolucion_prevista}`);
    });
    
    // 7. Mostrar vehículos realmente disponibles (sin alquileres ni reservas)
    console.log('\n📋 Vehículos realmente disponibles:');
    const disponibles = await query(`
      SELECT v.vehiculo_id, v.marca, v.modelo, v.estado
      FROM vehiculos v
      WHERE v.estado = 'disponible'
      AND v.vehiculo_id NOT IN (
        SELECT DISTINCT vehiculo_id FROM alquileres WHERE estado = 'abierto'
      )
      AND v.vehiculo_id NOT IN (
        SELECT DISTINCT vehiculo_id FROM reservas 
        WHERE estado_entrega = 'pendiente' AND fecha_recogida_prevista >= CURRENT_DATE
      )
      ORDER BY v.vehiculo_id
      LIMIT 10
    `);
    
    disponibles.rows.forEach(vehiculo => {
      console.log(`   ${vehiculo.marca} ${vehiculo.modelo} (ID: ${vehiculo.vehiculo_id}): ${vehiculo.estado}`);
    });
    
    console.log('\n✅ Estados de vehículos actualizados correctamente');
    console.log('💡 Nota: Los vehículos con reservas se mantienen como "disponible" pero se pueden identificar con consultas específicas');
    
  } catch (error) {
    console.error('❌ Error actualizando estados:', error.message);
  }
}

if (require.main === module) {
  updateVehicleStatesCorrected();
}

module.exports = { updateVehicleStatesCorrected }; 