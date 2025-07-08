const { query } = require('../src/config/database');

async function cleanDatabaseRobust() {
  try {
    console.log('🧹 Limpiando base de datos de forma robusta...\n');
    
    // 1. Primero eliminar tablas que dependen de otras
    console.log('🗑️  Eliminando datos en orden de dependencias...');
    console.log('=' .repeat(80));
    
    const tablesToClean = [
      'pagos', // Depende de alquileres
      'alquileres', // Depende de vehiculos, clientes, reservas
      'reservas', // Depende de vehiculos, clientes
      'mantenimientos', // Depende de vehiculos
      'ventas', // Depende de vehiculos
      'seguros_vehiculo', // Depende de vehiculos
      'vehiculos', // Depende de categorias, ubicaciones
      'clientes',
      'categorias_vehiculo',
      'ubicaciones'
    ];
    
    for (const table of tablesToClean) {
      try {
        const result = await query(`DELETE FROM ${table}`);
        console.log(`✅ ${table}: ${result.rowCount} registros eliminados`);
      } catch (error) {
        console.log(`❌ Error eliminando ${table}: ${error.message}`);
      }
    }
    
    // 2. Resetear secuencias
    console.log('\n🔄 Reseteando secuencias...');
    console.log('=' .repeat(80));
    
    const sequences = [
      'pagos_pago_id_seq',
      'alquileres_alquiler_id_seq',
      'reservas_reserva_id_seq',
      'mantenimientos_mantenimiento_id_seq',
      'ventas_venta_id_seq',
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
    
    // 3. Verificar limpieza
    console.log('\n🔍 Verificando limpieza...');
    console.log('=' .repeat(80));
    
    const tablesToCheck = [
      'pagos',
      'alquileres',
      'reservas',
      'mantenimientos',
      'ventas',
      'seguros_vehiculo',
      'vehiculos',
      'clientes',
      'categorias_vehiculo',
      'ubicaciones'
    ];
    
    for (const table of tablesToCheck) {
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

cleanDatabaseRobust(); 