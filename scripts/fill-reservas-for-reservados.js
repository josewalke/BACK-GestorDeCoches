const { query } = require('../src/config/database');

async function fillReservasForReservados() {
  try {
    // 1. Buscar todos los vehículos con estado 'reservado'
    const vehiculosResult = await query(`
      SELECT vehiculo_id FROM vehiculos WHERE estado = 'reservado'
    `);
    const vehiculos = vehiculosResult.rows;
    if (vehiculos.length === 0) {
      console.log('No hay vehículos con estado reservado.');
      return;
    }
    console.log(`Se encontraron ${vehiculos.length} vehículos reservados.`);

    // 2. Buscar un cliente válido
    const clienteResult = await query(`SELECT cliente_id FROM clientes LIMIT 1`);
    if (clienteResult.rows.length === 0) {
      console.log('No hay clientes en la base de datos.');
      return;
    }
    const cliente_id = clienteResult.rows[0].cliente_id;

    // 3. Buscar dos ubicaciones válidas
    const ubicacionesResult = await query(`SELECT ubicacion_id FROM ubicaciones LIMIT 2`);
    if (ubicacionesResult.rows.length < 2) {
      console.log('No hay suficientes ubicaciones en la base de datos.');
      return;
    }
    const pickup_ubicacion_id = ubicacionesResult.rows[0].ubicacion_id;
    const dropoff_ubicacion_id = ubicacionesResult.rows[1].ubicacion_id;

    // 4. Buscar una categoría válida
    const categoriaResult = await query(`SELECT categoria_id FROM categorias_vehiculo LIMIT 1`);
    if (categoriaResult.rows.length === 0) {
      console.log('No hay categorías en la base de datos.');
      return;
    }
    const categoria_id = categoriaResult.rows[0].categoria_id;

    // 5. Insertar una reserva para cada vehículo reservado
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    const fecha_recogida = hoy.toISOString().slice(0, 10);
    const fecha_devolucion = manana.toISOString().slice(0, 10);

    let insertados = 0;
    for (const v of vehiculos) {
      await query(`
        INSERT INTO reservas (
          vehiculo_id, cliente_id, fecha_recogida_prevista, fecha_devolucion_prevista,
          pickup_ubicacion_id, dropoff_ubicacion_id, categoria_id, estado_entrega, estado_devolucion
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente', 'pendiente')
      `, [
        v.vehiculo_id,
        cliente_id,
        fecha_recogida,
        fecha_devolucion,
        pickup_ubicacion_id,
        dropoff_ubicacion_id,
        categoria_id
      ]);
      insertados++;
    }
    console.log(`Reservas insertadas: ${insertados}`);
  } catch (error) {
    console.error('Error rellenando reservas:', error.message);
  } finally {
    process.exit(0);
  }
}

fillReservasForReservados(); 