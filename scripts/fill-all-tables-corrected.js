require('dotenv').config();
const { query } = require('./database-pg');

// Datos para tarifas
const tarifasData = [
  { categoria_id: 1, precio_dia: 35, precio_km_extra: 0.15 },
  { categoria_id: 2, precio_dia: 45, precio_km_extra: 0.20 },
  { categoria_id: 3, precio_dia: 55, precio_km_extra: 0.25 },
  { categoria_id: 4, precio_dia: 75, precio_km_extra: 0.30 },
  { categoria_id: 5, precio_dia: 40, precio_km_extra: 0.18 },
  { categoria_id: 6, precio_dia: 90, precio_km_extra: 0.35 }
];

// Generar tarifa
const generarTarifa = (categoriaId) => {
  const fechaInicio = new Date();
  const fechaFin = new Date(fechaInicio.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 año
  
  return {
    tarifa_id: null,
    categoria_id: categoriaId,
    fecha_inicio: fechaInicio.toISOString().split('T')[0],
    fecha_fin: fechaFin.toISOString().split('T')[0],
    precio_dia: Math.floor(Math.random() * 80) + 40,
    precio_km_extra: Math.random() * 0.5 + 0.1,
    created_at: new Date().toISOString()
  };
};

// Generar reserva
const generarReserva = (clienteId, vehiculoId, categoriaId) => {
  const fechaReserva = new Date();
  const diasFuturos = Math.floor(Math.random() * 30) + 1;
  const fechaRecogida = new Date(fechaReserva.getTime() + (diasFuturos * 24 * 60 * 60 * 1000));
  const duracion = Math.floor(Math.random() * 14) + 1;
  const fechaDevolucion = new Date(fechaRecogida.getTime() + (duracion * 24 * 60 * 60 * 1000));
  
  return {
    reserva_id: null,
    cliente_id: clienteId,
    vehiculo_id: vehiculoId,
    categoria_id: categoriaId,
    fecha_reserva: fechaReserva.toISOString(),
    fecha_recogida_prevista: fechaRecogida.toISOString(),
    fecha_devolucion_prevista: fechaDevolucion.toISOString(),
    pickup_ubicacion_id: Math.floor(Math.random() * 6) + 1,
    dropoff_ubicacion_id: Math.floor(Math.random() * 6) + 1,
    estado_entrega: 'PENDIENTE',
    estado_devolucion: 'PENDIENTE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// Generar alquiler
const generarAlquiler = (reservaId, vehiculoId, clienteId) => {
  const fechaRecogida = new Date();
  fechaRecogida.setDate(fechaRecogida.getDate() - Math.floor(Math.random() * 14));
  
  return {
    alquiler_id: null,
    reserva_id: reservaId,
    vehiculo_id: vehiculoId,
    cliente_id: clienteId,
    fecha_recogida_real: fechaRecogida.toISOString(),
    fecha_devolucion_real: null,
    pickup_ubicacion_id: Math.floor(Math.random() * 6) + 1,
    dropoff_ubicacion_id: Math.floor(Math.random() * 6) + 1,
    km_salida: Math.floor(Math.random() * 50000) + 10000,
    nivel_combustible_salida: Math.floor(Math.random() * 100) + 50,
    km_entrada: null,
    nivel_combustible_entrada: null,
    estado: 'ACTIVO',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// Generar pago
const generarPago = (alquilerId) => {
  const metodos = ['TARJETA_CREDITO', 'TARJETA_DEBITO', 'EFECTIVO', 'TRANSFERENCIA'];
  
  return {
    pago_id: null,
    alquiler_id: alquilerId,
    fecha_pago: new Date().toISOString(),
    monto: Math.floor(Math.random() * 1000) + 200,
    metodo: metodos[Math.floor(Math.random() * metodos.length)],
    created_at: new Date().toISOString()
  };
};

// Generar seguro
const generarSeguro = (vehiculoId) => {
  const aseguradoras = ['Mapfre', 'Allianz', 'AXA', 'Generali', 'Zurich'];
  const tiposCobertura = ['Básico', 'Completo', 'Premium', 'Todo Riesgo'];
  
  const fechaInicio = new Date();
  const fechaFin = new Date(fechaInicio.getTime() + (365 * 24 * 60 * 60 * 1000));
  
  return {
    seguro_id: null,
    vehiculo_id: vehiculoId,
    compañia: aseguradoras[Math.floor(Math.random() * aseguradoras.length)],
    poliza_numero: generarNumeroPoliza(),
    cobertura_desde: fechaInicio.toISOString().split('T')[0],
    cobertura_hasta: fechaFin.toISOString().split('T')[0],
    tipo_cobertura: tiposCobertura[Math.floor(Math.random() * tiposCobertura.length)],
    created_at: new Date().toISOString()
  };
};

// Generar número de póliza
const generarNumeroPoliza = () => {
  const numeros = '0123456789';
  let poliza = '';
  for (let i = 0; i < 10; i++) {
    poliza += numeros.charAt(Math.floor(Math.random() * numeros.length));
  }
  return poliza;
};

async function fillAllTablesCorrected() {
  try {
    console.log('🚀 Rellenando todas las tablas vacías con datos realistas...\n');
    
    // 1. Rellenar tarifas
    console.log('💰 Rellenando tabla tarifas...');
    for (let i = 1; i <= 6; i++) {
      const tarifa = generarTarifa(i);
      await query(`
        INSERT INTO tarifas (
          categoria_id, fecha_inicio, fecha_fin, precio_dia, precio_km_extra, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        tarifa.categoria_id, tarifa.fecha_inicio, tarifa.fecha_fin,
        tarifa.precio_dia, tarifa.precio_km_extra, tarifa.created_at
      ]);
    }
    console.log('✅ Tarifas generadas');
    
    // 2. Rellenar seguros para todos los vehículos
    console.log('🛡️ Rellenando tabla seguros_vehiculo...');
    const vehiculos = await query('SELECT vehiculo_id FROM vehiculos ORDER BY vehiculo_id');
    
    for (const vehiculo of vehiculos.rows) {
      const seguro = generarSeguro(vehiculo.vehiculo_id);
      await query(`
        INSERT INTO seguros_vehiculo (
          vehiculo_id, compañia, poliza_numero, cobertura_desde,
          cobertura_hasta, tipo_cobertura, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        seguro.vehiculo_id, seguro.compañia, seguro.poliza_numero, seguro.cobertura_desde,
        seguro.cobertura_hasta, seguro.tipo_cobertura, seguro.created_at
      ]);
    }
    console.log('✅ Seguros generados');
    
    // 3. Rellenar reservas para algunos vehículos
    console.log('📅 Rellenando tabla reservas...');
    const vehiculosDisponibles = await query(`
      SELECT vehiculo_id FROM vehiculos WHERE estado = 'disponible' ORDER BY vehiculo_id
    `);
    
    let reservasGeneradas = 0;
    for (let i = 0; i < Math.min(15, vehiculosDisponibles.rows.length); i++) {
      const vehiculo = vehiculosDisponibles.rows[i];
      const clienteId = Math.floor(Math.random() * 60) + 1;
      const categoriaId = Math.floor(Math.random() * 6) + 1;
      const reserva = generarReserva(clienteId, vehiculo.vehiculo_id, categoriaId);
      
      await query(`
        INSERT INTO reservas (
          cliente_id, vehiculo_id, categoria_id, fecha_reserva, fecha_recogida_prevista,
          fecha_devolucion_prevista, pickup_ubicacion_id, dropoff_ubicacion_id,
          estado_entrega, estado_devolucion, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        reserva.cliente_id, reserva.vehiculo_id, reserva.categoria_id, reserva.fecha_reserva,
        reserva.fecha_recogida_prevista, reserva.fecha_devolucion_prevista, reserva.pickup_ubicacion_id,
        reserva.dropoff_ubicacion_id, reserva.estado_entrega, reserva.estado_devolucion,
        reserva.created_at, reserva.updated_at
      ]);
      
      reservasGeneradas++;
    }
    console.log(`✅ ${reservasGeneradas} reservas generadas`);
    
    // 4. Rellenar alquileres para vehículos alquilados
    console.log('🚗 Rellenando tabla alquileres...');
    const vehiculosAlquilados = await query(`
      SELECT vehiculo_id FROM vehiculos WHERE estado = 'alquilado' ORDER BY vehiculo_id
    `);
    
    let alquileresGenerados = 0;
    for (const vehiculo of vehiculosAlquilados.rows) {
      const clienteId = Math.floor(Math.random() * 60) + 1;
      const alquiler = generarAlquiler(null, vehiculo.vehiculo_id, clienteId);
      
      await query(`
        INSERT INTO alquileres (
          reserva_id, vehiculo_id, cliente_id, fecha_recogida_real, fecha_devolucion_real,
          pickup_ubicacion_id, dropoff_ubicacion_id, km_salida, nivel_combustible_salida,
          km_entrada, nivel_combustible_entrada, estado, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        alquiler.reserva_id, alquiler.vehiculo_id, alquiler.cliente_id, alquiler.fecha_recogida_real,
        alquiler.fecha_devolucion_real, alquiler.pickup_ubicacion_id, alquiler.dropoff_ubicacion_id,
        alquiler.km_salida, alquiler.nivel_combustible_salida, alquiler.km_entrada,
        alquiler.nivel_combustible_entrada, alquiler.estado, alquiler.created_at, alquiler.updated_at
      ]);
      
      alquileresGenerados++;
    }
    console.log(`✅ ${alquileresGenerados} alquileres generados`);
    
    // 5. Rellenar pagos para los alquileres
    console.log('💳 Rellenando tabla pagos...');
    const alquileres = await query('SELECT alquiler_id FROM alquileres ORDER BY alquiler_id');
    
    for (const alquiler of alquileres.rows) {
      const pago = generarPago(alquiler.alquiler_id);
      
      await query(`
        INSERT INTO pagos (
          alquiler_id, fecha_pago, monto, metodo, created_at
        ) VALUES ($1, $2, $3, $4, $5)
      `, [pago.alquiler_id, pago.fecha_pago, pago.monto, pago.metodo, pago.created_at]);
    }
    console.log(`✅ ${alquileres.rows.length} pagos generados`);
    
    // Mostrar resumen final
    console.log('\n📊 Resumen final de todas las tablas:');
    
    const tablas = ['vehiculos', 'clientes', 'usuarios', 'categorias_vehiculo', 'ubicaciones', 
                   'tarifas', 'seguros_vehiculo', 'alquileres', 'pagos', 'reservas', 'mantenimientos'];
    
    for (const tabla of tablas) {
      try {
        const count = await query(`SELECT COUNT(*) as total FROM ${tabla}`);
        console.log(`   ${tabla}: ${count.rows[0].total} registros`);
      } catch (error) {
        console.log(`   ${tabla}: Error al contar`);
      }
    }
    
    console.log('\n✅ ¡Todas las tablas han sido rellenadas con datos realistas!');
    
  } catch (error) {
    console.error('❌ Error rellenando tablas:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  fillAllTablesCorrected();
}

module.exports = { fillAllTablesCorrected }; 