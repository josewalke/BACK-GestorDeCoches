require('dotenv').config();
const { query } = require('./database-pg');

// Datos para tarifas
const tarifasData = [
  { categoria_id: 1, precio_por_dia: 35, precio_por_semana: 210, precio_por_mes: 800 },
  { categoria_id: 2, precio_por_dia: 45, precio_por_semana: 270, precio_por_mes: 1000 },
  { categoria_id: 3, precio_por_dia: 55, precio_por_semana: 330, precio_por_mes: 1200 },
  { categoria_id: 4, precio_por_dia: 75, precio_por_semana: 450, precio_por_mes: 1600 },
  { categoria_id: 5, precio_por_dia: 40, precio_por_semana: 240, precio_por_mes: 900 },
  { categoria_id: 6, precio_por_dia: 90, precio_por_semana: 540, precio_por_mes: 2000 }
];

// Datos para reservas
const generarReserva = (vehiculoId, clienteId) => {
  const fechaReserva = new Date();
  const diasFuturos = Math.floor(Math.random() * 30) + 1;
  const fechaInicio = new Date(fechaReserva.getTime() + (diasFuturos * 24 * 60 * 60 * 1000));
  const duracion = Math.floor(Math.random() * 14) + 1;
  const fechaFin = new Date(fechaInicio.getTime() + (duracion * 24 * 60 * 60 * 1000));
  
  return {
    reserva_id: null,
    vehiculo_id: vehiculoId,
    cliente_id: clienteId,
    fecha_reserva: fechaReserva.toISOString().split('T')[0],
    fecha_inicio_reserva: fechaInicio.toISOString().split('T')[0],
    fecha_fin_reserva: fechaFin.toISOString().split('T')[0],
    estado: Math.random() > 0.3 ? 'CONFIRMADA' : 'PENDIENTE',
    notas: 'Reserva realizada por cliente'
  };
};

// Datos para alquileres
const generarAlquiler = (vehiculoId, clienteId) => {
  const fechaInicio = new Date();
  const diasAtras = Math.floor(Math.random() * 14) + 1;
  fechaInicio.setDate(fechaInicio.getDate() - diasAtras);
  
  const duracion = Math.floor(Math.random() * 14) + 1;
  const fechaFin = new Date(fechaInicio.getTime() + (duracion * 24 * 60 * 60 * 1000));
  const precioPorDia = Math.floor(Math.random() * 80) + 40;
  const precioTotal = precioPorDia * duracion;
  const igic = precioTotal * 0.07;
  
  return {
    alquiler_id: null,
    vehiculo_id: vehiculoId,
    cliente_id: clienteId,
    fecha_inicio: fechaInicio.toISOString().split('T')[0],
    fecha_fin: fechaFin.toISOString().split('T')[0],
    precio_por_dia: precioPorDia,
    precio_total: precioTotal,
    igic: igic,
    precio_total_con_igic: precioTotal + igic,
    ubicacion_recogida: 'Aeropuerto Tenerife Sur',
    ubicacion_devolucion: 'Aeropuerto Tenerife Sur',
    estado: Math.random() > 0.2 ? 'ACTIVO' : 'COMPLETADO',
    notas: 'Alquiler estándar'
  };
};

// Datos para pagos
const generarPago = (alquilerId, alquiler) => {
  const metodosPago = ['TARJETA_CREDITO', 'TARJETA_DEBITO', 'EFECTIVO', 'TRANSFERENCIA'];
  
  return {
    pago_id: null,
    alquiler_id: alquilerId,
    monto: alquiler.precio_total_con_igic,
    metodo_pago: metodosPago[Math.floor(Math.random() * metodosPago.length)],
    fecha_pago: alquiler.fecha_inicio,
    estado: 'COMPLETADO',
    referencia: generarReferenciaPago()
  };
};

// Generar referencia de pago
const generarReferenciaPago = () => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let referencia = '';
  for (let i = 0; i < 12; i++) {
    referencia += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return referencia;
};

