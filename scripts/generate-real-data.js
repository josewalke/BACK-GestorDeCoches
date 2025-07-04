require('dotenv').config();
const { query } = require('./database-pg');
const bcrypt = require('bcrypt');

// Datos realistas para la flota
const marcasModelos = [
  { marca: 'Toyota', modelos: ['Corolla', 'Camry', 'RAV4', 'Hilux', 'Yaris', 'Auris'] },
  { marca: 'Honda', modelos: ['Civic', 'CR-V', 'Accord', 'Jazz', 'HR-V'] },
  { marca: 'Ford', modelos: ['Focus', 'Mondeo', 'Kuga', 'Fiesta', 'Transit'] },
  { marca: 'Volkswagen', modelos: ['Golf', 'Passat', 'Tiguan', 'Polo', 'Caddy'] },
  { marca: 'BMW', modelos: ['Serie 3', 'Serie 5', 'X3', 'X5', 'Serie 1'] },
  { marca: 'Mercedes', modelos: ['Clase A', 'Clase C', 'Clase E', 'GLA', 'GLC'] },
  { marca: 'Audi', modelos: ['A3', 'A4', 'A6', 'Q3', 'Q5'] },
  { marca: 'Hyundai', modelos: ['i30', 'Tucson', 'Santa Fe', 'i20', 'Kona'] },
  { marca: 'Kia', modelos: ['Ceed', 'Sportage', 'Sorento', 'Picanto', 'Niro'] },
  { marca: 'Nissan', modelos: ['Qashqai', 'Juke', 'Micra', 'X-Trail', 'Leaf'] }
];

const colores = ['Blanco', 'Negro', 'Gris', 'Azul', 'Rojo', 'Plateado', 'Verde', 'Amarillo'];
const ubicaciones = [
  { id: 1, nombre: 'Aeropuerto Tenerife Sur' },
  { id: 2, nombre: 'Aeropuerto Tenerife Norte' },
  { id: 3, nombre: 'Puerto de Santa Cruz' },
  { id: 4, nombre: 'Centro Comercial Meridiano' },
  { id: 5, nombre: 'Puerto de Los Cristianos' },
  { id: 6, nombre: 'Centro de Las Palmas' }
];

const categorias = [
  { id: 1, nombre: 'Económico', capacidad: 4, puertas: 5 },
  { id: 2, nombre: 'SUV', capacidad: 5, puertas: 5 },
  { id: 3, nombre: 'Familiar', capacidad: 7, puertas: 5 },
  { id: 4, nombre: 'Deportivo', capacidad: 2, puertas: 3 },
  { id: 5, nombre: 'Compacto', capacidad: 4, puertas: 3 },
  { id: 6, nombre: 'Lujo', capacidad: 4, puertas: 4 }
];

// Generar VIN único
function generarVIN() {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let vin = '';
  for (let i = 0; i < 17; i++) {
    vin += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return vin;
}

// Generar matrícula española
function generarMatricula() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeros = '0123456789';
  let matricula = '';
  
  // Formato: 1234ABC
  for (let i = 0; i < 4; i++) {
    matricula += numeros.charAt(Math.floor(Math.random() * numeros.length));
  }
  for (let i = 0; i < 3; i++) {
    matricula += letras.charAt(Math.floor(Math.random() * letras.length));
  }
  
  return matricula;
}

// Generar precio realista
function generarPrecios() {
  const precioBase = Math.floor(Math.random() * 30000) + 15000; // 15k-45k
  const igic = precioBase * 0.07; // 7% IGIC
  const precioTotal = precioBase + igic;
  
  const precioVentaBase = precioBase * (1 + Math.random() * 0.3 + 0.1); // 10-40% markup
  const igicVenta = precioVentaBase * 0.07;
  const precioVentaTotal = precioVentaBase + igicVenta;
  
  return {
    precio_compra_base: precioBase,
    igic_compra: igic,
    precio_compra_total: precioTotal,
    precio_venta_base: precioVentaBase,
    igic_venta: igicVenta,
    precio_venta_total: precioVentaTotal
  };
}

