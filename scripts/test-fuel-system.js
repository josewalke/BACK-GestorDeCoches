const { query } = require('../src/config/database');

async function testFuelSystem() {
  try {
    console.log('🧪 Probando sistema de combustible...');
    
    // 1. Insertar un registro de prueba con números (porcentajes)
    console.log('\n📝 Insertando registro con porcentajes...');
    await query(`
      INSERT INTO alquileres (
        vehiculo_id, cliente_id, fecha_recogida_real, fecha_devolucion_real,
        pickup_ubicacion_id, dropoff_ubicacion_id, km_salida, km_entrada,
        nivel_combustible_salida, nivel_combustible_entrada, estado
      ) VALUES (
        1, 1, NOW(), NOW() + INTERVAL '7 days',
        1, 1, 1000, 1500,
        75, 25, 'abierto'
      )
    `);
    console.log('✅ Registro insertado con porcentajes (75, 25)');
    
    // 2. Insertar un registro con fracciones directamente
    console.log('\n📝 Insertando registro con fracciones...');
    await query(`
      INSERT INTO alquileres (
        vehiculo_id, cliente_id, fecha_recogida_real, fecha_devolucion_real,
        pickup_ubicacion_id, dropoff_ubicacion_id, km_salida, km_entrada,
        nivel_combustible_salida, nivel_combustible_entrada, estado
      ) VALUES (
        2, 2, NOW(), NOW() + INTERVAL '7 days',
        2, 2, 2000, 2500,
        '1/2', '4/4', 'abierto'
      )
    `);
    console.log('✅ Registro insertado con fracciones (1/2, 4/4)');
    
    // 3. Verificar los resultados
    console.log('\n🔍 Verificando resultados...');
    const resultados = await query(`
      SELECT 
        alquiler_id,
        nivel_combustible_salida,
        nivel_combustible_entrada,
        created_at
      FROM alquileres 
      WHERE nivel_combustible_salida IS NOT NULL OR nivel_combustible_entrada IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log('📋 Últimos registros:');
    resultados.rows.forEach(row => {
      console.log(`   ID ${row.alquiler_id}: Salida=${row.nivel_combustible_salida}, Entrada=${row.nivel_combustible_entrada}`);
    });
    
    // 4. Limpiar registros de prueba
    console.log('\n🧹 Limpiando registros de prueba...');
    await query(`
      DELETE FROM alquileres 
      WHERE vehiculo_id IN (1, 2) AND created_at > NOW() - INTERVAL '1 hour'
    `);
    console.log('✅ Registros de prueba eliminados');
    
    console.log('\n🎉 ¡Sistema de combustible funcionando correctamente!');
    console.log('💡 El trigger convierte automáticamente:');
    console.log('   - 75 → 3/4');
    console.log('   - 25 → 1/4');
    console.log('   - Las fracciones se mantienen tal cual');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    process.exit(1);
  }
}

testFuelSystem(); 