require('dotenv').config();
const { query } = require('./database-pg');

// Datos realistas para casos
const nombresClientes = [
  'María González', 'Carlos Rodríguez', 'Ana Fernández', 'Luis Martínez', 'Sofia López',
  'David García', 'Elena Pérez', 'Javier Sánchez', 'Carmen Torres', 'Miguel Ruiz',
  'Isabel Moreno', 'Francisco Jiménez', 'Laura Díaz', 'Antonio Vega', 'Patricia Romero',
  'Manuel Molina', 'Cristina Herrera', 'José Silva', 'Rosa Castro', 'Pedro Ortega',
  'Lucía Navarro', 'Diego Morales', 'Paula Guerrero', 'Alberto Suárez', 'Natalia Flores',
  'Roberto Cortés', 'Mónica Reyes', 'Fernando Cruz', 'Adriana Mendoza', 'Ricardo Aguilar',
  'Silvia Paredes', 'Héctor Ríos', 'Valeria Soto', 'Gabriel Campos', 'Daniela Vargas'
];

const apellidosClientes = [
  'López', 'Martínez', 'González', 'Rodríguez', 'Fernández', 'García', 'Pérez', 'Sánchez',
  'Torres', 'Ruiz', 'Moreno', 'Jiménez', 'Díaz', 'Vega', 'Romero', 'Molina', 'Herrera',
  'Silva', 'Castro', 'Ortega', 'Navarro', 'Morales', 'Guerrero', 'Suárez', 'Flores',
  'Cortés', 'Reyes', 'Cruz', 'Mendoza', 'Aguilar', 'Paredes', 'Ríos', 'Soto', 'Campos'
];

const emails = [
  'maria.gonzalez@email.com', 'carlos.rodriguez@email.com', 'ana.fernandez@email.com',
  'luis.martinez@email.com', 'sofia.lopez@email.com', 'david.garcia@email.com',
  'elena.perez@email.com', 'javier.sanchez@email.com', 'carmen.torres@email.com',
  'miguel.ruiz@email.com', 'isabel.moreno@email.com', 'francisco.jimenez@email.com',
  'laura.diaz@email.com', 'antonio.vega@email.com', 'patricia.romero@email.com',
  'manuel.molina@email.com', 'cristina.herrera@email.com', 'jose.silva@email.com',
  'rosa.castro@email.com', 'pedro.ortega@email.com', 'lucia.navarro@email.com',
  'diego.morales@email.com', 'paula.guerrero@email.com', 'alberto.suarez@email.com',
  'natalia.flores@email.com', 'roberto.cortes@email.com', 'monica.reyes@email.com',
  'fernando.cruz@email.com', 'adriana.mendoza@email.com', 'ricardo.aguilar@email.com',
  'silvia.paredes@email.com', 'hector.rios@email.com', 'valeria.soto@email.com',
  'gabriel.campos@email.com', 'daniela.vargas@email.com'
];

const telefonos = [
  '+34 600 123 456', '+34 600 654 321', '+34 600 987 654', '+34 600 456 789',
  '+34 600 321 654', '+34 600 789 123', '+34 600 147 258', '+34 600 369 258',
  '+34 600 741 852', '+34 600 963 852', '+34 600 159 753', '+34 600 357 951',
  '+34 600 951 753', '+34 600 753 951', '+34 600 951 357', '+34 600 357 159',
  '+34 600 159 357', '+34 600 753 159', '+34 600 951 159', '+34 600 357 753',
  '+34 600 159 951', '+34 600 753 357', '+34 600 951 753', '+34 600 357 951',
  '+34 600 159 753', '+34 600 753 159', '+34 600 951 357', '+34 600 357 159',
  '+34 600 159 951', '+34 600 753 951', '+34 600 951 159', '+34 600 357 753',
  '+34 600 159 357', '+34 600 753 951', '+34 600 951 753'
];

const ubicacionesAlquiler = [
  'Aeropuerto Tenerife Sur', 'Aeropuerto Tenerife Norte', 'Puerto de Santa Cruz',
  'Centro Comercial Meridiano', 'Puerto de Los Cristianos', 'Centro de Las Palmas'
];

