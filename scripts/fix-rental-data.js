const { query } = require('../src/config/database');

async function fixRentalData() {
  try {
    console.log('🔧 Corrigiendo datos de alquileres...\n');
    
    // 1. Corregir alquileres abiertos sin fecha de devolución
    console.log('📋 1. Corrigiendo alquileres sin fecha de devolución...');
    const alquileresSinDevolucion = await query(`
      SELECT alquiler_id, vehiculo_id, fecha_recogida_real
      FROM alquileres 
      WHERE estado = 'abierto' AND fecha_devolucion_real IS NULL
    `);
    
    console.log(`Encontrados ${alquileresSinDevolucion.rows.length} alquileres sin fecha de devolución`);
    
    for (const alquiler of alquileresSinDevolucion.rows) {
      // Calcular fecha de devolución (7 días después de la recogida)
      const fechaRecogida = new Date(alquiler.fecha_recogida_real);
      const fechaDevolucion = new Date(fechaRecogida);
      fechaDevolucion.setDate(fechaDevolucion.getDate() + 7);
      
      await query(`
        UPDATE alquileres 
        SET fecha_devolucion_real = $1
        WHERE alquiler_id = $2
      `, [fechaDevolucion, alquiler.alquiler_id]);
      
      console.log(`   ✅ Alquiler ${alquiler.alquiler_id}: Fecha devolución añadida`);
    }
    
    // 2. Crear alquileres faltantes para vehículos marcados como alquilados
    console.log('\n📋 2. Creando alquileres faltantes...');
    const vehiculosAlquiladosSinAlquiler = await query(`
      SELECT v.vehiculo_id, v.marca, v.modelo, v.matricula
      FROM vehiculos v
      WHERE v.estado = 'alquilado'
      AND NOT EXISTS (
        SELECT 1 FROM alquileres a 
        WHERE a.vehiculo_id = v.vehiculo_id 
        AND a.estado = 'abierto'
      )
    `);
    
    console.log(`Encontrados ${vehiculosAlquiladosSinAlquiler.rows.length} vehículos alquilados sin alquiler`);
    
    // Obtener clientes disponibles
    const clientes = await query('SELECT cliente_id, nombre FROM clientes LIMIT 10');
    
    for (let i = 0; i < vehiculosAlquiladosSinAlquiler.rows.length; i++) {
      const vehiculo = vehiculosAlquiladosSinAlquiler.rows[i];
      const cliente = clientes.rows[i % clientes.rows.length];
      
      // Fecha de recogida (hace algunos días)
      const fechaRecogida = new Date();
      fechaRecogida.setDate(fechaRecogida.getDate() - Math.floor(Math.random() * 10) - 1);
      
      // Fecha de devolución (7 días después)
      const fechaDevolucion = new Date(fechaRecogida);
      fechaDevolucion.setDate(fechaDevolucion.getDate() + 7);
      
      // Kilómetros aleatorios
      const kmSalida = Math.floor(Math.random() * 50000) + 10000;
      const combustibleSalida = Math.floor(Math.random() * 90) + 10; // Entre 10 y 99
      
      await query(`
        INSERT INTO alquileres (
          vehiculo_id, cliente_id, fecha_recogida_real, fecha_devolucion_real,
          pickup_ubicacion_id, dropoff_ubicacion_id, km_salida, nivel_combustible_salida,
          estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'abierto')
      `, [
        vehiculo.vehiculo_id,
        cliente.cliente_id,
        fechaRecogida,
        fechaDevolucion,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        kmSalida,
        combustibleSalida
      ]);
      
      console.log(`   ✅ Creado alquiler para ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.matricula})`);
    }
    
    // 3. Verificar que todos los alquileres tengan información completa
    console.log('\n📋 3. Verificando integridad final...');
    const alquileresIncompletos = await query(`
      SELECT COUNT(*) as incompletos
      FROM alquileres a
      WHERE a.estado = 'abierto'
      AND (
        a.cliente_id IS NULL OR
        a.fecha_recogida_real IS NULL OR
        a.fecha_devolucion_real IS NULL OR
        a.pickup_ubicacion_id IS NULL OR
        a.dropoff_ubicacion_id IS NULL OR
        a.km_salida IS NULL OR
        a.nivel_combustible_salida IS NULL
      )
    `);
    
    if (alquileresIncompletos.rows[0].incompletos > 0) {
      console.log(`❌ Aún quedan ${alquileresIncompletos.rows[0].incompletos} alquileres incompletos`);
    } else {
      console.log('✅ Todos los alquileres tienen información completa');
    }
    
    // 4. Estadísticas finales
    console.log('\n📊 Estadísticas finales:');
    const estadisticas = await query(`
      SELECT 
        COUNT(*) as total_alquileres_abiertos,
        COUNT(CASE WHEN fecha_devolucion_real IS NOT NULL THEN 1 END) as con_fecha_devolucion,
        COUNT(CASE WHEN cliente_id IS NOT NULL THEN 1 END) as con_cliente
      FROM alquileres 
      WHERE estado = 'abierto'
    `);
    
    const stats = estadisticas.rows[0];
    console.log(`   Total alquileres abiertos: ${stats.total_alquileres_abiertos}`);
    console.log(`   Con fecha devolución: ${stats.con_fecha_devolucion}`);
    console.log(`   Con cliente: ${stats.con_cliente}`);
    
    console.log('\n✅ Corrección de datos completada');
    
  } catch (error) {
    console.error('❌ Error corrigiendo datos:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  fixRentalData();
}

module.exports = { fixRentalData }; 