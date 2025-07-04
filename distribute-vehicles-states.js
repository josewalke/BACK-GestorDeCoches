require('dotenv').config();
const { query } = require('./database-pg');

async function distributeVehiclesStates() {
  try {
    console.log('🚗 Distribuyendo vehículos en todos los estados posibles...\n');
    
    // 1. Obtener todos los vehículos
    const vehiculos = await query('SELECT vehiculo_id, estado FROM vehiculos ORDER BY vehiculo_id');
    console.log(`📊 Total de vehículos: ${vehiculos.rows.length}`);
    
    // 2. Distribuir vehículos en diferentes estados
    const estados = ['disponible', 'alquilado', 'reservado', 'taller', 'vendido'];
    const distribucion = {
      disponible: Math.floor(vehiculos.rows.length * 0.4), // 40% disponibles
      alquilado: Math.floor(vehiculos.rows.length * 0.2),  // 20% alquilados
      reservado: Math.floor(vehiculos.rows.length * 0.2),  // 20% reservados
      taller: Math.floor(vehiculos.rows.length * 0.1),     // 10% en mantenimiento
      vendido: Math.floor(vehiculos.rows.length * 0.1)     // 10% vendidos
    };
    
    console.log('📋 Distribución planificada:');
    Object.entries(distribucion).forEach(([estado, cantidad]) => {
      console.log(`   ${estado}: ${cantidad} vehículos`);
    });
    
    // 3. Actualizar estados de vehículos
    let indice = 0;
    
    for (const [estado, cantidad] of Object.entries(distribucion)) {
      for (let i = 0; i < cantidad && indice < vehiculos.rows.length; i++) {
        const vehiculo = vehiculos.rows[indice];
        await query(
          'UPDATE vehiculos SET estado = $1 WHERE vehiculo_id = $2',
          [estado, vehiculo.vehiculo_id]
        );
        console.log(`   ✅ Vehículo ${vehiculo.vehiculo_id} → ${estado}`);
        indice++;
      }
    }
    
    // 4. Los vehículos restantes se marcan como disponibles
    while (indice < vehiculos.rows.length) {
      const vehiculo = vehiculos.rows[indice];
      await query(
        'UPDATE vehiculos SET estado = $1 WHERE vehiculo_id = $2',
        ['disponible', vehiculo.vehiculo_id]
      );
      console.log(`   ✅ Vehículo ${vehiculo.vehiculo_id} → disponible (restante)`);
      indice++;
    }
    
    // 5. Verificar la distribución final
    console.log('\n📊 Verificando distribución final...');
    const estadosFinales = await query(`
      SELECT estado, COUNT(*) as cantidad 
      FROM vehiculos 
      GROUP BY estado 
      ORDER BY estado
    `);
    
    console.log('✅ Distribución final:');
    estadosFinales.rows.forEach(row => {
      console.log(`   ${row.estado}: ${row.cantidad} vehículos`);
    });
    
    // 6. Crear alquileres para vehículos marcados como alquilados
    console.log('\n🚗 Creando alquileres para vehículos alquilados...');
    const vehiculosAlquilados = await query(`
      SELECT vehiculo_id FROM vehiculos WHERE estado = 'alquilado'
    `);
    
    for (const vehiculo of vehiculosAlquilados.rows) {
      // Seleccionar un cliente aleatorio
      const cliente = await query(`
        SELECT cliente_id FROM clientes ORDER BY RANDOM() LIMIT 1
      `);
      
      if (cliente.rows.length > 0) {
        // Crear alquiler
        await query(`
          INSERT INTO alquileres (
            vehiculo_id, cliente_id, fecha_recogida_real, fecha_devolucion_real,
            estado, precio_total, metodo_pago, notas
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          vehiculo.vehiculo_id,
          cliente.rows[0].cliente_id,
          new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
          new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Próximos 30 días
          'abierto',
          Math.floor(Math.random() * 500) + 100,
          ['efectivo', 'tarjeta', 'transferencia'][Math.floor(Math.random() * 3)],
          'Alquiler activo'
        ]);
        
        console.log(`   ✅ Alquiler creado para vehículo ${vehiculo.vehiculo_id}`);
      }
    }
    
    // 7. Crear reservas para vehículos marcados como reservados
    console.log('\n📅 Creando reservas para vehículos reservados...');
    const vehiculosReservados = await query(`
      SELECT vehiculo_id FROM vehiculos WHERE estado = 'reservado'
    `);
    
    for (const vehiculo of vehiculosReservados.rows) {
      // Seleccionar un cliente aleatorio
      const cliente = await query(`
        SELECT cliente_id FROM clientes ORDER BY RANDOM() LIMIT 1
      `);
      
      if (cliente.rows.length > 0) {
        // Crear reserva
        const fechaRecogida = new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000); // Próximos 60 días
        const fechaDevolucion = new Date(fechaRecogida.getTime() + (Math.random() * 14 + 1) * 24 * 60 * 60 * 1000); // 1-15 días después
        
        await query(`
          INSERT INTO reservas (
            vehiculo_id, cliente_id, fecha_recogida_prevista, fecha_devolucion_prevista,
            estado_entrega, precio_total, notas
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          vehiculo.vehiculo_id,
          cliente.rows[0].cliente_id,
          fechaRecogida,
          fechaDevolucion,
          'pendiente',
          Math.floor(Math.random() * 500) + 100,
          'Reserva activa'
        ]);
        
        console.log(`   ✅ Reserva creada para vehículo ${vehiculo.vehiculo_id}`);
      }
    }
    
    // 8. Crear mantenimientos para vehículos en taller
    console.log('\n🔧 Creando mantenimientos para vehículos en taller...');
    const vehiculosEnTaller = await query(`
      SELECT vehiculo_id FROM vehiculos WHERE estado = 'taller'
    `);
    
    for (const vehiculo of vehiculosEnTaller.rows) {
      await query(`
        INSERT INTO mantenimientos (
          vehiculo_id, tipo_mantenimiento, descripcion, fecha_inicio, fecha_fin_prevista,
          costo_estimado, estado, notas
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        vehiculo.vehiculo_id,
        ['revision', 'reparacion', 'mantenimiento_preventivo'][Math.floor(Math.random() * 3)],
        'Mantenimiento en curso',
        new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
        new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000), // Próximos 14 días
        Math.floor(Math.random() * 1000) + 200,
        'en_progreso',
        'Mantenimiento programado'
      ]);
      
      console.log(`   ✅ Mantenimiento creado para vehículo ${vehiculo.vehiculo_id}`);
    }
    
    console.log('\n🎯 ¡Distribución completada exitosamente!');
    console.log('📊 Resumen final:');
    
    const resumenFinal = await query(`
      SELECT 
        v.estado,
        COUNT(*) as cantidad,
        COUNT(a.alquiler_id) as con_alquiler,
        COUNT(r.reserva_id) as con_reserva,
        COUNT(m.mantenimiento_id) as con_mantenimiento
      FROM vehiculos v
      LEFT JOIN alquileres a ON v.vehiculo_id = a.vehiculo_id AND a.estado = 'abierto'
      LEFT JOIN reservas r ON v.vehiculo_id = r.vehiculo_id AND r.estado_entrega = 'pendiente'
      LEFT JOIN mantenimientos m ON v.vehiculo_id = m.vehiculo_id AND m.estado = 'en_progreso'
      GROUP BY v.estado
      ORDER BY v.estado
    `);
    
    resumenFinal.rows.forEach(row => {
      console.log(`   ${row.estado}: ${row.cantidad} vehículos (${row.con_alquiler} alquilados, ${row.con_reserva} reservados, ${row.con_mantenimiento} en mantenimiento)`);
    });
    
  } catch (error) {
    console.error('❌ Error distribuyendo vehículos:', error.message);
  }
}

if (require.main === module) {
  distributeVehiclesStates();
}

module.exports = { distributeVehiclesStates }; 