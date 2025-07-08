const { query } = require('../src/config/database');

async function showVehicleStats() {
  try {
    console.log('📊 Mostrando estadísticas completas de vehículos...\n');
    
    // 1. Estadísticas generales
    console.log('📈 Estadísticas generales:');
    const stats = await query(`
      SELECT 
        COUNT(*) as total_vehiculos,
        COUNT(CASE WHEN estado = 'vendido' THEN 1 END) as vendidos,
        COUNT(CASE WHEN estado = 'disponible' THEN 1 END) as disponibles,
        COUNT(CASE WHEN estado = 'alquilado' THEN 1 END) as alquilados,
        COUNT(CASE WHEN estado = 'reservado' THEN 1 END) as reservados
      FROM vehiculos
    `);
    
    const generalStats = stats.rows[0];
    console.log(`   Total vehículos: ${generalStats.total_vehiculos}`);
    console.log(`   Vendidos: ${generalStats.vendidos}`);
    console.log(`   Disponibles: ${generalStats.disponibles}`);
    console.log(`   Alquilados: ${generalStats.alquilados}`);
    console.log(`   Reservados: ${generalStats.reservados}`);
    
    // 2. Vehículos con más alquileres
    console.log('\n🏆 Top 5 vehículos con más alquileres:');
    const topAlquileres = await query(`
      SELECT 
        v.vehiculo_id,
        v.marca,
        v.modelo,
        v.matricula,
        v.estado,
        COUNT(a.alquiler_id) as total_alquileres,
        COUNT(CASE WHEN a.estado = 'cerrado' THEN 1 END) as alquileres_completados,
        COALESCE(SUM(CASE WHEN a.estado = 'cerrado' THEN 
          EXTRACT(DAY FROM (a.fecha_devolucion_real - a.fecha_recogida_real)) * 50
        ELSE 0 END), 0) as ingresos_estimados
      FROM vehiculos v
      LEFT JOIN alquileres a ON v.vehiculo_id = a.vehiculo_id
      GROUP BY v.vehiculo_id, v.marca, v.modelo, v.matricula, v.estado
      ORDER BY total_alquileres DESC
      LIMIT 5
    `);
    
    topAlquileres.rows.forEach((veh, index) => {
      console.log(`   ${index + 1}. ${veh.marca} ${veh.modelo} (${veh.matricula})`);
      console.log(`      Estado: ${veh.estado}`);
      console.log(`      Alquileres: ${veh.total_alquileres} (${veh.alquileres_completados} completados)`);
      console.log(`      Ingresos estimados: €${veh.ingresos_estimados?.toLocaleString()}`);
    });
    
    // 3. Vehículos vendidos con información completa
    console.log('\n💰 Vehículos vendidos con información completa:');
    const vehiculosVendidos = await query(`
      SELECT 
        v.vehiculo_id,
        v.marca,
        v.modelo,
        v.matricula,
        v.fecha_venta,
        v.precio_venta_total,
        vent.monto_venta,
        vent.cliente_nombre,
        vent.metodo_pago,
        vent.comision_vendedor,
        vent.descuento_aplicado,
        (SELECT COUNT(*) FROM alquileres a WHERE a.vehiculo_id = v.vehiculo_id) as total_alquileres
      FROM vehiculos v
      LEFT JOIN ventas vent ON v.vehiculo_id = vent.vehiculo_id
      WHERE v.estado = 'vendido'
      ORDER BY v.fecha_venta DESC
    `);
    
    vehiculosVendidos.rows.forEach(veh => {
      console.log(`   ${veh.marca} ${veh.modelo} (${veh.matricula})`);
      console.log(`      Fecha venta: ${veh.fecha_venta}`);
      console.log(`      Precio venta: €${veh.precio_venta_total?.toLocaleString()}`);
      console.log(`      Cliente: ${veh.cliente_nombre || 'N/A'}`);
      console.log(`      Método pago: ${veh.metodo_pago || 'N/A'}`);
      console.log(`      Comisión: €${veh.comision_vendedor?.toLocaleString() || 'N/A'}`);
      console.log(`      Descuento: €${veh.descuento_aplicado?.toLocaleString() || 'N/A'}`);
      console.log(`      Alquileres previos: ${veh.total_alquileres}`);
      console.log('');
    });
    
    // 4. Función para obtener estadísticas de un vehículo específico
    console.log('🔍 Función para obtener estadísticas de un vehículo específico:');
    console.log('   SELECT * FROM obtener_estadisticas_vehiculo(vehiculo_id);');
    
    // 5. Ejemplo con un vehículo específico
    console.log('\n📋 Ejemplo con vehículo ID 1:');
    const ejemploStats = await query(`
      SELECT * FROM obtener_estadisticas_vehiculo(1)
    `);
    
    if (ejemploStats.rows.length > 0) {
      const stats = ejemploStats.rows[0];
      console.log(`   Total alquileres: ${stats.total_alquileres}`);
      console.log(`   Alquileres completados: ${stats.alquileres_completados}`);
      console.log(`   Ingresos totales alquileres: €${stats.ingresos_totales_alquileres?.toLocaleString()}`);
      console.log(`   Días total alquilado: ${stats.dias_total_alquilado}`);
    }
    
    // 6. Resumen de rentabilidad
    console.log('\n💡 Resumen de rentabilidad:');
    console.log('   - Los vehículos con más alquileres generan más ingresos');
    console.log('   - Puedes calcular ROI: (Precio venta - Precio compra + Ingresos alquileres)');
    console.log('   - La tabla ventas mantiene historial completo de transacciones');
    console.log('   - La función obtener_estadisticas_vehiculo() calcula automáticamente');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

showVehicleStats(); 