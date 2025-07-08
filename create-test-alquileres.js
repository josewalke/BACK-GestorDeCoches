const { query } = require('./src/config/database');

async function createTestAlquileres() {
  try {
    console.log('🔍 Obteniendo vehículos alquilados sin alquileres activos...');
    
    // Obtener vehículos alquilados que no tienen alquileres activos
    const vehiculosAlquilados = await query(`
      SELECT 
        v.vehiculo_id,
        v.marca,
        v.modelo,
        v.matricula
      FROM vehiculos v
      WHERE v.estado = 'alquilado'
      AND NOT EXISTS (
        SELECT 1 FROM alquileres a 
        WHERE a.vehiculo_id = v.vehiculo_id 
        AND a.estado = 'abierto'
      )
      ORDER BY v.marca, v.modelo
      LIMIT 5
    `);
    
    console.log(`✅ Encontrados ${vehiculosAlquilados.rows.length} vehículos alquilados sin alquileres activos`);
    
    if (vehiculosAlquilados.rows.length === 0) {
      console.log('No hay vehículos que necesiten alquileres de prueba');
      return;
    }
    
    // Obtener algunos clientes para asignar
    const clientes = await query(`
      SELECT cliente_id, nombre, apellidos, email, telefono, dni_pasaporte
      FROM clientes 
      ORDER BY cliente_id 
      LIMIT 10
    `);
    
    if (clientes.rows.length === 0) {
      console.log('❌ No hay clientes en la base de datos');
      return;
    }
    
    // Obtener ubicaciones
    const ubicaciones = await query(`
      SELECT ubicacion_id, nombre
      FROM ubicaciones 
      ORDER BY ubicacion_id
    `);
    
    console.log(`📋 Usando ${clientes.rows.length} clientes y ${ubicaciones.rows.length} ubicaciones`);
    
    // Crear alquileres de prueba
    for (let i = 0; i < Math.min(vehiculosAlquilados.rows.length, 5); i++) {
      const vehiculo = vehiculosAlquilados.rows[i];
      const cliente = clientes.rows[i % clientes.rows.length];
      const pickupUbicacion = ubicaciones.rows[i % ubicaciones.rows.length];
      const dropoffUbicacion = ubicaciones.rows[(i + 1) % ubicaciones.rows.length];
      
      // Fechas de prueba
      const fechaRecogida = new Date();
      fechaRecogida.setDate(fechaRecogida.getDate() - Math.floor(Math.random() * 7)); // Entre 0 y 7 días atrás
      
      const fechaDevolucion = new Date(fechaRecogida);
      fechaDevolucion.setDate(fechaDevolucion.getDate() + Math.floor(Math.random() * 14) + 1); // Entre 1 y 15 días después
      
      // Calcular días y precios
      const totalDias = Math.ceil((fechaDevolucion - fechaRecogida) / (1000 * 60 * 60 * 24));
      const precioPorDia = Math.floor(Math.random() * 50) + 30; // Entre 30-80€
      const ingresoTotal = precioPorDia * totalDias;
      const ingresoFinal = ingresoTotal; // Sin descuentos por ahora
      
      // Crear el alquiler
      const alquilerResult = await query(`
        INSERT INTO alquileres (
          vehiculo_id, cliente_id, 
          fecha_recogida_real, fecha_devolucion_real,
          pickup_ubicacion_id, dropoff_ubicacion_id,
          km_salida, nivel_combustible_salida,
          precio_por_dia, total_dias, ingreso_total, ingreso_final,
          estado, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        RETURNING alquiler_id
      `, [
        vehiculo.vehiculo_id,
        cliente.cliente_id,
        fechaRecogida,
        fechaDevolucion,
        pickupUbicacion.ubicacion_id,
        dropoffUbicacion.ubicacion_id,
        Math.floor(Math.random() * 50000) + 10000, // Km entre 10k y 60k
        Math.floor(Math.random() * 4) + 1, // Nivel combustible 1-4
        precioPorDia,
        totalDias,
        ingresoTotal,
        ingresoFinal,
        'abierto'
      ]);
      
      console.log(`✅ Creado alquiler #${alquilerResult.rows[0].alquiler_id} para ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.matricula})`);
      console.log(`   Cliente: ${cliente.nombre} ${cliente.apellidos}`);
      console.log(`   Recogida: ${fechaRecogida.toLocaleDateString()} - Devolución: ${fechaDevolucion.toLocaleDateString()}`);
      console.log(`   Precio: €${precioPorDia}/día - Total: €${ingresoTotal} (${totalDias} días)`);
    }
    
    console.log('\n🎉 Alquileres de prueba creados exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

createTestAlquileres(); 