const { query } = require('../src/config/database');

async function testEstadisticas() {
  try {
    console.log('🔍 Probando estadísticas de alquileres...');
    
    // 1. Verificar que hay datos en la tabla alquileres
    const alquileresResult = await query('SELECT COUNT(*) as total FROM alquileres');
    console.log(`📊 Total de alquileres en la base de datos: ${alquileresResult.rows[0].total}`);
    
    // 2. Verificar que hay alquileres con ingresos
    const ingresosResult = await query(`
      SELECT 
        COUNT(*) as total_con_ingresos,
        SUM(ingreso_final) as total_ingresos,
        AVG(ingreso_final) as promedio_ingresos
      FROM alquileres 
      WHERE ingreso_final IS NOT NULL AND ingreso_final > 0
    `);
    console.log(`💰 Alquileres con ingresos: ${ingresosResult.rows[0].total_con_ingresos}`);
    console.log(`💰 Total ingresos: €${ingresosResult.rows[0].total_ingresos?.toLocaleString() || '0'}`);
    console.log(`💰 Promedio ingresos: €${parseFloat(ingresosResult.rows[0].promedio_ingresos || 0).toFixed(2)}`);
    
    // 3. Probar la consulta de estadísticas para un vehículo específico
    const estadisticasResult = await query(`
      SELECT 
        v.vehiculo_id,
        v.marca,
        v.modelo,
        v.matricula,
        COUNT(a.alquiler_id) as total_alquileres,
        COUNT(CASE WHEN a.estado = 'cerrado' THEN 1 END) as alquileres_completados,
        COALESCE(SUM(a.ingreso_final), 0) as ingresos_totales_alquileres,
        COALESCE(SUM(a.total_dias), 0) as dias_total_alquilado,
        CASE 
          WHEN COUNT(a.alquiler_id) > 0 THEN 
            COALESCE(SUM(a.ingreso_final), 0) / COUNT(a.alquiler_id)
          ELSE 0 
        END as ingreso_promedio_por_alquiler,
        CASE 
          WHEN COUNT(a.alquiler_id) > 0 THEN 
            COALESCE(SUM(a.ingreso_final), 0) / NULLIF(SUM(a.total_dias), 0)
          ELSE 0 
        END as ingreso_promedio_por_dia
      FROM vehiculos v
      LEFT JOIN alquileres a ON v.vehiculo_id = a.vehiculo_id
      GROUP BY v.vehiculo_id, v.marca, v.modelo, v.matricula
      ORDER BY ingresos_totales_alquileres DESC
      LIMIT 5
    `);
    
    console.log('\n📈 Top 5 vehículos por ingresos:');
    estadisticasResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.marca} ${row.modelo} (${row.matricula})`);
      console.log(`   - Total alquileres: ${row.total_alquileres}`);
      console.log(`   - Alquileres completados: ${row.alquileres_completados}`);
      console.log(`   - Ingresos totales: €${row.ingresos_totales_alquileres?.toLocaleString() || '0'}`);
      console.log(`   - Días total alquilado: ${row.dias_total_alquilado} días`);
      console.log(`   - Ingreso promedio/alquiler: €${row.ingreso_promedio_por_alquiler?.toFixed(2) || '0.00'}`);
      console.log(`   - Ingreso promedio/día: €${row.ingreso_promedio_por_dia?.toFixed(2) || '0.00'}`);
      console.log('');
    });
    
    // 4. Verificar que la consulta completa del controlador funciona
    const controladorResult = await query(`
      SELECT 
        v.*,
        cv.nombre as categoria_nombre,
        u.nombre as ubicacion_nombre,
        -- Estadísticas de alquileres e ingresos
        (
          SELECT row_to_json(stats) FROM (
            SELECT 
              COUNT(a.alquiler_id) as total_alquileres,
              COUNT(CASE WHEN a.estado = 'cerrado' THEN 1 END) as alquileres_completados,
              COALESCE(SUM(a.ingreso_final), 0) as ingresos_totales_alquileres,
              COALESCE(SUM(a.total_dias), 0) as dias_total_alquilado,
              CASE 
                WHEN COUNT(a.alquiler_id) > 0 THEN 
                  COALESCE(SUM(a.ingreso_final), 0) / COUNT(a.alquiler_id)
                ELSE 0 
              END as ingreso_promedio_por_alquiler,
              CASE 
                WHEN COUNT(a.alquiler_id) > 0 THEN 
                  COALESCE(SUM(a.ingreso_final), 0) / NULLIF(SUM(a.total_dias), 0)
                ELSE 0 
              END as ingreso_promedio_por_dia
            FROM alquileres a
            WHERE a.vehiculo_id = v.vehiculo_id
          ) stats
        ) as estadisticas_alquileres
      FROM vehiculos v
      LEFT JOIN categorias_vehiculo cv ON v.categoria_id = cv.categoria_id
      LEFT JOIN ubicaciones u ON v.ubicacion_id = u.ubicacion_id
      ORDER BY v.fecha_compra DESC
      LIMIT 3
    `);
    
    console.log('\n🔍 Verificando datos del controlador:');
    controladorResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.marca} ${row.modelo} (${row.matricula})`);
      if (row.estadisticas_alquileres) {
        const stats = row.estadisticas_alquileres;
        console.log(`   ✅ Estadísticas disponibles:`);
        console.log(`   - Total alquileres: ${stats.total_alquileres}`);
        console.log(`   - Ingresos totales: €${stats.ingresos_totales_alquileres?.toLocaleString() || '0'}`);
      } else {
        console.log(`   ❌ No hay estadísticas disponibles`);
      }
      console.log('');
    });
    
    console.log('✅ Prueba de estadísticas completada');
    
  } catch (error) {
    console.error('❌ Error en la prueba de estadísticas:', error.message);
  } finally {
    process.exit(0);
  }
}

testEstadisticas(); 