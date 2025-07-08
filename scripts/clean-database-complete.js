const { query } = require('../src/config/database');

async function cleanDatabaseComplete() {
  try {
    console.log('🧹 Limpiando base de datos completamente...\n');
    
    // 1. Eliminar todas las tablas en orden de dependencias
    console.log('🗑️  Eliminando datos en orden de dependencias...');
    console.log('=' .repeat(80));
    
    const tablesToClean = [
      'pagos', // Depende de alquileres
      'llamadas_reservas', // Depende de vehiculos, clientes
      'alquileres', // Depende de vehiculos, clientes, reservas
      'reservas', // Depende de vehiculos, clientes
      'mantenimientos', // Depende de vehiculos
      'ventas', // Depende de vehiculos
      'seguros_vehiculo', // Depende de vehiculos
      'tarifas', // Depende de categorias
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
    
    // 2. Resetear todas las secuencias
    console.log('\n🔄 Reseteando secuencias...');
    console.log('=' .repeat(80));
    
    const sequences = [
      'pagos_pago_id_seq',
      'llamadas_reservas_llamada_id_seq',
      'alquileres_alquiler_id_seq',
      'reservas_reserva_id_seq',
      'mantenimientos_mantenimiento_id_seq',
      'ventas_venta_id_seq',
      'vehiculos_vehiculo_id_seq',
      'clientes_cliente_id_seq',
      'categorias_vehiculo_categoria_id_seq',
      'ubicaciones_ubicacion_id_seq',
      'tarifas_tarifa_id_seq'
    ];
    
    for (const sequence of sequences) {
      try {
        await query(`ALTER SEQUENCE ${sequence} RESTART WITH 1`);
        console.log(`✅ ${sequence}: reseteada`);
      } catch (error) {
        console.log(`❌ Error reseteando ${sequence}: ${error.message}`);
      }
    }
    
    // 3. Verificar limpieza completa
    console.log('\n🔍 Verificando limpieza completa...');
    console.log('=' .repeat(80));
    
    const tablesToCheck = [
      'pagos',
      'llamadas_reservas',
      'alquileres',
      'reservas',
      'mantenimientos',
      'ventas',
      'seguros_vehiculo',
      'tarifas',
      'vehiculos',
      'clientes',
      'categorias_vehiculo',
      'ubicaciones'
    ];
    
    let allClean = true;
    for (const table of tablesToCheck) {
      try {
        const result = await query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result.rows[0].count;
        if (count === 0) {
          console.log(`✅ ${table}: vacía (0 registros)`);
        } else {
          console.log(`❌ ${table}: ${count} registros restantes`);
          allClean = false;
        }
      } catch (error) {
        console.log(`❌ Error verificando ${table}: ${error.message}`);
        allClean = false;
      }
    }
    
    if (allClean) {
      console.log('\n🎉 ¡Base de datos completamente limpia!');
      console.log('📝 Ahora puedes ejecutar el script de rellenado de datos.');
    } else {
      console.log('\n⚠️  Algunas tablas aún tienen datos. Revisa los errores arriba.');
    }
    
  } catch (error) {
    console.error('❌ Error limpiando la base de datos:', error.message);
  } finally {
    process.exit(0);
  }
}

cleanDatabaseComplete(); 