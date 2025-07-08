const { query } = require('../src/config/database');

async function checkCurrentStructure() {
  try {
    console.log('🔍 Verificando estructura actual...\n');
    
    // 1. Verificar estructura de tabla vehiculos
    console.log('📋 Estructura de tabla vehiculos:');
    const vehiculosStructure = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'vehiculos'
      ORDER BY ordinal_position
    `);
    
    vehiculosStructure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // 2. Verificar estructura de tabla ventas
    console.log('\n📋 Estructura de tabla ventas:');
    const ventasStructure = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'ventas'
      ORDER BY ordinal_position
    `);
    
    ventasStructure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // 3. Verificar estadísticas
    console.log('\n📊 Estadísticas actuales:');
    const stats = await query(`
      SELECT 
        COUNT(*) as total_vehiculos,
        COUNT(CASE WHEN estado = 'vendido' THEN 1 END) as vendidos,
        COUNT(CASE WHEN estado != 'vendido' THEN 1 END) as no_vendidos
      FROM vehiculos
    `);
    
    const ventasStats = await query(`
      SELECT COUNT(*) as total_ventas FROM ventas
    `);
    
    console.log(`   Total vehículos: ${stats.rows[0].total_vehiculos}`);
    console.log(`   Vendidos: ${stats.rows[0].vendidos}`);
    console.log(`   No vendidos: ${stats.rows[0].no_vendidos}`);
    console.log(`   Registros en tabla ventas: ${ventasStats.rows[0].total_ventas}`);
    
    // 4. Verificar campos relacionados con ventas en vehiculos
    console.log('\n🔍 Campos relacionados con ventas en vehiculos:');
    const ventaFields = vehiculosStructure.rows.filter(col => 
      col.column_name.includes('venta') || 
      col.column_name.includes('precio') ||
      col.column_name.includes('monto')
    );
    
    if (ventaFields.length > 0) {
      ventaFields.forEach(field => {
        console.log(`   ${field.column_name}: ${field.data_type}`);
      });
    } else {
      console.log('   No se encontraron campos específicos de ventas');
    }
    
    // 5. Verificar alquileres por vehículo
    console.log('\n📊 Alquileres por vehículo (ejemplo):');
    const alquileresStats = await query(`
      SELECT 
        v.vehiculo_id,
        v.marca,
        v.modelo,
        v.matricula,
        COUNT(a.alquiler_id) as total_alquileres,
        SUM(CASE WHEN a.estado = 'cerrado' THEN 1 ELSE 0 END) as alquileres_completados
      FROM vehiculos v
      LEFT JOIN alquileres a ON v.vehiculo_id = a.vehiculo_id
      GROUP BY v.vehiculo_id, v.marca, v.modelo, v.matricula
      ORDER BY total_alquileres DESC
      LIMIT 5
    `);
    
    alquileresStats.rows.forEach(veh => {
      console.log(`   ${veh.marca} ${veh.modelo} (${veh.matricula}): ${veh.total_alquileres} alquileres (${veh.alquileres_completados} completados)`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCurrentStructure(); 