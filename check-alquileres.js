const { query } = require('./src/config/database');

async function checkAlquileres() {
  try {
    console.log('🔍 Verificando alquileres activos...');
    
    // Verificar alquileres activos
    const alquileresResult = await query(`
      SELECT 
        a.alquiler_id,
        a.vehiculo_id,
        v.marca,
        v.modelo,
        v.matricula,
        c.nombre as cliente_nombre,
        a.fecha_recogida_real,
        a.fecha_devolucion_real,
        a.estado
      FROM alquileres a
      JOIN vehiculos v ON a.vehiculo_id = v.vehiculo_id
      JOIN clientes c ON a.cliente_id = c.cliente_id
      WHERE a.estado = 'abierto'
      ORDER BY a.fecha_recogida_real DESC
    `);
    
    console.log(`✅ Encontrados ${alquileresResult.rows.length} alquileres activos:`);
    alquileresResult.rows.forEach((alq, index) => {
      console.log(`${index + 1}. ${alq.marca} ${alq.modelo} (${alq.matricula}) - Cliente: ${alq.cliente_nombre}`);
    });
    
    // Verificar vehículos alquilados
    const vehiculosAlquiladosResult = await query(`
      SELECT 
        v.vehiculo_id,
        v.marca,
        v.modelo,
        v.matricula,
        v.estado
      FROM vehiculos v
      WHERE v.estado = 'alquilado'
      ORDER BY v.marca, v.modelo
    `);
    
    console.log(`\n🚗 Vehículos con estado 'alquilado': ${vehiculosAlquiladosResult.rows.length}`);
    vehiculosAlquiladosResult.rows.forEach((veh, index) => {
      console.log(`${index + 1}. ${veh.marca} ${veh.modelo} (${veh.matricula})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkAlquileres(); 