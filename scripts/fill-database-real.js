const { query } = require('../src/config/database');

async function fillDatabaseReal() {
  try {
    console.log('🚀 Rellenando base de datos con datos reales...\n');
    
    // 1. INSERTAR UBICACIONES
    console.log('📍 Insertando ubicaciones...');
    const ubicaciones = [
      { nombre: 'Aeropuerto Tenerife Sur', direccion: 'Aeropuerto Tenerife Sur, 38610 Granadilla de Abona' },
      { nombre: 'Aeropuerto Tenerife Norte', direccion: 'Aeropuerto Tenerife Norte, 38297 San Cristóbal de La Laguna' },
      { nombre: 'Puerto de Santa Cruz', direccion: 'Puerto de Santa Cruz de Tenerife, 38001 Santa Cruz de Tenerife' },
      { nombre: 'Puerto de Los Cristianos', direccion: 'Puerto de Los Cristianos, 38650 Arona' },
      { nombre: 'Centro Comercial Meridiano', direccion: 'Centro Comercial Meridiano, 38003 Santa Cruz de Tenerife' },
      { nombre: 'Centro Comercial Siam Mall', direccion: 'Centro Comercial Siam Mall, 38660 Adeje' },
      { nombre: 'Estación de Guaguas Santa Cruz', direccion: 'Estación de Guaguas, 38001 Santa Cruz de Tenerife' },
      { nombre: 'Estación de Guaguas La Laguna', direccion: 'Estación de Guaguas, 38201 San Cristóbal de La Laguna' }
    ];
    
    for (const ubicacion of ubicaciones) {
      await query('INSERT INTO ubicaciones (nombre) VALUES ($1)', 
        [ubicacion.nombre]);
    }
    console.log(`✅ ${ubicaciones.length} ubicaciones insertadas`);
    
    // 2. INSERTAR CATEGORÍAS DE VEHÍCULOS
    console.log('\n🚗 Insertando categorías de vehículos...');
    const categorias = [
      { nombre: 'Económico', descripcion: 'Vehículos compactos y económicos', precio_base: 25 },
      { nombre: 'Compacto', descripcion: 'Vehículos compactos familiares', precio_base: 35 },
      { nombre: 'Intermedio', descripcion: 'Vehículos intermedios confortables', precio_base: 45 },
      { nombre: 'Superior', descripcion: 'Vehículos superiores de alta gama', precio_base: 65 },
      { nombre: 'Premium', descripcion: 'Vehículos premium de lujo', precio_base: 85 },
      { nombre: 'SUV', descripcion: 'Vehículos SUV todoterreno', precio_base: 55 },
      { nombre: 'Van/Minivan', descripcion: 'Vehículos van y minivan', precio_base: 50 }
    ];
    
    for (const categoria of categorias) {
      await query('INSERT INTO categorias_vehiculo (nombre, capacidad_pasajeros, puertas) VALUES ($1, $2, $3)', 
        [categoria.nombre, categoria.capacidad_pasajeros || 5, categoria.puertas || 4]);
    }
    console.log(`✅ ${categorias.length} categorías insertadas`);
    
    // 3. INSERTAR CLIENTES
    console.log('\n👥 Insertando clientes...');
    const clientes = [
      { nombre: 'María', apellidos: 'García López', dni: '12345678A', email: 'maria.garcia@email.com', telefono: '612345678', direccion: 'Calle Mayor 123, Santa Cruz' },
      { nombre: 'Juan', apellidos: 'Rodríguez Martín', dni: '23456789B', email: 'juan.rodriguez@email.com', telefono: '623456789', direccion: 'Avenida Libertad 45, La Laguna' },
      { nombre: 'Ana', apellidos: 'Fernández Pérez', dni: '34567890C', email: 'ana.fernandez@email.com', telefono: '634567890', direccion: 'Calle Real 67, Los Cristianos' },
      { nombre: 'Carlos', apellidos: 'López González', dni: '45678901D', email: 'carlos.lopez@email.com', telefono: '645678901', direccion: 'Plaza España 89, Adeje' },
      { nombre: 'Laura', apellidos: 'Martínez Ruiz', dni: '56789012E', email: 'laura.martinez@email.com', telefono: '656789012', direccion: 'Calle del Mar 12, Puerto de la Cruz' },
      { nombre: 'Pedro', apellidos: 'Sánchez Moreno', dni: '67890123F', email: 'pedro.sanchez@email.com', telefono: '667890123', direccion: 'Avenida Marítima 34, Los Gigantes' },
      { nombre: 'Isabel', apellidos: 'Jiménez Torres', dni: '78901234G', email: 'isabel.jimenez@email.com', telefono: '678901234', direccion: 'Calle San Francisco 56, Garachico' },
      { nombre: 'Miguel', apellidos: 'Hernández Vega', dni: '89012345H', email: 'miguel.hernandez@email.com', telefono: '689012345', direccion: 'Plaza del Ayuntamiento 78, Icod' },
      { nombre: 'Carmen', apellidos: 'Díaz Castro', dni: '90123456I', email: 'carmen.diaz@email.com', telefono: '690123456', direccion: 'Calle La Orotava 90, La Orotava' },
      { nombre: 'Francisco', apellidos: 'Alonso Morales', dni: '01234567J', email: 'francisco.alonso@email.com', telefono: '601234567', direccion: 'Avenida de Canarias 23, Candelaria' }
    ];
    
    for (const cliente of clientes) {
      await query('INSERT INTO clientes (nombre, apellidos, dni_pasaporte, email, telefono) VALUES ($1, $2, $3, $4, $5)', 
        [cliente.nombre, cliente.apellidos, cliente.dni, cliente.email, cliente.telefono]);
    }
    console.log(`✅ ${clientes.length} clientes insertados`);
    
    // 4. INSERTAR VEHÍCULOS
    console.log('\n🚙 Insertando vehículos...');
    const vehiculos = [
      // Económicos
      { marca: 'Renault', modelo: 'Clio', anio: 2021, matricula: '1234ABC', color: 'Blanco', vin: 'VF1R0F00000000001', km_actuales: 15000, transmision: 'MANUAL', condicion: 'NUEVO', grupo: 'A', categoria_id: 1, ubicacion_id: 1 },
      { marca: 'Ford', modelo: 'Fiesta', anio: 2020, matricula: '5678DEF', color: 'Azul', vin: 'WF0AXXGAF12345678', km_actuales: 22000, transmision: 'MANUAL', condicion: 'USADO', grupo: 'A', categoria_id: 1, ubicacion_id: 2 },
      { marca: 'Volkswagen', modelo: 'Polo', anio: 2022, matricula: '9012GHI', color: 'Gris', vin: 'WVWZZZ6RZ12345678', km_actuales: 8000, transmision: 'MANUAL', condicion: 'NUEVO', grupo: 'A', categoria_id: 1, ubicacion_id: 3 },
      
      // Compactos
      { marca: 'Volkswagen', modelo: 'Golf', anio: 2021, matricula: '3456JKL', color: 'Negro', vin: 'WVWZZZ1KZ12345678', km_actuales: 18000, transmision: 'AUTOMATICO', condicion: 'USADO', grupo: 'B', categoria_id: 2, ubicacion_id: 4 },
      { marca: 'Audi', modelo: 'A3', anio: 2022, matricula: '7890MNO', color: 'Blanco', vin: 'WAUZZZ8VZ12345678', km_actuales: 12000, transmision: 'AUTOMATICO', condicion: 'NUEVO', grupo: 'B', categoria_id: 2, ubicacion_id: 5 },
      { marca: 'BMW', modelo: 'Serie 1', anio: 2021, matricula: '2345PQR', color: 'Azul', vin: 'WBA1A51012345678', km_actuales: 25000, transmision: 'AUTOMATICO', condicion: 'USADO', grupo: 'B', categoria_id: 2, ubicacion_id: 6 },
      
      // Intermedios
      { marca: 'BMW', modelo: 'Serie 3', anio: 2022, matricula: '6789STU', color: 'Negro', vin: 'WBA3A51012345678', km_actuales: 15000, transmision: 'AUTOMATICO', condicion: 'NUEVO', grupo: 'C', categoria_id: 3, ubicacion_id: 7 },
      { marca: 'Mercedes', modelo: 'Clase C', anio: 2021, matricula: '0123VWX', color: 'Gris', vin: 'WDDWF4HB12345678', km_actuales: 28000, transmision: 'AUTOMATICO', condicion: 'USADO', grupo: 'C', categoria_id: 3, ubicacion_id: 8 },
      { marca: 'Audi', modelo: 'A4', anio: 2022, matricula: '4567YZA', color: 'Blanco', vin: 'WAUZZZ8E12345678', km_actuales: 10000, transmision: 'AUTOMATICO', condicion: 'NUEVO', grupo: 'C', categoria_id: 3, ubicacion_id: 1 },
      
      // Superiores
      { marca: 'BMW', modelo: 'Serie 5', anio: 2022, matricula: '8901BCD', color: 'Negro', vin: 'WBA5A51012345678', km_actuales: 12000, transmision: 'AUTOMATICO', condicion: 'NUEVO', grupo: 'D', categoria_id: 4, ubicacion_id: 2 },
      { marca: 'Mercedes', modelo: 'Clase E', anio: 2021, matricula: '2345EFG', color: 'Gris', vin: 'WDDWF4HB12345678', km_actuales: 22000, transmision: 'AUTOMATICO', condicion: 'USADO', grupo: 'D', categoria_id: 4, ubicacion_id: 3 },
      
      // Premium
      { marca: 'BMW', modelo: 'Serie 7', anio: 2022, matricula: '6789HIJ', color: 'Negro', vin: 'WBA7A51012345678', km_actuales: 8000, transmision: 'AUTOMATICO', condicion: 'NUEVO', grupo: 'E', categoria_id: 5, ubicacion_id: 4 },
      { marca: 'Mercedes', modelo: 'Clase S', anio: 2021, matricula: '0123KLM', color: 'Blanco', vin: 'WDDWF4HB12345678', km_actuales: 15000, transmision: 'AUTOMATICO', condicion: 'USADO', grupo: 'E', categoria_id: 5, ubicacion_id: 5 },
      
      // SUV
      { marca: 'BMW', modelo: 'X3', anio: 2022, matricula: '4567NOP', color: 'Azul', vin: 'WBAX3A51012345678', km_actuales: 10000, transmision: 'AUTOMATICO', condicion: 'NUEVO', grupo: 'F', categoria_id: 6, ubicacion_id: 6 },
      { marca: 'Audi', modelo: 'Q5', anio: 2021, matricula: '8901QRS', color: 'Gris', vin: 'WAUZZZ8E12345678', km_actuales: 25000, transmision: 'AUTOMATICO', condicion: 'USADO', grupo: 'F', categoria_id: 6, ubicacion_id: 7 },
      { marca: 'Volkswagen', modelo: 'Tiguan', anio: 2022, matricula: '2345TUV', color: 'Blanco', vin: 'WVGZZZ5NZ12345678', km_actuales: 12000, transmision: 'AUTOMATICO', condicion: 'NUEVO', grupo: 'F', categoria_id: 6, ubicacion_id: 8 },
      
      // Van/Minivan
      { marca: 'Volkswagen', modelo: 'Caddy', anio: 2021, matricula: '6789WXY', color: 'Blanco', vin: 'WVGZZZ7NZ12345678', km_actuales: 18000, transmision: 'MANUAL', condicion: 'USADO', grupo: 'G', categoria_id: 7, ubicacion_id: 1 },
      { marca: 'Ford', modelo: 'Transit', anio: 2022, matricula: '0123ZAB', color: 'Gris', vin: 'WF0AXXGAF12345678', km_actuales: 8000, transmision: 'MANUAL', condicion: 'NUEVO', grupo: 'G', categoria_id: 7, ubicacion_id: 2 }
    ];
    
    for (const vehiculo of vehiculos) {
      await query(`
        INSERT INTO vehiculos (vin, matricula, marca, modelo, anio, color, fecha_matricula, fecha_compra, km_compra, km_actuales, transmision, condicion, precio_compra_base, precio_compra_total, precio_venta_base, precio_venta_total, estado, categoria_id, ubicacion_id, grupo)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE - INTERVAL '1 year', CURRENT_DATE - INTERVAL '1 year', $7 - 5000, $7, $8, $9, $10 * 0.7, $10 * 0.7 * 1.07, $10, $10 * 1.07, 'disponible', $11, $12, $13)
      `, [
        vehiculo.vin, vehiculo.matricula, vehiculo.marca, vehiculo.modelo, vehiculo.anio, vehiculo.color,
        vehiculo.km_actuales, vehiculo.transmision, vehiculo.condicion, 
        categorias[vehiculo.categoria_id - 1].precio_base, vehiculo.categoria_id, vehiculo.ubicacion_id, vehiculo.grupo
      ]);
    }
    console.log(`✅ ${vehiculos.length} vehículos insertados`);
    
    // 5. INSERTAR RESERVAS
    console.log('\n📅 Insertando reservas...');
    const reservas = [
      { cliente_id: 1, vehiculo_id: 1, categoria_id: 1, fecha_recogida: '2024-01-15 10:00:00', fecha_devolucion: '2024-01-20 18:00:00', pickup_id: 1, dropoff_id: 2 },
      { cliente_id: 2, vehiculo_id: 4, categoria_id: 2, fecha_recogida: '2024-01-16 09:00:00', fecha_devolucion: '2024-01-18 17:00:00', pickup_id: 2, dropoff_id: 1 },
      { cliente_id: 3, vehiculo_id: 7, categoria_id: 3, fecha_recogida: '2024-01-17 11:00:00', fecha_devolucion: '2024-01-22 19:00:00', pickup_id: 3, dropoff_id: 4 },
      { cliente_id: 4, vehiculo_id: 10, categoria_id: 4, fecha_recogida: '2024-01-18 08:00:00', fecha_devolucion: '2024-01-21 16:00:00', pickup_id: 4, dropoff_id: 3 },
      { cliente_id: 5, vehiculo_id: 12, categoria_id: 5, fecha_recogida: '2024-01-19 12:00:00', fecha_devolucion: '2024-01-25 20:00:00', pickup_id: 5, dropoff_id: 6 },
      { cliente_id: 6, vehiculo_id: 14, categoria_id: 6, fecha_recogida: '2024-01-20 10:30:00', fecha_devolucion: '2024-01-23 18:30:00', pickup_id: 6, dropoff_id: 5 },
      { cliente_id: 7, vehiculo_id: 16, categoria_id: 7, fecha_recogida: '2024-01-21 09:30:00', fecha_devolucion: '2024-01-24 17:30:00', pickup_id: 7, dropoff_id: 8 },
      { cliente_id: 8, vehiculo_id: 2, categoria_id: 1, fecha_recogida: '2024-01-22 11:30:00', fecha_devolucion: '2024-01-26 19:30:00', pickup_id: 8, dropoff_id: 1 },
      { cliente_id: 9, vehiculo_id: 5, categoria_id: 2, fecha_recogida: '2024-01-23 08:30:00', fecha_devolucion: '2024-01-27 16:30:00', pickup_id: 1, dropoff_id: 2 },
      { cliente_id: 10, vehiculo_id: 8, categoria_id: 3, fecha_recogida: '2024-01-24 12:30:00', fecha_devolucion: '2024-01-28 20:30:00', pickup_id: 2, dropoff_id: 3 }
    ];
    
    for (const reserva of reservas) {
      await query(`
        INSERT INTO reservas (cliente_id, vehiculo_id, categoria_id, fecha_reserva, fecha_recogida_prevista, fecha_devolucion_prevista, pickup_ubicacion_id, dropoff_ubicacion_id, estado_entrega, estado_devolucion)
        VALUES ($1, $2, $3, CURRENT_DATE - INTERVAL '2 days', $4, $5, $6, $7, 'pendiente', 'pendiente')
      `, [reserva.cliente_id, reserva.vehiculo_id, reserva.categoria_id, reserva.fecha_recogida, reserva.fecha_devolucion, reserva.pickup_id, reserva.dropoff_id]);
    }
    console.log(`✅ ${reservas.length} reservas insertadas`);
    
    // 6. INSERTAR ALQUILERES (algunos con reserva_id, otros sin)
    console.log('\n🚗 Insertando alquileres...');
    const alquileres = [
      // Alquileres con reserva_id (desde reservas)
      { vehiculo_id: 1, cliente_id: 1, reserva_id: 1, fecha_recogida: '2024-01-15 10:00:00', fecha_devolucion: '2024-01-20 18:00:00', pickup_id: 1, dropoff_id: 2, km_salida: 15000, km_entrada: 15800, estado: 'cerrado', ingreso_final: 125.00 },
      { vehiculo_id: 4, cliente_id: 2, reserva_id: 2, fecha_recogida: '2024-01-16 09:00:00', fecha_devolucion: '2024-01-18 17:00:00', pickup_id: 2, dropoff_id: 1, km_salida: 18000, km_entrada: 18500, estado: 'cerrado', ingreso_final: 70.00 },
      { vehiculo_id: 7, cliente_id: 3, reserva_id: 3, fecha_recogida: '2024-01-17 11:00:00', fecha_devolucion: '2024-01-22 19:00:00', pickup_id: 3, dropoff_id: 4, km_salida: 15000, km_entrada: 16200, estado: 'cerrado', ingreso_final: 225.00 },
      { vehiculo_id: 10, cliente_id: 4, reserva_id: 4, fecha_recogida: '2024-01-18 08:00:00', fecha_devolucion: '2024-01-21 16:00:00', pickup_id: 4, dropoff_id: 3, km_salida: 12000, km_entrada: 12800, estado: 'cerrado', ingreso_final: 195.00 },
      { vehiculo_id: 12, cliente_id: 5, reserva_id: 5, fecha_recogida: '2024-01-19 12:00:00', fecha_devolucion: '2024-01-25 20:00:00', pickup_id: 5, dropoff_id: 6, km_salida: 8000, km_entrada: 9200, estado: 'cerrado', ingreso_final: 510.00 },
      
      // Alquileres sin reserva_id (directos)
      { vehiculo_id: 14, cliente_id: 6, reserva_id: null, fecha_recogida: '2024-01-20 10:30:00', fecha_devolucion: '2024-01-23 18:30:00', pickup_id: 6, dropoff_id: 5, km_salida: 25000, km_entrada: 25800, estado: 'cerrado', ingreso_final: 165.00 },
      { vehiculo_id: 16, cliente_id: 7, reserva_id: null, fecha_recogida: '2024-01-21 09:30:00', fecha_devolucion: '2024-01-24 17:30:00', pickup_id: 7, dropoff_id: 8, km_salida: 18000, km_entrada: 18800, estado: 'cerrado', ingreso_final: 150.00 },
      { vehiculo_id: 2, cliente_id: 8, reserva_id: null, fecha_recogida: '2024-01-22 11:30:00', fecha_devolucion: '2024-01-26 19:30:00', pickup_id: 8, dropoff_id: 1, km_salida: 22000, km_entrada: 23200, estado: 'cerrado', ingreso_final: 100.00 },
      { vehiculo_id: 5, cliente_id: 9, reserva_id: null, fecha_recogida: '2024-01-23 08:30:00', fecha_devolucion: '2024-01-27 16:30:00', pickup_id: 1, dropoff_id: 2, km_salida: 12000, km_entrada: 12800, estado: 'cerrado', ingreso_final: 140.00 },
      { vehiculo_id: 8, cliente_id: 10, reserva_id: null, fecha_recogida: '2024-01-24 12:30:00', fecha_devolucion: '2024-01-28 20:30:00', pickup_id: 2, dropoff_id: 3, km_salida: 28000, km_entrada: 29200, estado: 'cerrado', ingreso_final: 180.00 },
      
      // Alquileres activos (abiertos)
      { vehiculo_id: 3, cliente_id: 1, reserva_id: null, fecha_recogida: '2024-01-25 10:00:00', fecha_devolucion: null, pickup_id: 3, dropoff_id: 4, km_salida: 8000, km_entrada: null, estado: 'abierto', ingreso_final: null },
      { vehiculo_id: 6, cliente_id: 2, reserva_id: null, fecha_recogida: '2024-01-26 09:00:00', fecha_devolucion: null, pickup_id: 4, dropoff_id: 5, km_salida: 12000, km_entrada: null, estado: 'abierto', ingreso_final: null },
      { vehiculo_id: 9, cliente_id: 3, reserva_id: null, fecha_recogida: '2024-01-27 11:00:00', fecha_devolucion: null, pickup_id: 5, dropoff_id: 6, km_salida: 10000, km_entrada: null, estado: 'abierto', ingreso_final: null },
      { vehiculo_id: 11, cliente_id: 4, reserva_id: null, fecha_recogida: '2024-01-28 08:00:00', fecha_devolucion: null, pickup_id: 6, dropoff_id: 7, km_salida: 22000, km_entrada: null, estado: 'abierto', ingreso_final: null },
      { vehiculo_id: 13, cliente_id: 5, reserva_id: null, fecha_recogida: '2024-01-29 12:00:00', fecha_devolucion: null, pickup_id: 7, dropoff_id: 8, km_salida: 15000, km_entrada: null, estado: 'abierto', ingreso_final: null },
      { vehiculo_id: 15, cliente_id: 6, reserva_id: null, fecha_recogida: '2024-01-30 10:30:00', fecha_devolucion: null, pickup_id: 8, dropoff_id: 1, km_salida: 25000, km_entrada: null, estado: 'abierto', ingreso_final: null },
      { vehiculo_id: 17, cliente_id: 7, reserva_id: null, fecha_recogida: '2024-01-31 09:30:00', fecha_devolucion: null, pickup_id: 1, dropoff_id: 2, km_salida: 8000, km_entrada: null, estado: 'abierto', ingreso_final: null }
    ];
    
    for (const alquiler of alquileres) {
      await query(`
        INSERT INTO alquileres (vehiculo_id, cliente_id, reserva_id, fecha_recogida_real, fecha_devolucion_real, pickup_ubicacion_id, dropoff_ubicacion_id, km_salida, km_entrada, estado, nivel_combustible_salida, nivel_combustible_entrada, precio_por_dia, total_dias, ingreso_total, descuento_aplicado, ingreso_final, metodo_pago)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, '3/4', $11, $12, $13, $14, $15, $16, $17)
      `, [
        alquiler.vehiculo_id, alquiler.cliente_id, alquiler.reserva_id, alquiler.fecha_recogida, alquiler.fecha_devolucion,
        alquiler.pickup_id, alquiler.dropoff_id, alquiler.km_salida, alquiler.km_entrada, alquiler.estado,
        alquiler.estado === 'cerrado' ? '1/2' : null,
        alquiler.estado === 'cerrado' ? 35 : null,
        alquiler.estado === 'cerrado' ? 5 : null,
        alquiler.estado === 'cerrado' ? alquiler.ingreso_final * 0.9 : null,
        alquiler.estado === 'cerrado' ? alquiler.ingreso_final * 0.1 : null,
        alquiler.ingreso_final,
        alquiler.estado === 'cerrado' ? 'Tarjeta' : null
      ]);
    }
    console.log(`✅ ${alquileres.length} alquileres insertados`);
    
    // 7. ACTUALIZAR ESTADOS DE VEHÍCULOS
    console.log('\n🔄 Actualizando estados de vehículos...');
    await query(`UPDATE vehiculos SET estado = 'alquilado' WHERE vehiculo_id IN (3, 6, 9, 11, 13, 15, 17)`);
    await query(`UPDATE vehiculos SET estado = 'reservado' WHERE vehiculo_id IN (2, 5, 8)`);
    console.log('✅ Estados de vehículos actualizados');
    
    // 8. INSERTAR MANTENIMIENTOS
    console.log('\n🔧 Insertando mantenimientos...');
    const mantenimientos = [
      { vehiculo_id: 1, fecha_servicio: '2024-01-10', km_servicio: 15000, descripcion: 'Cambio de aceite y filtros', coste: 120.00, proveedor: 'Taller BMW Santa Cruz', proximo_servicio_km: 20000 },
      { vehiculo_id: 4, fecha_servicio: '2024-01-12', km_servicio: 18000, descripcion: 'Revisión general y frenos', coste: 200.00, proveedor: 'Taller Volkswagen La Laguna', proximo_servicio_km: 25000 },
      { vehiculo_id: 7, fecha_servicio: '2024-01-14', km_servicio: 15000, descripcion: 'Cambio de neumáticos', coste: 400.00, proveedor: 'Taller BMW Los Cristianos', proximo_servicio_km: 22000 }
    ];
    
    for (const mantenimiento of mantenimientos) {
      await query(`
        INSERT INTO mantenimientos (vehiculo_id, fecha_servicio, km_servicio, descripcion, coste, proveedor, proximo_servicio_km)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [mantenimiento.vehiculo_id, mantenimiento.fecha_servicio, mantenimiento.km_servicio, mantenimiento.descripcion, mantenimiento.coste, mantenimiento.proveedor, mantenimiento.proximo_servicio_km]);
    }
    console.log(`✅ ${mantenimientos.length} mantenimientos insertados`);
    
    // 9. INSERTAR VENTAS
    console.log('\n💰 Insertando ventas...');
    const ventas = [
      { vehiculo_id: 1, fecha_venta: '2024-01-30', monto_venta: 18000.00, metodo_pago: 'Transferencia bancaria', cliente_nombre: 'Carlos', cliente_apellidos: 'López González', cliente_dni: '45678901D', cliente_email: 'carlos.lopez@email.com', cliente_telefono: '645678901', cliente_direccion: 'Plaza España 89, Adeje', notas: 'Venta directa sin intermediarios' }
    ];
    
    for (const venta of ventas) {
      await query(`
        INSERT INTO ventas (vehiculo_id, fecha_venta, monto_venta, metodo_pago, cliente_nombre, cliente_apellidos, cliente_dni, cliente_email, cliente_telefono, cliente_direccion, notas)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [venta.vehiculo_id, venta.fecha_venta, venta.monto_venta, venta.metodo_pago, venta.cliente_nombre, venta.cliente_apellidos, venta.cliente_dni, venta.cliente_email, venta.cliente_telefono, venta.cliente_direccion, venta.notas]);
    }
    console.log(`✅ ${ventas.length} ventas insertadas`);
    
    // 10. ACTUALIZAR ESTADO DE VEHÍCULOS VENDIDOS
    await query(`UPDATE vehiculos SET estado = 'vendido' WHERE vehiculo_id = 1`);
    
    console.log('\n🎉 ¡Base de datos rellenada exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   - ${ubicaciones.length} ubicaciones`);
    console.log(`   - ${categorias.length} categorías`);
    console.log(`   - ${clientes.length} clientes`);
    console.log(`   - ${vehiculos.length} vehículos`);
    console.log(`   - ${reservas.length} reservas`);
    console.log(`   - ${alquileres.length} alquileres`);
    console.log(`   - ${mantenimientos.length} mantenimientos`);
    console.log(`   - ${ventas.length} ventas`);
    
  } catch (error) {
    console.error('❌ Error rellenando la base de datos:', error.message);
  } finally {
    process.exit(0);
  }
}

fillDatabaseReal(); 