// Datos para seguros
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

async function fillAllTables() {
  try {
    console.log('🚀 Rellenando todas las tablas vacías con datos realistas...\n');
    
    // 1. Rellenar tarifas
    console.log('💰 Rellenando tabla tarifas...');
    for (const tarifa of tarifasData) {
      await query(`
        INSERT INTO tarifas (categoria_id, precio_por_dia, precio_por_semana, precio_por_mes)
        VALUES ($1, $2, $3, $4)
      `, [tarifa.categoria_id, tarifa.precio_por_dia, tarifa.precio_por_semana, tarifa.precio_por_mes]);
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
    
    // 3. Rellenar alquileres para vehículos alquilados
    console.log('🚗 Rellenando tabla alquileres...');
    const vehiculosAlquilados = await query(`
      SELECT vehiculo_id FROM vehiculos WHERE estado = 'alquilado' ORDER BY vehiculo_id
    `);
    
    for (const vehiculo of vehiculosAlquilados.rows) {
      const clienteId = Math.floor(Math.random() * 60) + 1;
      const alquiler = generarAlquiler(vehiculo.vehiculo_id, clienteId);
      
      await query(`
        INSERT INTO alquileres (
          vehiculo_id, cliente_id, fecha_inicio, fecha_fin, 
          precio_por_dia, precio_total, igic, precio_total_con_igic,
          ubicacion_recogida, ubicacion_devolucion, estado, notas
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        alquiler.vehiculo_id, alquiler.cliente_id, alquiler.fecha_inicio, alquiler.fecha_fin,
        alquiler.precio_por_dia, alquiler.precio_total, alquiler.igic, alquiler.precio_total_con_igic,
        alquiler.ubicacion_recogida, alquiler.ubicacion_devolucion, alquiler.estado, alquiler.notas
      ]);
    }
    console.log(`✅ ${vehiculosAlquilados.rows.length} alquileres generados`);
    
    // 4. Rellenar pagos para los alquileres
    console.log('💳 Rellenando tabla pagos...');
    const alquileres = await query('SELECT alquiler_id, precio_total_con_igic, fecha_inicio FROM alquileres ORDER BY alquiler_id');
    
    for (const alquiler of alquileres.rows) {
      const pago = generarPago(alquiler.alquiler_id, alquiler);
      
      await query(`
        INSERT INTO pagos (
          alquiler_id, monto, metodo_pago, fecha_pago, estado, referencia
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [pago.alquiler_id, pago.monto, pago.metodo_pago, pago.fecha_pago, pago.estado, pago.referencia]);
    }
    console.log(`✅ ${alquileres.rows.length} pagos generados`);
    
    // 5. Rellenar reservas para algunos vehículos disponibles
    console.log('📅 Rellenando tabla reservas...');
    const vehiculosDisponibles = await query(`
      SELECT vehiculo_id FROM vehiculos WHERE estado = 'disponible' ORDER BY vehiculo_id
    `);
    
    let reservasGeneradas = 0;
    for (const vehiculo of vehiculosDisponibles.rows) {
      // Solo generar reservas para algunos vehículos disponibles
      if (Math.random() > 0.6) {
        const clienteId = Math.floor(Math.random() * 60) + 1;
        const reserva = generarReserva(vehiculo.vehiculo_id, clienteId);
        
        await query(`
          INSERT INTO reservas (
            vehiculo_id, cliente_id, fecha_reserva, fecha_inicio_reserva, 
            fecha_fin_reserva, estado, notas
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          reserva.vehiculo_id, reserva.cliente_id, reserva.fecha_reserva,
          reserva.fecha_inicio_reserva, reserva.fecha_fin_reserva, reserva.estado, reserva.notas
        ]);
        
        reservasGeneradas++;
      }
    }
    console.log(`✅ ${reservasGeneradas} reservas generadas`);
    
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
  fillAllTables();
}

module.exports = { fillAllTables }; 