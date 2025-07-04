require('dotenv').config();
const { query } = require('./database-pg');

async function addReservadoEnum() {
  try {
    console.log('🔧 Añadiendo valor "reservado" al enum estado_vehiculo_enum...\n');
    
    // 1. Verificar valores actuales del enum
    console.log('📋 Valores actuales del enum:');
    const currentValues = await query(`
      SELECT unnest(enum_range(NULL::estado_vehiculo_enum)) as valor
    `);
    
    currentValues.rows.forEach(val => {
      console.log(`   - ${val.valor}`);
    });
    
    // 2. Añadir el valor "reservado" al enum
    console.log('\n➕ Añadiendo valor "reservado"...');
    await query(`
      ALTER TYPE estado_vehiculo_enum ADD VALUE 'reservado'
    `);
    console.log('✅ Valor "reservado" añadido al enum');
    
    // 3. Verificar valores actualizados del enum
    console.log('\n📋 Valores actualizados del enum:');
    const updatedValues = await query(`
      SELECT unnest(enum_range(NULL::estado_vehiculo_enum)) as valor
    `);
    
    updatedValues.rows.forEach(val => {
      console.log(`   - ${val.valor}`);
    });
    
    // 4. Ahora actualizar los estados de los vehículos con el nuevo valor
    console.log('\n🔄 Actualizando estados de vehículos con el nuevo valor "reservado"...');
    
    // Identificar vehículos alquilados
    const alquilados = await query(`
      SELECT DISTINCT vehiculo_id
      FROM alquileres
      WHERE estado = 'abierto'
    `);
    
    // Identificar vehículos reservados
    const reservados = await query(`
      SELECT DISTINCT vehiculo_id
      FROM reservas
      WHERE estado_entrega = 'pendiente' 
      AND fecha_recogida_prevista >= CURRENT_DATE
    `);
    
    // Resetear todos los vehículos a 'disponible'
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
    
    // Marcar vehículos reservados
    if (reservados.rows.length > 0) {
      const reservadosIds = reservados.rows.map(row => row.vehiculo_id).join(',');
      await query(`
        UPDATE vehiculos 
        SET estado = 'reservado'
        WHERE vehiculo_id IN (${reservadosIds})
        AND estado != 'alquilado'
      `);
      console.log(`✅ ${reservados.rows.length} vehículos marcados como reservados`);
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
    
    // 6. Mostrar ejemplos de cada estado
    console.log('\n📋 Ejemplos de vehículos por estado:');
    
    // Vehículos alquilados
    const alquiladosEjemplos = await query(`
      SELECT v.vehiculo_id, v.marca, v.modelo, v.estado,
             a.fecha_recogida_real, c.nombre as cliente_nombre
      FROM vehiculos v
      JOIN alquileres a ON v.vehiculo_id = a.vehiculo_id
      JOIN clientes c ON a.cliente_id = c.cliente_id
      WHERE v.estado = 'alquilado' AND a.estado = 'abierto'
      LIMIT 3
    `);
    
    if (alquiladosEjemplos.rows.length > 0) {
      console.log('\n🚗 Vehículos alquilados:');
      alquiladosEjemplos.rows.forEach(vehiculo => {
        console.log(`   ${vehiculo.marca} ${vehiculo.modelo}: Alquilado por ${vehiculo.cliente_nombre} desde ${vehiculo.fecha_recogida_real}`);
      });
    }
    
    // Vehículos reservados
    const reservadosEjemplos = await query(`
      SELECT v.vehiculo_id, v.marca, v.modelo, v.estado,
             r.fecha_recogida_prevista, r.fecha_devolucion_prevista, c.nombre as cliente_nombre
      FROM vehiculos v
      JOIN reservas r ON v.vehiculo_id = r.vehiculo_id
      JOIN clientes c ON r.cliente_id = c.cliente_id
      WHERE v.estado = 'reservado' AND r.estado_entrega = 'pendiente'
      LIMIT 3
    `);
    
    if (reservadosEjemplos.rows.length > 0) {
      console.log('\n📅 Vehículos reservados:');
      reservadosEjemplos.rows.forEach(vehiculo => {
        console.log(`   ${vehiculo.marca} ${vehiculo.modelo}: Reservado por ${vehiculo.cliente_nombre} del ${vehiculo.fecha_recogida_prevista} al ${vehiculo.fecha_devolucion_prevista}`);
      });
    }
    
    // Vehículos disponibles
    const disponiblesEjemplos = await query(`
      SELECT vehiculo_id, marca, modelo, estado
      FROM vehiculos
      WHERE estado = 'disponible'
      LIMIT 3
    `);
    
    if (disponiblesEjemplos.rows.length > 0) {
      console.log('\n✅ Vehículos disponibles:');
      disponiblesEjemplos.rows.forEach(vehiculo => {
        console.log(`   ${vehiculo.marca} ${vehiculo.modelo}: ${vehiculo.estado}`);
      });
    }
    
    console.log('\n✅ Enum actualizado y estados de vehículos corregidos');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (require.main === module) {
  addReservadoEnum();
}

module.exports = { addReservadoEnum }; 