const tiposSeguro = [
  'Básico', 'Completo', 'Premium', 'Todo Riesgo', 'Terceros Ampliado'
];

const aseguradoras = [
  'Mapfre', 'Allianz', 'AXA', 'Generali', 'Zurich', 'Liberty', 'HDI', 'Axa'
];

// Generar DNI único
function generarDNI() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeros = '0123456789';
  let dni = '';
  
  // 8 números
  for (let i = 0; i < 8; i++) {
    dni += numeros.charAt(Math.floor(Math.random() * numeros.length));
  }
  
  // 1 letra
  dni += letras.charAt(Math.floor(Math.random() * letras.length));
  
  return dni;
}

// Generar fecha de alquiler
function generarFechaAlquiler() {
  const fechaActual = new Date();
  const diasAtras = Math.floor(Math.random() * 30) + 1; // 1-30 días atrás
  return new Date(fechaActual.getTime() - (diasAtras * 24 * 60 * 60 * 1000));
}

// Generar duración de alquiler
function generarDuracionAlquiler() {
  return Math.floor(Math.random() * 14) + 1; // 1-14 días
}

// Generar precio por día
function generarPrecioPorDia() {
  return Math.floor(Math.random() * 80) + 40; // 40-120€ por día
}

// Generar cliente
function generarCliente(id) {
  const nombre = nombresClientes[id % nombresClientes.length];
  const apellido = apellidosClientes[id % apellidosClientes.length];
  const email = emails[id % emails.length];
  const telefono = telefonos[id % telefonos.length];
  
  return {
    cliente_id: id,
    nombre: nombre,
    apellidos: apellido,
    dni_pasaporte: generarDNI(),
    email: email,
    telefono: telefono
  };
}

// Generar alquiler
function generarAlquiler(vehiculoId, clienteId, vehiculo) {
  const fechaInicio = generarFechaAlquiler();
  const duracion = generarDuracionAlquiler();
  const fechaFin = new Date(fechaInicio.getTime() + (duracion * 24 * 60 * 60 * 1000));
  const precioPorDia = generarPrecioPorDia();
  const precioTotal = precioPorDia * duracion;
  const igic = precioTotal * 0.07;
  const precioConIgic = precioTotal + igic;
  
  return {
    alquiler_id: null,
    vehiculo_id: vehiculoId,
    cliente_id: clienteId,
    fecha_inicio: fechaInicio.toISOString().split('T')[0],
    fecha_fin: fechaFin.toISOString().split('T')[0],
    precio_por_dia: precioPorDia,
    precio_total: precioTotal,
    igic: igic,
    precio_total_con_igic: precioConIgic,
    ubicacion_recogida: ubicacionesAlquiler[Math.floor(Math.random() * ubicacionesAlquiler.length)],
    ubicacion_devolucion: ubicacionesAlquiler[Math.floor(Math.random() * ubicacionesAlquiler.length)],
    estado: Math.random() > 0.2 ? 'ACTIVO' : 'COMPLETADO',
    notas: generarNotasAlquiler(vehiculo)
  };
}

// Generar notas de alquiler
function generarNotasAlquiler(vehiculo) {
  const notas = [
    `Cliente satisfecho con el ${vehiculo.marca} ${vehiculo.modelo}`,
    'Vehículo en perfecto estado al entregar',
    'Cliente con experiencia previa en alquiler',
    'Documentación completa entregada',
    'Seguro incluido en el alquiler',
    'Kilometraje ilimitado',
    'Cliente extranjero - documentación internacional',
    'Servicio de recogida en aeropuerto',
    'Vehículo ideal para turismo en la isla',
    'Cliente frecuente - descuento aplicado'
  ];
  
  return notas[Math.floor(Math.random() * notas.length)];
}

