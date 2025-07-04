const { query } = require('./database-pg');

async function borrarTablaCoches() {
  try {
    await query('DROP TABLE IF EXISTS coches CASCADE');
    console.log('✅ Tabla "coches" eliminada (si existía)');
  } catch (error) {
    console.error('❌ Error eliminando tabla coches:', error);
  }
}

async function obtenerTablas() {
  const result = await query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `);
  return result.rows.map(r => r.table_name);
}

async function poblarCategoriasVehiculo() {
  try {
    await query('DELETE FROM categorias_vehiculo');
    await query(`
      INSERT INTO categorias_vehiculo (categoria_id, nombre, capacidad_pasajeros, puertas) VALUES
      (1, 'Económico', 4, 5),
      (2, 'SUV', 5, 5),
      (3, 'Familiar', 7, 5),
      (4, 'Deportivo', 2, 3),
      (5, 'Compacto', 4, 3),
      (6, 'Lujo', 4, 4)
    `);
    console.log('✅ Categorías de vehículo insertadas');
  } catch (error) {
    console.error('❌ Error en categorias_vehiculo:', error);
  }
}

async function poblarUbicaciones() {
  try {
    await query('DELETE FROM ubicaciones');
    await query(`
      INSERT INTO ubicaciones (ubicacion_id, nombre) VALUES
      (1, 'Aeropuerto Tenerife Sur'),
      (2, 'Aeropuerto Tenerife Norte'),
      (3, 'Puerto de Santa Cruz'),
      (4, 'Centro Comercial Meridiano'),
      (5, 'Puerto de Los Cristianos'),
      (6, 'Centro de Las Palmas')
    `);
    console.log('✅ Ubicaciones insertadas');
  } catch (error) {
    console.error('❌ Error en ubicaciones:', error);
  }
}

async function poblarClientes() {
  try {
    await query('DELETE FROM clientes');
    await query(`
      INSERT INTO clientes (cliente_id, nombre, apellidos, dni_pasaporte, email, telefono) VALUES
      (1, 'María', 'González López', '12345678A', 'maria.gonzalez@email.com', '+34 600 123 456'),
      (2, 'Carlos', 'Rodríguez Martín', '87654321B', 'carlos.rodriguez@email.com', '+34 600 654 321'),
      (3, 'Ana', 'Fernández García', '11223344C', 'ana.fernandez@email.com', '+34 600 987 654'),
      (4, 'Luis', 'Martínez Pérez', '55667788D', 'luis.martinez@email.com', '+34 600 456 789'),
      (5, 'Sofia', 'López Jiménez', '99887766E', 'sofia.lopez@email.com', '+34 600 321 654'),
      (6, 'David', 'García Ruiz', '44332211F', 'david.garcia@email.com', '+34 600 789 123'),
      (7, 'Elena', 'Pérez Moreno', '66778899G', 'elena.perez@email.com', '+34 600 147 258'),
      (8, 'Javier', 'Sánchez Torres', '22334455H', 'javier.sanchez@email.com', '+34 600 369 258')
    `);
    console.log('✅ Clientes insertados');
  } catch (error) {
    console.error('❌ Error en clientes:', error);
  }
}

async function poblarUsuarios() {
  try {
    await query('DELETE FROM usuarios');
    await query(`
      INSERT INTO usuarios (usuario_id, nickname, password_hash, rol, activo, fecha_creacion) VALUES
      (1, 'admin', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6u', 'admin', true, '2024-01-01 08:00:00'),
      (2, 'operador1', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6u', 'operador', true, '2024-01-01 09:00:00'),
      (3, 'caja1', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6u', 'caja', true, '2024-01-01 10:00:00'),
      (4, 'lectura1', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6u', 'lectura', true, '2024-01-01 11:00:00')
    `);
    console.log('✅ Usuarios insertados');
  } catch (error) {
    console.error('❌ Error en usuarios:', error);
  }
}

async function poblarVehiculos() {
  try {
    await query('DELETE FROM vehiculos');
    await query(`
      INSERT INTO vehiculos (vehiculo_id, vin, matricula, marca, modelo, anio, color, fecha_matricula, fecha_compra, km_compra, km_actuales, transmision, condicion, precio_compra_base, igic_compra, precio_compra_total, precio_venta_base, igic_venta, precio_venta_total, estado, categoria_id, ubicacion_id) VALUES
      (1, '1HGBH41JXMN109186', '1234ABC', 'Toyota', 'Corolla', 2020, 'Blanco', '2020-03-15', '2020-03-20', 0, 45000, 'AUTOMATICO', 'NUEVO', 18000.00, 1800.00, 19800.00, 22000.00, 2200.00, 24200.00, 'disponible', 1, 1),
      (2, '2T1BURHE0JC123456', '5678DEF', 'Honda', 'CR-V', 2019, 'Negro', '2019-06-10', '2019-06-15', 0, 38000, 'AUTOMATICO', 'USADO', 25000.00, 2500.00, 27500.00, 32000.00, 3200.00, 35200.00, 'disponible', 2, 2),
      (3, '3VWDX7AJ5DM123456', '9012GHI', 'Volkswagen', 'Golf', 2021, 'Azul', '2021-01-20', '2021-01-25', 0, 25000, 'MANUAL', 'NUEVO', 20000.00, 2000.00, 22000.00, 26000.00, 2600.00, 28600.00, 'disponible', 5, 3),
      (4, '4T1B11HK5JU123456', '3456JKL', 'Toyota', 'Sienna', 2018, 'Gris', '2018-09-05', '2018-09-10', 0, 52000, 'AUTOMATICO', 'USADO', 28000.00, 2800.00, 30800.00, 35000.00, 3500.00, 38500.00, 'disponible', 3, 4),
      (5, '5NPE34AF2FH123456', '7890MNO', 'Hyundai', 'Veloster', 2022, 'Rojo', '2022-04-12', '2022-04-17', 0, 15000, 'MANUAL', 'NUEVO', 22000.00, 2200.00, 24200.00, 28000.00, 2800.00, 30800.00, 'disponible', 4, 5),
      (6, '6G1ZT51806L123456', '2345PQR', 'Chevrolet', 'Malibu', 2020, 'Plateado', '2020-07-30', '2020-08-05', 0, 35000, 'AUTOMATICO', 'NUEVO', 24000.00, 2400.00, 26400.00, 30000.00, 3000.00, 33000.00, 'disponible', 1, 6),
      (7, '7FARW2H85BE123456', '6789STU', 'Ford', 'Explorer', 2021, 'Negro', '2021-11-18', '2021-11-25', 0, 28000, 'AUTOMATICO', 'NUEVO', 35000.00, 3500.00, 38500.00, 42000.00, 4200.00, 46200.00, 'disponible', 2, 1),
      (8, '8XJDF4G22NL123456', '0123VWX', 'BMW', 'X5', 2022, 'Blanco', '2022-02-14', '2022-02-20', 0, 12000, 'AUTOMATICO', 'NUEVO', 55000.00, 5500.00, 60500.00, 70000.00, 7000.00, 77000.00, 'disponible', 6, 2)
    `);
    console.log('✅ Vehículos insertados');
  } catch (error) {
    console.error('❌ Error en vehiculos:', error);
  }
}

async function poblarTarifas() {
  try {
    await query('DELETE FROM tarifas');
    await query(`
      INSERT INTO tarifas (tarifa_id, categoria_id, fecha_inicio, fecha_fin, precio_dia, precio_km_extra) VALUES
      (1, 1, '2024-01-01', '2024-12-31', 45.00, 0.25),
      (2, 2, '2024-01-01', '2024-12-31', 65.00, 0.30),
      (3, 3, '2024-01-01', '2024-12-31', 75.00, 0.35),
      (4, 4, '2024-01-01', '2024-12-31', 85.00, 0.40),
      (5, 5, '2024-01-01', '2024-12-31', 55.00, 0.28),
      (6, 6, '2024-01-01', '2024-12-31', 120.00, 0.50)
    `);
    console.log('✅ Tarifas insertadas');
  } catch (error) {
    console.error('❌ Error en tarifas:', error);
  }
}

async function poblarReservas() {
  try {
    await query('DELETE FROM reservas');
    await query(`
      INSERT INTO reservas (reserva_id, cliente_id, vehiculo_id, categoria_id, fecha_reserva, fecha_recogida_prevista, fecha_devolucion_prevista, pickup_ubicacion_id, dropoff_ubicacion_id, estado_entrega, estado_devolucion) VALUES
      (1, 1, 1, 1, '2024-01-15 10:30:00', '2024-01-20 09:00:00', '2024-01-25 17:00:00', 1, 1, 'entregado', 'devuelto'),
      (2, 2, 2, 2, '2024-01-16 14:20:00', '2024-01-22 10:00:00', '2024-01-28 18:00:00', 2, 3, 'entregado', 'pendiente'),
      (3, 3, 3, 5, '2024-01-17 11:15:00', '2024-01-25 08:00:00', '2024-01-30 16:00:00', 3, 4, 'pendiente', 'pendiente'),
      (4, 4, 4, 3, '2024-01-18 16:45:00', '2024-01-26 09:00:00', '2024-02-02 17:00:00', 4, 5, 'pendiente', 'pendiente'),
      (5, 5, 5, 4, '2024-01-19 13:30:00', '2024-01-27 10:00:00', '2024-01-29 18:00:00', 5, 6, 'pendiente', 'pendiente')
    `);
    console.log('✅ Reservas insertadas');
  } catch (error) {
    console.error('❌ Error en reservas:', error);
  }
}

async function poblarAlquileres() {
  try {
    await query('DELETE FROM alquileres');
    await query(`
      INSERT INTO alquileres (alquiler_id, reserva_id, vehiculo_id, cliente_id, fecha_recogida_real, fecha_devolucion_real, pickup_ubicacion_id, dropoff_ubicacion_id, km_salida, nivel_combustible_salida, km_entrada, nivel_combustible_entrada, estado) VALUES
      (1, 1, 1, 1, '2024-01-20 09:15:00', '2024-01-25 17:30:00', 1, 1, 45000, 85, 46500, 75, 'cerrado'),
      (2, 2, 2, 2, '2024-01-22 10:30:00', NULL, 2, 3, 38000, 90, NULL, NULL, 'abierto')
    `);
    console.log('✅ Alquileres insertados');
  } catch (error) {
    console.error('❌ Error en alquileres:', error);
  }
}

async function poblarPagos() {
  try {
    await query('DELETE FROM pagos');
    await query(`
      INSERT INTO pagos (pago_id, alquiler_id, fecha_pago, monto, metodo) VALUES
      (1, 1, '2024-01-20 09:30:00', 225.00, 'tarjeta'),
      (2, 2, '2024-01-22 11:00:00', 390.00, 'efectivo')
    `);
    console.log('✅ Pagos insertados');
  } catch (error) {
    console.error('❌ Error en pagos:', error);
  }
}

async function poblarMantenimientos() {
  try {
    await query('DELETE FROM mantenimientos');
    await query(`
      INSERT INTO mantenimientos (mantenimiento_id, vehiculo_id, fecha_servicio, km_servicio, descripcion, coste, proveedor, proximo_servicio_km) VALUES
      (1, 1, '2024-01-10', 44000, 'Cambio de aceite y filtros', 120.00, 'Taller Central', 49000),
      (2, 2, '2024-01-12', 37000, 'Revisión general y frenos', 180.00, 'Taller Norte', 42000),
      (3, 3, '2024-01-08', 24000, 'Cambio de aceite', 95.00, 'Taller Sur', 29000),
      (4, 4, '2024-01-15', 51000, 'Cambio de correa y aceite', 250.00, 'Taller Este', 56000)
    `);
    console.log('✅ Mantenimientos insertados');
  } catch (error) {
    console.error('❌ Error en mantenimientos:', error);
  }
}

async function poblarSegurosVehiculo() {
  try {
    await query('DELETE FROM seguros_vehiculo');
    await query(`
      INSERT INTO seguros_vehiculo (seguro_id, vehiculo_id, compañia, poliza_numero, cobertura_desde, cobertura_hasta, tipo_cobertura) VALUES
      (1, 1, 'Mapfre', 'MAP-2024-001', '2024-01-01', '2024-12-31', 'Todo riesgo'),
      (2, 2, 'Allianz', 'ALL-2024-002', '2024-01-01', '2024-12-31', 'Todo riesgo'),
      (3, 3, 'Liberty', 'LIB-2024-003', '2024-01-01', '2024-12-31', 'Terceros'),
      (4, 4, 'AXA', 'AXA-2024-004', '2024-01-01', '2024-12-31', 'Todo riesgo'),
      (5, 5, 'Generali', 'GEN-2024-005', '2024-01-01', '2024-12-31', 'Terceros'),
      (6, 6, 'Mapfre', 'MAP-2024-006', '2024-01-01', '2024-12-31', 'Todo riesgo'),
      (7, 7, 'Allianz', 'ALL-2024-007', '2024-01-01', '2024-12-31', 'Todo riesgo'),
      (8, 8, 'Liberty', 'LIB-2024-008', '2024-01-01', '2024-12-31', 'Todo riesgo')
    `);
    console.log('✅ Seguros de vehículo insertados');
  } catch (error) {
    console.error('❌ Error en seguros_vehiculo:', error);
  }
}

async function main() {
  console.log('🚀 Iniciando población de base de datos...\n');
  
  // Poblar en orden de dependencias
  await poblarCategoriasVehiculo();
  await poblarUbicaciones();
  await poblarClientes();
  await poblarUsuarios();
  await poblarVehiculos();
  await poblarTarifas();
  await poblarReservas();
  await poblarAlquileres();
  await poblarPagos();
  await poblarMantenimientos();
  await poblarSegurosVehiculo();
  
  console.log('\n✅ ¡Base de datos poblada completamente!');
  process.exit(0);
}

main(); 