// Generar fechas realistas
function generarFechas() {
  const fechaActual = new Date();
  const fechaMatricula = new Date(fechaActual.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
  const fechaCompra = new Date(fechaMatricula.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
  
  return {
    fecha_matricula: fechaMatricula.toISOString().split('T')[0],
    fecha_compra: fechaCompra.toISOString().split('T')[0]
  };
}

// Generar kilómetros realistas
function generarKilometros(anio) {
  const anioActual = new Date().getFullYear();
  const antiguedad = anioActual - anio;
  const kmPorAnio = Math.floor(Math.random() * 15000) + 8000; // 8k-23k km/año
  return Math.floor(antiguedad * kmPorAnio + Math.random() * 5000);
}

// Generar vehículo individual
function generarVehiculo(id) {
  const marcaModelo = marcasModelos[Math.floor(Math.random() * marcasModelos.length)];
  const modelo = marcaModelo.modelos[Math.floor(Math.random() * marcaModelo.modelos.length)];
  const categoria = categorias[Math.floor(Math.random() * categorias.length)];
  const ubicacion = ubicaciones[Math.floor(Math.random() * ubicaciones.length)];
  const color = colores[Math.floor(Math.random() * colores.length)];
  const anio = Math.floor(Math.random() * 8) + 2016; // 2016-2024
  const transmision = Math.random() > 0.3 ? 'AUTOMATICO' : 'MANUAL';
  const condicion = Math.random() > 0.2 ? 'NUEVO' : 'USADO';
  
  // Distribuir estados de forma realista
  const estadoRandom = Math.random();
  let estado;
  if (estadoRandom < 0.6) {
    estado = 'disponible'; // 60% disponibles
  } else if (estadoRandom < 0.85) {
    estado = 'alquilado'; // 25% alquilados
  } else if (estadoRandom < 0.95) {
    estado = 'taller'; // 10% en mantenimiento
  } else {
    estado = 'vendido'; // 5% vendidos
  }
  
  const fechas = generarFechas();
  const precios = generarPrecios();
  const kmCompra = Math.floor(Math.random() * 5000);
  const kmActuales = kmCompra + generarKilometros(anio);
  
  return {
    vehiculo_id: id,
    vin: generarVIN(),
    matricula: generarMatricula(),
    marca: marcaModelo.marca,
    modelo: modelo,
    anio: anio,
    color: color,
    fecha_matricula: fechas.fecha_matricula,
    fecha_compra: fechas.fecha_compra,
    km_compra: kmCompra,
    km_actuales: kmActuales,
    km_venta: estado === 'vendido' ? kmActuales : null,
    transmision: transmision,
    condicion: condicion,
    precio_compra_base: precios.precio_compra_base,
    igic_compra: precios.igic_compra,
    precio_compra_total: precios.precio_compra_total,
    precio_venta_base: precios.precio_venta_base,
    igic_venta: precios.igic_venta,
    precio_venta_total: precios.precio_venta_total,
    estado: estado,
    categoria_id: categoria.id,
    ubicacion_id: ubicacion.id
  };
}

async function limpiarBaseDatos() {
  console.log('🧹 Limpiando base de datos...');
  
  // Limpiar en orden de dependencias
  await query('DELETE FROM pagos');
  await query('DELETE FROM alquileres');
  await query('DELETE FROM reservas');
  await query('DELETE FROM mantenimientos');
  await query('DELETE FROM seguros_vehiculo');
  await query('DELETE FROM vehiculos');
  await query('DELETE FROM clientes');
  await query('DELETE FROM usuarios');
  await query('DELETE FROM tarifas');
  await query('DELETE FROM categorias_vehiculo');
  await query('DELETE FROM ubicaciones');
  
  // Resetear secuencias
  await query('ALTER SEQUENCE vehiculos_vehiculo_id_seq RESTART WITH 1');
  await query('ALTER SEQUENCE usuarios_usuario_id_seq RESTART WITH 1');
  await query('ALTER SEQUENCE clientes_cliente_id_seq RESTART WITH 1');
  
  console.log('✅ Base de datos limpiada');
}

async function poblarDatosBase() {
  console.log('📊 Poblando datos base...');
  
  // Categorías
  await query('DELETE FROM categorias_vehiculo');
  for (const categoria of categorias) {
    await query(`
      INSERT INTO categorias_vehiculo (categoria_id, nombre, capacidad_pasajeros, puertas)
      VALUES ($1, $2, $3, $4)
    `, [categoria.id, categoria.nombre, categoria.capacidad, categoria.puertas]);
  }
  
  // Ubicaciones
  await query('DELETE FROM ubicaciones');
  for (const ubicacion of ubicaciones) {
    await query(`
      INSERT INTO ubicaciones (ubicacion_id, nombre)
      VALUES ($1, $2)
    `, [ubicacion.id, ubicacion.nombre]);
  }
  
  // Usuarios
  await query('DELETE FROM usuarios');
  const usuarios = [
    { nickname: 'admin', password: 'admin123', rol: 'admin' },
    { nickname: 'manager', password: 'manager123', rol: 'admin' },
    { nickname: 'operador1', password: 'operador123', rol: 'admin' },
    { nickname: 'operador2', password: 'operador123', rol: 'admin' }
  ];
  
  for (const usuario of usuarios) {
    const hashedPassword = await bcrypt.hash(usuario.password, 10);
    await query(`
      INSERT INTO usuarios (nickname, password_hash, rol, activo, fecha_creacion)
      VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP)
    `, [usuario.nickname, hashedPassword, usuario.rol]);
  }
  
  // Clientes
  await query('DELETE FROM clientes');
  const clientes = [
    { nombre: 'María', apellidos: 'González López', dni: '12345678A', email: 'maria.gonzalez@email.com', telefono: '+34 600 123 456' },
    { nombre: 'Carlos', apellidos: 'Rodríguez Martín', dni: '87654321B', email: 'carlos.rodriguez@email.com', telefono: '+34 600 654 321' },
    { nombre: 'Ana', apellidos: 'Fernández García', dni: '11223344C', email: 'ana.fernandez@email.com', telefono: '+34 600 987 654' },
    { nombre: 'Luis', apellidos: 'Martínez Pérez', dni: '55667788D', email: 'luis.martinez@email.com', telefono: '+34 600 456 789' },
    { nombre: 'Sofia', apellidos: 'López Jiménez', dni: '99887766E', email: 'sofia.lopez@email.com', telefono: '+34 600 321 654' },
    { nombre: 'David', apellidos: 'García Ruiz', dni: '44332211F', email: 'david.garcia@email.com', telefono: '+34 600 789 123' },
    { nombre: 'Elena', apellidos: 'Pérez Moreno', dni: '66778899G', email: 'elena.perez@email.com', telefono: '+34 600 147 258' },
    { nombre: 'Javier', apellidos: 'Sánchez Torres', dni: '22334455H', email: 'javier.sanchez@email.com', telefono: '+34 600 369 258' }
  ];
  
  for (let i = 0; i < clientes.length; i++) {
    const cliente = clientes[i];
    await query(`
      INSERT INTO clientes (cliente_id, nombre, apellidos, dni_pasaporte, email, telefono)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [i + 1, cliente.nombre, cliente.apellidos, cliente.dni, cliente.email, cliente.telefono]);
  }
  
  console.log('✅ Datos base poblados');
}

async function generarFlota() {
  console.log('🚗 Generando flota de 60 vehículos...');
  
  await query('DELETE FROM vehiculos');
  
  const vehiculos = [];
  for (let i = 1; i <= 60; i++) {
    vehiculos.push(generarVehiculo(i));
  }
  
  // Insertar vehículos
  for (const vehiculo of vehiculos) {
    await query(`
      INSERT INTO vehiculos (
        vehiculo_id, vin, matricula, marca, modelo, anio, color, fecha_matricula, 
        fecha_compra, km_compra, km_actuales, km_venta, transmision, condicion,
        precio_compra_base, igic_compra, precio_compra_total, precio_venta_base, 
        igic_venta, precio_venta_total, estado, categoria_id, ubicacion_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 
        $17, $18, $19, $20, $21, $22, $23
      )
    `, [
      vehiculo.vehiculo_id, vehiculo.vin, vehiculo.matricula, vehiculo.marca, 
      vehiculo.modelo, vehiculo.anio, vehiculo.color, vehiculo.fecha_matricula,
      vehiculo.fecha_compra, vehiculo.km_compra, vehiculo.km_actuales, vehiculo.km_venta,
      vehiculo.transmision, vehiculo.condicion, vehiculo.precio_compra_base,
      vehiculo.igic_compra, vehiculo.precio_compra_total, vehiculo.precio_venta_base,
      vehiculo.igic_venta, vehiculo.precio_venta_total, vehiculo.estado,
      vehiculo.categoria_id, vehiculo.ubicacion_id
    ]);
  }
  
  // Mostrar estadísticas
  const estadisticas = {
    total: vehiculos.length,
    disponibles: vehiculos.filter(v => v.estado === 'disponible').length,
    alquilados: vehiculos.filter(v => v.estado === 'alquilado').length,
    enMantenimiento: vehiculos.filter(v => v.estado === 'taller').length,
    vendidos: vehiculos.filter(v => v.estado === 'vendido').length
  };
  
  console.log('📊 Estadísticas de la flota:');
  console.log(`   Total: ${estadisticas.total}`);
  console.log(`   Disponibles: ${estadisticas.disponibles}`);
  console.log(`   Alquilados: ${estadisticas.alquilados}`);
  console.log(`   En Mantenimiento: ${estadisticas.enMantenimiento}`);
  console.log(`   Vendidos: ${estadisticas.vendidos}`);
  
  console.log('✅ Flota generada exitosamente');
}

async function main() {
  try {
    console.log('🚀 Iniciando generación de datos realistas...\n');
    
    await limpiarBaseDatos();
    await poblarDatosBase();
    await generarFlota();
    
    console.log('\n✅ ¡Datos realistas generados exitosamente!');
    console.log('🔑 Credenciales de acceso:');
    console.log('   - admin / admin123');
    console.log('   - manager / manager123');
    console.log('   - operador1 / operador123');
    console.log('   - operador2 / operador123');
    
  } catch (error) {
    console.error('❌ Error generando datos:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { main }; 