const { query } = require('../src/config/database');

async function checkReservations() {
  try {
    console.log('🔍 Verificando reservas en la base de datos...\n');

    // Consulta para obtener todos los vehículos con sus reservas
    const result = await query(`
      SELECT 
        v.vehiculo_id,
        v.marca,
        v.modelo,
        v.matricula,
        v.estado,
        COUNT(res.reserva_id) as total_reservas,
        COUNT(CASE WHEN res.estado_entrega = 'pendiente' THEN 1 END) as reservas_pendientes,
        COUNT(CASE WHEN res.estado_entrega = 'entregado' THEN 1 END) as reservas_entregadas,
        COUNT(CASE WHEN res.estado_entrega = 'cancelado' THEN 1 END) as reservas_canceladas,
        COUNT(CASE WHEN res.estado_entrega = 'no_show' THEN 1 END) as reservas_no_show
      FROM vehiculos v
      LEFT JOIN reservas res ON v.vehiculo_id = res.vehiculo_id
      GROUP BY v.vehiculo_id, v.marca, v.modelo, v.matricula, v.estado
      HAVING COUNT(res.reserva_id) > 0
      ORDER BY total_reservas DESC, v.marca, v.modelo
    `);

    if (result.rows.length === 0) {
      console.log('❌ No se encontraron vehículos con reservas en la base de datos.');
      return;
    }

    console.log(`✅ Se encontraron ${result.rows.length} vehículos con reservas:\n`);

    result.rows.forEach((vehiculo, index) => {
      console.log(`${index + 1}. ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.matricula})`);
      console.log(`   Estado: ${vehiculo.estado}`);
      console.log(`   Total reservas: ${vehiculo.total_reservas}`);
      console.log(`   - Pendientes: ${vehiculo.reservas_pendientes}`);
      console.log(`   - Entregadas: ${vehiculo.reservas_entregadas}`);
      console.log(`   - Canceladas: ${vehiculo.reservas_canceladas}`);
      console.log(`   - No Show: ${vehiculo.reservas_no_show}`);
      console.log('');
    });

    // Consulta adicional para ver detalles de las reservas
    console.log('📋 Detalles de las reservas:\n');
    const reservasDetalle = await query(`
      SELECT 
        v.vehiculo_id,
        v.marca,
        v.modelo,
        v.matricula,
        res.reserva_id,
        res.fecha_recogida_prevista,
        res.fecha_devolucion_prevista,
        res.estado_entrega,
        res.estado_devolucion,
        c.nombre as cliente_nombre,
        c.apellidos as cliente_apellidos
      FROM vehiculos v
      JOIN reservas res ON v.vehiculo_id = res.vehiculo_id
      JOIN clientes c ON res.cliente_id = c.cliente_id
      ORDER BY res.fecha_recogida_prevista ASC
    `);

    reservasDetalle.rows.forEach((reserva, index) => {
      console.log(`${index + 1}. Reserva #${reserva.reserva_id}`);
      console.log(`   Vehículo: ${reserva.marca} ${reserva.modelo} (${reserva.matricula})`);
      console.log(`   Cliente: ${reserva.cliente_nombre} ${reserva.cliente_apellidos}`);
      console.log(`   Recogida: ${reserva.fecha_recogida_prevista}`);
      console.log(`   Devolución: ${reserva.fecha_devolucion_prevista}`);
      console.log(`   Estado entrega: ${reserva.estado_entrega}`);
      console.log(`   Estado devolución: ${reserva.estado_devolucion}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error verificando reservas:', error.message);
  } finally {
    process.exit(0);
  }
}

checkReservations(); 