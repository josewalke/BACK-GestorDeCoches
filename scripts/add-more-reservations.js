const { query } = require('../src/config/database');

async function addMoreReservations() {
  try {
    console.log('🔄 Agregando más reservas a los coches ya reservados...\n');

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

    // 4. Obtener los vehículos que ya están reservados
    const vehiculosReservadosResult = await query(`
      SELECT vehiculo_id, marca, modelo, matricula 
      FROM vehiculos 
      WHERE estado = 'reservado'
      ORDER BY vehiculo_id
    `);
    const vehiculosReservados = vehiculosReservadosResult.rows;
    console.log(`Vehículos reservados encontrados: ${vehiculosReservados.length}`);

    // 5. Generar fechas para todo el mes (julio 2025)
    const fechas = [];
    const inicioMes = new Date('2025-07-01');
    const finMes = new Date('2025-07-31');
    
    for (let fecha = new Date(inicioMes); fecha <= finMes; fecha.setDate(fecha.getDate() + 1)) {
      fechas.push(new Date(fecha));
    }

    // 6. Para cada vehículo reservado, agregar 2-4 reservas adicionales
    let reservasAgregadas = 0;
    
    for (let i = 0; i < vehiculosReservados.length; i++) {
      const vehiculo = vehiculosReservados[i];
      const numReservasAdicionales = Math.floor(Math.random() * 3) + 2; // 2-4 reservas adicionales
      
      console.log(`\n🚗 ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.matricula}):`);
      
      for (let j = 0; j < numReservasAdicionales; j++) {
        // Seleccionar cliente aleatorio
        const cliente = clientes[Math.floor(Math.random() * clientes.length)];
        
        // Seleccionar ubicaciones aleatorias (diferentes)
        const pickupIndex = Math.floor(Math.random() * ubicaciones.length);
        const dropoffIndex = (pickupIndex + 1) % ubicaciones.length;
        const pickup_ubicacion_id = ubicaciones[pickupIndex].ubicacion_id;
        const dropoff_ubicacion_id = ubicaciones[dropoffIndex].ubicacion_id;
        
        // Seleccionar categoría aleatoria
        const categoria = categorias[Math.floor(Math.random() * categorias.length)];
        
        // Seleccionar fechas aleatorias del mes
        const fechaIndex = Math.floor(Math.random() * (fechas.length - 1));
        const fechaInicio = fechas[fechaIndex];
        const fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaInicio.getDate() + Math.floor(Math.random() * 3) + 1); // 1-3 días
        
        // Verificar que la fecha fin no exceda el mes
        if (fechaFin > finMes) {
          fechaFin.setDate(finMes.getDate());
        }

        // Insertar la nueva reserva
        await query(`
          INSERT INTO reservas (
            vehiculo_id, 
            cliente_id, 
            fecha_recogida_prevista, 
            fecha_devolucion_prevista,
            pickup_ubicacion_id,
            dropoff_ubicacion_id,
            categoria_id,
            estado_entrega,
            estado_devolucion
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          vehiculo.vehiculo_id,
          cliente.cliente_id,
          fechaInicio.toISOString().slice(0, 10),
          fechaFin.toISOString().slice(0, 10),
          pickup_ubicacion_id,
          dropoff_ubicacion_id,
          categoria.categoria_id,
          'pendiente',
          'pendiente'
        ]);

        reservasAgregadas++;
        console.log(`  ✅ Reserva #${reservasAgregadas}: ${cliente.nombre} ${cliente.apellidos} - ${fechaInicio.toISOString().slice(0, 10)} a ${fechaFin.toISOString().slice(0, 10)}`);
      }
    }

    console.log(`\n✅ Reservas adicionales agregadas: ${reservasAgregadas}`);
    console.log(`📊 Total de reservas en la base de datos: ${reservasAgregadas + 20}`);

  } catch (error) {
    console.error('❌ Error agregando reservas:', error.message);
  } finally {
    process.exit(0);
  }
}

addMoreReservations(); 