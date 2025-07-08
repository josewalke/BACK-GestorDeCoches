const { query } = require('../src/config/database');

async function mostrarVehiculosUsados() {
  try {
    console.log('🚗 Vehículos que se han usado (con alquileres):\n');
    
    // Consulta para obtener todos los vehículos con sus estadísticas de alquiler
    const result = await query(`
      SELECT 
        v.vehiculo_id,
        v.marca,
        v.modelo,
        v.matricula,
        v.estado,
        COUNT(a.alquiler_id) as total_alquileres,
        COUNT(CASE WHEN a.estado = 'cerrado' THEN 1 END) as alquileres_completados,
        COALESCE(SUM(a.ingreso_final), 0) as ingresos_totales,
        COALESCE(SUM(a.total_dias), 0) as dias_total_alquilado,
        MIN(a.fecha_recogida_real) as primer_alquiler,
        MAX(a.fecha_devolucion_real) as ultimo_alquiler
      FROM vehiculos v
      LEFT JOIN alquileres a ON v.vehiculo_id = a.vehiculo_id
      GROUP BY v.vehiculo_id, v.marca, v.modelo, v.matricula, v.estado
      HAVING COUNT(a.alquiler_id) > 0
      ORDER BY total_alquileres DESC, ingresos_totales DESC
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No hay vehículos que se hayan usado aún.');
      return;
    }
    
    console.log(`📊 Total de vehículos usados: ${result.rows.length}\n`);
    
    // Mostrar vehículos con más de un alquiler
    const vehiculosMultiples = result.rows.filter(v => v.total_alquileres > 1);
    if (vehiculosMultiples.length > 0) {
      console.log('🔥 VEHÍCULOS CON MÁS DE UN ALQUILER:');
      console.log('=' .repeat(80));
      
      vehiculosMultiples.forEach((vehiculo, index) => {
        console.log(`${index + 1}. ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.matricula})`);
        console.log(`   📊 Estado: ${vehiculo.estado}`);
        console.log(`   🔢 Total alquileres: ${vehiculo.total_alquileres}`);
        console.log(`   ✅ Alquileres completados: ${vehiculo.alquileres_completados}`);
        console.log(`   💰 Ingresos totales: €${vehiculo.ingresos_totales?.toLocaleString() || '0'}`);
        console.log(`   📅 Días total alquilado: ${vehiculo.dias_total_alquilado} días`);
        console.log(`   🗓️  Primer alquiler: ${vehiculo.primer_alquiler ? new Date(vehiculo.primer_alquiler).toLocaleDateString('es-ES') : 'N/A'}`);
        console.log(`   🗓️  Último alquiler: ${vehiculo.ultimo_alquiler ? new Date(vehiculo.ultimo_alquiler).toLocaleDateString('es-ES') : 'N/A'}`);
        console.log('');
      });
    }
    
    // Mostrar todos los vehículos usados
    console.log('📋 TODOS LOS VEHÍCULOS USADOS:');
    console.log('=' .repeat(80));
    
    result.rows.forEach((vehiculo, index) => {
      const icono = vehiculo.total_alquileres > 1 ? '🔥' : '🚗';
      console.log(`${index + 1}. ${icono} ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.matricula})`);
      console.log(`   📊 Estado: ${vehiculo.estado}`);
      console.log(`   🔢 Total alquileres: ${vehiculo.total_alquileres}`);
      console.log(`   ✅ Alquileres completados: ${vehiculo.alquileres_completados}`);
      console.log(`   💰 Ingresos totales: €${vehiculo.ingresos_totales?.toLocaleString() || '0'}`);
      console.log(`   📅 Días total alquilado: ${vehiculo.dias_total_alquilado} días`);
      
      // Calcular promedio de ingresos por alquiler
      const promedioPorAlquiler = vehiculo.total_alquileres > 0 ? 
        vehiculo.ingresos_totales / vehiculo.total_alquileres : 0;
      console.log(`   📈 Promedio por alquiler: €${promedioPorAlquiler.toFixed(2)}`);
      
      // Calcular promedio de ingresos por día
      const promedioPorDia = vehiculo.dias_total_alquilado > 0 ? 
        vehiculo.ingresos_totales / vehiculo.dias_total_alquilado : 0;
      console.log(`   📈 Promedio por día: €${promedioPorDia.toFixed(2)}`);
      console.log('');
    });
    
    // Estadísticas generales
    const totalAlquileres = result.rows.reduce((sum, v) => sum + parseInt(v.total_alquileres), 0);
    const totalIngresos = result.rows.reduce((sum, v) => sum + parseFloat(v.ingresos_totales || 0), 0);
    const totalDias = result.rows.reduce((sum, v) => sum + parseInt(v.dias_total_alquilado || 0), 0);
    
    console.log('📊 ESTADÍSTICAS GENERALES:');
    console.log('=' .repeat(80));
    console.log(`🚗 Vehículos usados: ${result.rows.length}`);
    console.log(`🔥 Vehículos con múltiples alquileres: ${vehiculosMultiples.length}`);
    console.log(`📊 Total de alquileres: ${totalAlquileres}`);
    console.log(`💰 Total de ingresos: €${totalIngresos.toLocaleString()}`);
    console.log(`📅 Total de días alquilados: ${totalDias} días`);
    console.log(`📈 Promedio de ingresos por alquiler: €${(totalIngresos / totalAlquileres).toFixed(2)}`);
    console.log(`📈 Promedio de ingresos por día: €${(totalIngresos / totalDias).toFixed(2)}`);
    
    // Top 5 vehículos más rentables
    const topRentables = result.rows
      .sort((a, b) => parseFloat(b.ingresos_totales || 0) - parseFloat(a.ingresos_totales || 0))
      .slice(0, 5);
    
    console.log('\n🏆 TOP 5 VEHÍCULOS MÁS RENTABLES:');
    console.log('=' .repeat(80));
    topRentables.forEach((vehiculo, index) => {
      console.log(`${index + 1}. ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.matricula})`);
      console.log(`   💰 Ingresos: €${vehiculo.ingresos_totales?.toLocaleString() || '0'}`);
      console.log(`   🔢 Alquileres: ${vehiculo.total_alquileres}`);
      console.log(`   📅 Días: ${vehiculo.dias_total_alquilado}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error al obtener vehículos usados:', error.message);
  } finally {
    process.exit(0);
  }
}

mostrarVehiculosUsados(); 