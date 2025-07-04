require('dotenv').config();
const { query } = require('./database-pg');

// Generar llamada de reserva
const generarLlamadaReserva = (clienteId, vehiculoId, categoriaId) => {
  const fechaLlamada = new Date();
  fechaLlamada.setDate(fechaLlamada.getDate() - Math.floor(Math.random() * 30)); // Llamada de hace 0-30 días
  
  const diasFuturos = Math.floor(Math.random() * 60) + 1; // Reserva para 1-60 días en el futuro
  const fechaReservaDeseada = new Date(fechaLlamada.getTime() + (diasFuturos * 24 * 60 * 60 * 1000));
  const duracion = Math.floor(Math.random() * 14) + 1; // Duración de 1-14 días
  const fechaDevolucionDeseada = new Date(fechaReservaDeseada.getTime() + (duracion * 24 * 60 * 60 * 1000));
  
  const motivos = [
    'Consulta sobre disponibilidad',
    'Reserva para vacaciones',
    'Viaje de negocios',
    'Evento especial',
    'Transporte familiar',
    'Reemplazo de vehículo en taller',
    'Visita turística',
    'Transporte de equipaje',
    'Necesidad temporal de vehículo',
    'Prueba de vehículo'
  ];
  
  const notasOperador = [
    'Cliente interesado en seguro adicional',
    'Solicita vehículo automático',
    'Necesita GPS incluido',
    'Cliente frecuente',
    'Primera vez que alquila',
    'Solicita asientos infantiles',
    'Cliente VIP',
    'Necesita vehículo adaptado',
    'Solicita entrega en hotel',
    'Cliente con descuento corporativo'
  ];
  
  const estados = ['pendiente', 'confirmada', 'rechazada', 'cancelada', 'completada'];
  
  return {
    llamada_id: null,
    cliente_id: clienteId,
    vehiculo_id: vehiculoId,
    categoria_id: categoriaId,
    fecha_llamada: fechaLlamada.toISOString(),
    fecha_reserva_deseada: fechaReservaDeseada.toISOString().split('T')[0],
    fecha_devolucion_deseada: fechaDevolucionDeseada.toISOString().split('T')[0],
    pickup_ubicacion_id: Math.floor(Math.random() * 6) + 1,
    dropoff_ubicacion_id: Math.floor(Math.random() * 6) + 1,
    estado_llamada: estados[Math.floor(Math.random() * estados.length)],
    motivo_llamada: motivos[Math.floor(Math.random() * motivos.length)],
    notas_operador: Math.random() > 0.3 ? notasOperador[Math.floor(Math.random() * notasOperador.length)] : null,
    operador_id: Math.floor(Math.random() * 4) + 1,
    created_at: fechaLlamada.toISOString(),
    updated_at: fechaLlamada.toISOString()
  };
};

async function fillLlamadasReservas() {
  try {
    console.log('📞 Generando datos realistas de llamadas de reservas...\n');
    
    // Obtener clientes y vehículos
    const clientes = await query('SELECT cliente_id FROM clientes ORDER BY cliente_id');
    const vehiculos = await query('SELECT vehiculo_id, categoria_id FROM vehiculos ORDER BY vehiculo_id');
    
    console.log(`📋 Encontrados ${clientes.rows.length} clientes y ${vehiculos.rows.length} vehículos.`);
    
    // Generar llamadas de reservas
    let llamadasGeneradas = 0;
    const totalLlamadas = Math.floor(Math.random() * 50) + 30; // Entre 30 y 80 llamadas
    
    for (let i = 0; i < totalLlamadas; i++) {
      const clienteId = clientes.rows[Math.floor(Math.random() * clientes.rows.length)].cliente_id;
      const vehiculo = vehiculos.rows[Math.floor(Math.random() * vehiculos.rows.length)];
      
      const llamada = generarLlamadaReserva(clienteId, vehiculo.vehiculo_id, vehiculo.categoria_id);
      
      await query(`
        INSERT INTO llamadas_reservas (
          cliente_id, vehiculo_id, categoria_id, fecha_llamada, fecha_reserva_deseada,
          fecha_devolucion_deseada, pickup_ubicacion_id, dropoff_ubicacion_id,
          estado_llamada, motivo_llamada, notas_operador, operador_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        llamada.cliente_id, llamada.vehiculo_id, llamada.categoria_id, llamada.fecha_llamada,
        llamada.fecha_reserva_deseada, llamada.fecha_devolucion_deseada, llamada.pickup_ubicacion_id,
        llamada.dropoff_ubicacion_id, llamada.estado_llamada, llamada.motivo_llamada,
        llamada.notas_operador, llamada.operador_id, llamada.created_at, llamada.updated_at
      ]);
      
      llamadasGeneradas++;
    }
    
    console.log(`✅ Se han generado ${llamadasGeneradas} llamadas de reservas.`);
    
    // Mostrar estadísticas
    console.log('\n📊 Estadísticas de llamadas por estado:');
    const estadisticas = await query(`
      SELECT estado_llamada, COUNT(*) as total
      FROM llamadas_reservas
      GROUP BY estado_llamada
      ORDER BY total DESC
    `);
    
    estadisticas.rows.forEach(stat => {
      console.log(`   ${stat.estado_llamada}: ${stat.total} llamadas`);
    });
    
    // Mostrar estadísticas por motivo
    console.log('\n📊 Top 5 motivos de llamada:');
    const motivos = await query(`
      SELECT motivo_llamada, COUNT(*) as total
      FROM llamadas_reservas
      GROUP BY motivo_llamada
      ORDER BY total DESC
      LIMIT 5
    `);
    
    motivos.rows.forEach(motivo => {
      console.log(`   ${motivo.motivo_llamada}: ${motivo.total} llamadas`);
    });
    
  } catch (error) {
    console.error('❌ Error generando llamadas:', error.message);
  }
}

if (require.main === module) {
  fillLlamadasReservas();
}

module.exports = { fillLlamadasReservas }; 