// Generar pago
function generarPago(alquilerId, alquiler) {
  const metodosPago = ['TARJETA_CREDITO', 'TARJETA_DEBITO', 'EFECTIVO', 'TRANSFERENCIA'];
  const metodo = metodosPago[Math.floor(Math.random() * metodosPago.length)];
  
  return {
    pago_id: null,
    alquiler_id: alquilerId,
    monto: alquiler.precio_total_con_igic,
    metodo_pago: metodo,
    fecha_pago: alquiler.fecha_inicio,
    estado: 'COMPLETADO',
    referencia: generarReferenciaPago()
  };
}

// Generar referencia de pago
function generarReferenciaPago() {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let referencia = '';
  for (let i = 0; i < 12; i++) {
    referencia += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return referencia;
}

// Generar seguro
function generarSeguro(vehiculoId) {
  const tipo = tiposSeguro[Math.floor(Math.random() * tiposSeguro.length)];
  const aseguradora = aseguradoras[Math.floor(Math.random() * aseguradoras.length)];
  const fechaInicio = new Date();
  const fechaFin = new Date(fechaInicio.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 año
  
  return {
    seguro_id: null,
    vehiculo_id: vehiculoId,
    compañia: aseguradora,
    poliza_numero: generarNumeroPoliza(),
    cobertura_desde: fechaInicio.toISOString().split('T')[0],
    cobertura_hasta: fechaFin.toISOString().split('T')[0],
    tipo_cobertura: tipo,
    created_at: new Date().toISOString()
  };
}

// Generar número de póliza
function generarNumeroPoliza() {
  const numeros = '0123456789';
  let poliza = '';
  for (let i = 0; i < 10; i++) {
    poliza += numeros.charAt(Math.floor(Math.random() * numeros.length));
  }
  return poliza;
}

// Generar reserva
function generarReserva(vehiculoId, clienteId, vehiculo) {
  const fechaReserva = new Date();
  const diasFuturos = Math.floor(Math.random() * 30) + 1; // 1-30 días en el futuro
  const fechaInicio = new Date(fechaReserva.getTime() + (diasFuturos * 24 * 60 * 60 * 1000));
  const duracion = generarDuracionAlquiler();
  const fechaFin = new Date(fechaInicio.getTime() + (duracion * 24 * 60 * 60 * 1000));
  
  return {
    reserva_id: null,
    vehiculo_id: vehiculoId,
    cliente_id: clienteId,
    fecha_reserva: fechaReserva.toISOString().split('T')[0],
    fecha_inicio: fechaInicio.toISOString().split('T')[0],
    fecha_fin: fechaFin.toISOString().split('T')[0],
    estado: Math.random() > 0.3 ? 'CONFIRMADA' : 'PENDIENTE',
    notas: `Reserva para ${vehiculo.marca} ${vehiculo.modelo}`
  };
}

async function generarCasosReales() {
  try {
    console.log('🚗 Generando casos reales para todos los vehículos...\n');
    
    // Limpiar tablas existentes
    await query('DELETE FROM pagos');
    await query('DELETE FROM alquileres');
    await query('DELETE FROM reservas');
    await query('DELETE FROM seguros_vehiculo');
    await query('DELETE FROM clientes');
    
    console.log('🧹 Tablas limpiadas');
    
    // Obtener todos los vehículos
    const vehiculos = await query('SELECT vehiculo_id, marca, modelo, matricula, estado FROM vehiculos ORDER BY vehiculo_id');
    console.log(`📊 Total de vehículos: ${vehiculos.rows.length}\n`);
    
    // Generar clientes adicionales
    const clientesExistentes = await query('SELECT COUNT(*) as total FROM clientes');
    const clientesNecesarios = Math.max(35, vehiculos.rows.length);
    
    for (let i = clientesExistentes.rows[0].total + 1; i <= clientesNecesarios; i++) {
      const cliente = generarCliente(i);
      await query(`
        INSERT INTO clientes (cliente_id, nombre, apellidos, dni_pasaporte, email, telefono)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [cliente.cliente_id, cliente.nombre, cliente.apellidos, cliente.dni_pasaporte, cliente.email, cliente.telefono]);
    }
    
    console.log(`✅ ${clientesNecesarios} clientes generados`);
    
    // Generar casos para cada vehículo
    let alquileresGenerados = 0;
    let reservasGeneradas = 0;
    let segurosGenerados = 0;
    let pagosGenerados = 0;
    
    for (const vehiculo of vehiculos.rows) {
      // Solo generar casos para vehículos disponibles o alquilados
      if (vehiculo.estado === 'disponible' || vehiculo.estado === 'alquilado') {
        
        // Generar alquiler (solo para vehículos alquilados)
        if (vehiculo.estado === 'alquilado') {
          const clienteId = Math.floor(Math.random() * clientesNecesarios) + 1;
          const alquiler = generarAlquiler(vehiculo.vehiculo_id, clienteId, vehiculo);
          
          await query(`
            INSERT INTO alquileres (
              vehiculo_id, cliente_id, fecha_inicio, fecha_fin, 
              precio_por_dia, precio_total, igic, precio_total_con_igic,
              ubicacion_recogida, ubicacion_devolucion, estado, notas
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
            )
          `, [
            alquiler.vehiculo_id, alquiler.cliente_id, alquiler.fecha_inicio, alquiler.fecha_fin,
            alquiler.precio_por_dia, alquiler.precio_total, alquiler.igic, alquiler.precio_total_con_igic,
            alquiler.ubicacion_recogida, alquiler.ubicacion_devolucion, alquiler.estado, alquiler.notas
          ]);
          
          // Generar pago para el alquiler
          const alquilerId = alquileresGenerados + 1;
          const pago = generarPago(alquilerId, alquiler);
          
          await query(`
            INSERT INTO pagos (
              alquiler_id, monto, metodo_pago, fecha_pago, estado, referencia
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `, [pago.alquiler_id, pago.monto, pago.metodo_pago, pago.fecha_pago, pago.estado, pago.referencia]);
          
          alquileresGenerados++;
          pagosGenerados++;
        }
        
        // Generar reserva (para algunos vehículos disponibles)
        if (vehiculo.estado === 'disponible' && Math.random() > 0.6) {
          const clienteId = Math.floor(Math.random() * clientesNecesarios) + 1;
          const reserva = generarReserva(vehiculo.vehiculo_id, clienteId, vehiculo);
          
          await query(`
            INSERT INTO reservas (
              vehiculo_id, cliente_id, fecha_reserva, fecha_inicio, fecha_fin, estado, notas
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            reserva.vehiculo_id, reserva.cliente_id, reserva.fecha_reserva,
            reserva.fecha_inicio, reserva.fecha_fin, reserva.estado, reserva.notas
          ]);
          
          reservasGeneradas++;
        }
      }
      
      // Generar seguro para todos los vehículos
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
      
      segurosGenerados++;
    }
    
    console.log('\n📈 Resumen de casos generados:');
    console.log(`   Alquileres: ${alquileresGenerados}`);
    console.log(`   Reservas: ${reservasGeneradas}`);
    console.log(`   Seguros: ${segurosGenerados}`);
    console.log(`   Pagos: ${pagosGenerados}`);
    console.log(`   Clientes: ${clientesNecesarios}`);
    
    // Mostrar estadísticas
    const estadisticas = await query(`
      SELECT 
        COUNT(CASE WHEN estado = 'disponible' THEN 1 END) as disponibles,
        COUNT(CASE WHEN estado = 'alquilado' THEN 1 END) as alquilados,
        COUNT(CASE WHEN estado = 'taller' THEN 1 END) as en_mantenimiento,
        COUNT(CASE WHEN estado = 'vendido' THEN 1 END) as vendidos
      FROM vehiculos
    `);
    
    const stats = estadisticas.rows[0];
    console.log('\n📊 Estado de la flota:');
    console.log(`   Disponibles: ${stats.disponibles}`);
    console.log(`   Alquilados: ${stats.alquilados}`);
    console.log(`   En Mantenimiento: ${stats.en_mantenimiento}`);
    console.log(`   Vendidos: ${stats.vendidos}`);
    
    console.log('\n✅ Casos reales generados exitosamente');
    
  } catch (error) {
    console.error('❌ Error generando casos reales:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generarCasosReales();
}

module.exports = { generarCasosReales }; 