const { query } = require('../src/config/database');

async function diversifyReservations() {
  try {
    console.log('🔄 Diversificando reservas...\n');

    // 1. Obtener todos los clientes disponibles
    const clientesResult = await query(`SELECT cliente_id, nombre, apellidos FROM clientes`);
    const clientes = clientesResult.rows;
    if (clientes.length === 0) {
      console.log('No hay clientes en la base de datos.');
      return;
    }
    console.log(`Clientes disponibles: ${clientes.length}`);

    // 2. Obtener todas las ubicaciones
    const ubicacionesResult = await query(`SELECT ubicacion_id, nombre FROM ubicaciones`);
    const ubicaciones = ubicacionesResult.rows;
    if (ubicaciones.length < 2) {
      console.log('No hay suficientes ubicaciones.');
      return;
    }
    console.log(`Ubicaciones disponibles: ${ubicaciones.length}`);

    // 3. Obtener todas las categorías
    const categoriasResult = await query(`SELECT categoria_id, nombre FROM categorias_vehiculo`);
    const categorias = categoriasResult.rows;
    if (categorias.length === 0) {
      console.log('No hay categorías.');
      return;
    }
    console.log(`Categorías disponibles: ${categorias.length}`);

    // 4. Obtener todas las reservas existentes
    const reservasResult = await query(`SELECT reserva_id, vehiculo_id FROM reservas ORDER BY reserva_id`);
    const reservas = reservasResult.rows;
    console.log(`Reservas a diversificar: ${reservas.length}`);

    // 5. Generar fechas variadas (próximos 30 días)
    const fechas = [];
    const hoy = new Date();
    for (let i = 1; i <= 30; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      fechas.push({
        recogida: fecha.toISOString().slice(0, 10),
        devolucion: new Date(fecha.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      });
    }

    // 6. Actualizar cada reserva con datos diferentes
    let actualizadas = 0;
    for (let i = 0; i < reservas.length; i++) {
      const reserva = reservas[i];
      
      // Seleccionar cliente aleatorio
      const cliente = clientes[i % clientes.length];
      
      // Seleccionar ubicaciones aleatorias (diferentes)
      const pickupIndex = i % ubicaciones.length;
      const dropoffIndex = (i + 1) % ubicaciones.length;
      const pickup_ubicacion_id = ubicaciones[pickupIndex].ubicacion_id;
      const dropoff_ubicacion_id = ubicaciones[dropoffIndex].ubicacion_id;
      
      // Seleccionar categoría aleatoria
      const categoria = categorias[i % categorias.length];
      
      // Seleccionar fechas aleatorias
      const fechaIndex = i % fechas.length;
      const fechasReserva = fechas[fechaIndex];

      await query(`
        UPDATE reservas SET 
          cliente_id = $1,
          fecha_recogida_prevista = $2,
          fecha_devolucion_prevista = $3,
          pickup_ubicacion_id = $4,
          dropoff_ubicacion_id = $5,
          categoria_id = $6
        WHERE reserva_id = $7
      `, [
        cliente.cliente_id,
        fechasReserva.recogida,
        fechasReserva.devolucion,
        pickup_ubicacion_id,
        dropoff_ubicacion_id,
        categoria.categoria_id,
        reserva.reserva_id
      ]);

      actualizadas++;
      console.log(`Reserva #${reserva.reserva_id} actualizada: ${cliente.nombre} ${cliente.apellidos} - ${fechasReserva.recogida} a ${fechasReserva.devolucion}`);
    }

    console.log(`\n✅ Reservas diversificadas: ${actualizadas}`);

  } catch (error) {
    console.error('❌ Error diversificando reservas:', error.message);
  } finally {
    process.exit(0);
  }
}

diversifyReservations(); 