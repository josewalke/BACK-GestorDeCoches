const { query } = require('../src/config/database');

async function cleanDatabase() {
  try {
    console.log('🧹 Limpiando base de datos...\n');
    
    // Lista de tablas en orden de dependencias (primero las que dependen de otras)
    const tables = [
      'alquileres',
      'reservas', 
      'mantenimientos',
      'ventas',
      'seguros',
      'vehiculos',
      'clientes',
      'categorias_vehiculo',
      'ubicaciones'
    ];
    
    console.log('🗑️  Eliminando datos de las tablas...');
    console.log('=' .repeat(80));
    
    for (const table of tables) {
      try {
        const result = await query(`DELETE FROM ${table}`);
        console.log(`✅ ${table}: ${result.rowCount} registros eliminados`);
      } catch (error) {
        console.log(`❌ Error eliminando ${table}: ${error.message}`);
      }
    }
    
    // Resetear las secuencias (auto-increment)
    console.log('\n🔄 Reseteando secuencias...');
    console.log('=' .repeat(80));
    
    const sequences = [
      'alquileres_alquiler_id_seq',
      'reservas_reserva_id_seq',
      'mantenimientos_mantenimiento_id_seq',
      'ventas_venta_id_seq',
      'seguros_seguro_id_seq',
      'vehiculos_vehiculo_id_seq',
      'clientes_cliente_id_seq',
      'categorias_vehiculo_categoria_id_seq',
      'ubicaciones_ubicacion_id_seq'
    ];
    
    for (const sequence of sequences) {
      try {
        await query(`ALTER SEQUENCE ${sequence} RESTART WITH 1`);
        console.log(`✅ ${sequence}: reseteada`);
      } catch (error) {
        console.log(`❌ Error reseteando ${sequence}: ${error.message}`);
      }
    }
    
    // Verificar que las tablas estén vacías
    console.log('\n🔍 Verificando que las tablas estén vacías...');
    console.log('=' .repeat(80));
    
    for (const table of tables) {
      try {
        const result = await query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result.rows[0].count;
        if (count === 0) {
          console.log(`✅ ${table}: vacía (0 registros)`);
        } else {
          console.log(`❌ ${table}: ${count} registros restantes`);
        }
      } catch (error) {
        console.log(`❌ Error verificando ${table}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 ¡Base de datos limpiada exitosamente!');
    console.log('📝 Ahora puedes ejecutar el script de rellenado de datos.');
    
  } catch (error) {
    console.error('❌ Error limpiando la base de datos:', error.message);
  } finally {
    process.exit(0);
  }
}

cleanDatabase(); 