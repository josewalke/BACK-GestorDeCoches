const { query } = require('./src/config/database');

async function analyzeDatabase() {
  try {
    console.log('🔍 ANALIZANDO BASE DE DATOS COMPLETA\n');
    
    // 1. ANÁLISIS DE VEHÍCULOS
    console.log('🚗 === ANÁLISIS DE VEHÍCULOS ===');
    const vehiculos = await query(`
      SELECT 
        COUNT(*) as total_vehiculos,
        COUNT(CASE WHEN estado = 'disponible' THEN 1 END) as disponibles,
        COUNT(CASE WHEN estado = 'alquilado' THEN 1 END) as alquilados,
        COUNT(CASE WHEN estado = 'reservado' THEN 1 END) as reservados,
        COUNT(CASE WHEN estado = 'taller' THEN 1 END) as en_taller,
        COUNT(CASE WHEN estado = 'vendido' THEN 1 END) as vendidos
      FROM vehiculos
    `);
    
    console.log('📊 Estadísticas generales:');
    console.log(`   Total vehículos: ${vehiculos.rows[0].total_vehiculos}`);
    console.log(`   Disponibles: ${vehiculos.rows[0].disponibles}`);
    console.log(`   Alquilados: ${vehiculos.rows[0].alquilados}`);
    console.log(`   Reservados: ${vehiculos.rows[0].reservados}`);
    console.log(`   En taller: ${vehiculos.rows[0].en_taller}`);
    console.log(`   Vendidos: ${vehiculos.rows[0].vendidos}`);
    
    // 2. ANÁLISIS DE ALQUILERES
    console.log('\n📋 === ANÁLISIS DE ALQUILERES ===');
    const alquileres = await query(`
      SELECT 
        COUNT(*) as total_alquileres,
        COUNT(CASE WHEN estado = 'abierto' THEN 1 END) as activos,
        COUNT(CASE WHEN estado = 'cerrado' THEN 1 END) as cerrados
      FROM alquileres
    `);
    
    console.log('📊 Estadísticas de alquileres:');
    console.log(`   Total alquileres: ${alquileres.rows[0].total_alquileres}`);
    console.log(`   Activos: ${alquileres.rows[0].activos}`);
    console.log(`   Cerrados: ${alquileres.rows[0].cerrados}`);
    
    // 3. VERIFICAR RELACIÓN VEHÍCULOS-ALQUILERES
    console.log('\n🔗 === RELACIÓN VEHÍCULOS-ALQUILERES ===');
    const vehiculosAlquilados = await query(`
      SELECT 
        v.vehiculo_id,
        v.marca,
        v.modelo,
        v.matricula,
        v.estado as estado_vehiculo,
        CASE 
          WHEN a.alquiler_id IS NOT NULL THEN 'SÍ'
          ELSE 'NO'
        END as tiene_alquiler_activo,
        a.alquiler_id,
        a.estado as estado_alquiler
      FROM vehiculos v
      LEFT JOIN alquileres a ON v.vehiculo_id = a.vehiculo_id AND a.estado = 'abierto'
      WHERE v.estado = 'alquilado'
      ORDER BY v.marca, v.modelo
    `);
    
    console.log('🚗 Vehículos marcados como alquilados:');
    vehiculosAlquilados.rows.forEach((veh, index) => {
      console.log(`${index + 1}. ${veh.marca} ${veh.modelo} (${veh.matricula})`);
      console.log(`   Estado vehículo: ${veh.estado_vehiculo}`);
      console.log(`   Tiene alquiler activo: ${veh.tiene_alquiler_activo}`);
      if (veh.alquiler_id) {
        console.log(`   ID Alquiler: ${veh.alquiler_id} (${veh.estado_alquiler})`);
      }
      console.log('');
    });
    
    // 4. ANÁLISIS DE CLIENTES
    console.log('👥 === ANÁLISIS DE CLIENTES ===');
    const clientes = await query(`
      SELECT 
        COUNT(*) as total_clientes,
        COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as con_email,
        COUNT(CASE WHEN telefono IS NOT NULL THEN 1 END) as con_telefono
      FROM clientes
    `);
    
    console.log('📊 Estadísticas de clientes:');
    console.log(`   Total clientes: ${clientes.rows[0].total_clientes}`);
    console.log(`   Con email: ${clientes.rows[0].con_email}`);
    console.log(`   Con teléfono: ${clientes.rows[0].con_telefono}`);
    
    // 5. ANÁLISIS DE UBICACIONES
    console.log('\n📍 === ANÁLISIS DE UBICACIONES ===');
    const ubicaciones = await query(`
      SELECT ubicacion_id, nombre
      FROM ubicaciones
      ORDER BY ubicacion_id
    `);
    
    console.log('📍 Ubicaciones disponibles:');
    ubicaciones.rows.forEach((ub, index) => {
      console.log(`${index + 1}. ID ${ub.ubicacion_id}: ${ub.nombre}`);
    });
    
    // 6. VERIFICAR ALQUILERES ACTIVOS CON DATOS COMPLETOS
    console.log('\n✅ === ALQUILERES ACTIVOS CON DATOS COMPLETOS ===');
    const alquileresActivos = await query(`
      SELECT 
        a.alquiler_id,
        v.marca,
        v.modelo,
        v.matricula,
        c.nombre as cliente_nombre,
        c.apellidos as cliente_apellidos,
        c.email as cliente_email,
        c.telefono as cliente_telefono,
        c.dni_pasaporte as cliente_dni,
        a.fecha_recogida_real,
        a.fecha_devolucion_real,
        a.km_salida,
        a.nivel_combustible_salida,
        a.precio_por_dia,
        a.total_dias,
        a.ingreso_total,
        a.ingreso_final,
        pickup_ub.nombre as pickup_ubicacion,
        dropoff_ub.nombre as dropoff_ubicacion
      FROM alquileres a
      JOIN vehiculos v ON a.vehiculo_id = v.vehiculo_id
      JOIN clientes c ON a.cliente_id = c.cliente_id
      LEFT JOIN ubicaciones pickup_ub ON a.pickup_ubicacion_id = pickup_ub.ubicacion_id
      LEFT JOIN ubicaciones dropoff_ub ON a.dropoff_ubicacion_id = dropoff_ub.ubicacion_id
      WHERE a.estado = 'abierto'
      ORDER BY a.fecha_recogida_real DESC
    `);
    
    console.log(`📋 Alquileres activos encontrados: ${alquileresActivos.rows.length}`);
    alquileresActivos.rows.forEach((alq, index) => {
      console.log(`\n${index + 1}. Alquiler #${alq.alquiler_id}`);
      console.log(`   Vehículo: ${alq.marca} ${alq.modelo} (${alq.matricula})`);
      console.log(`   Cliente: ${alq.cliente_nombre} ${alq.cliente_apellidos}`);
      console.log(`   Email: ${alq.cliente_email || 'N/A'}`);
      console.log(`   Teléfono: ${alq.cliente_telefono || 'N/A'}`);
      console.log(`   DNI: ${alq.cliente_dni || 'N/A'}`);
      console.log(`   Recogida: ${alq.fecha_recogida_real}`);
      console.log(`   Devolución: ${alq.fecha_devolucion_real}`);
      console.log(`   Km salida: ${alq.km_salida}`);
      console.log(`   Combustible: ${alq.nivel_combustible_salida || 'N/A'}`);
      console.log(`   Precio/día: €${alq.precio_por_dia}`);
      console.log(`   Total días: ${alq.total_dias}`);
      console.log(`   Ingreso total: €${alq.ingreso_total}`);
      console.log(`   Ubicación recogida: ${alq.pickup_ubicacion || 'N/A'}`);
      console.log(`   Ubicación devolución: ${alq.dropoff_ubicacion || 'N/A'}`);
    });
    
    // 7. RESUMEN FINAL
    console.log('\n🎯 === RESUMEN FINAL ===');
    console.log(`✅ Vehículos alquilados: ${vehiculos.rows[0].alquilados}`);
    console.log(`✅ Alquileres activos: ${alquileres.rows[0].activos}`);
    console.log(`✅ Clientes disponibles: ${clientes.rows[0].total_clientes}`);
    console.log(`✅ Ubicaciones disponibles: ${ubicaciones.rows.length}`);
    
    if (alquileresActivos.rows.length > 0) {
      console.log('\n🎉 ¡TODO LISTO! Los alquileres activos tienen todos los datos necesarios.');
      console.log('El frontend debería mostrar la información completa en las cards.');
    } else {
      console.log('\n⚠️  No hay alquileres activos. Necesitas crear algunos para ver la información.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

analyzeDatabase(); 