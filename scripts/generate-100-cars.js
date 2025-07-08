require('dotenv').config();
const { query } = require('../src/config/database');

// Datos realistas para generar
const marcas = ['BMW', 'Audi', 'Mercedes-Benz', 'Volkswagen', 'Ford', 'Renault', 'Peugeot', 'Citroën', 'Seat', 'Opel', 'Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia'];
const modelos = {
  'BMW': ['Serie 1', 'Serie 2', 'Serie 3', 'Serie 5', 'X1', 'X3', 'X5'],
  'Audi': ['A1', 'A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7'],
  'Mercedes-Benz': ['Clase A', 'Clase B', 'Clase C', 'Clase E', 'GLA', 'GLC', 'GLE'],
  'Volkswagen': ['Golf', 'Polo', 'Passat', 'Tiguan', 'Touareg', 'Caddy'],
  'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Kuga', 'Explorer', 'Transit'],
  'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Talisman'],
  'Peugeot': ['208', '308', '508', '2008', '3008', '5008'],
  'Citroën': ['C3', 'C4', 'C5', 'C3 Aircross', 'C5 Aircross'],
  'Seat': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco'],
  'Opel': ['Corsa', 'Astra', 'Mokka', 'Crossland', 'Grandland'],
  'Toyota': ['Yaris', 'Corolla', 'Camry', 'RAV4', 'Highlander'],
  'Honda': ['Jazz', 'Civic', 'Accord', 'CR-V', 'HR-V'],
  'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf'],
  'Hyundai': ['i10', 'i20', 'i30', 'Tucson', 'Santa Fe'],
  'Kia': ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Sorento']
};

const colores = ['Blanco', 'Negro', 'Gris', 'Azul', 'Rojo', 'Verde', 'Plata', 'Dorado', 'Marrón', 'Naranja'];
const transmisiones = ['MANUAL', 'AUTOMATICO'];
const condiciones = ['NUEVO', 'USADO'];
const estados = ['disponible', 'alquilado', 'taller', 'vendido', 'reservado'];

const ubicaciones = [
  'Aeropuerto Tenerife Sur',
  'Aeropuerto Tenerife Norte', 
  'Puerto de Santa Cruz',
  'Puerto de Los Cristianos',
  'Centro Comercial Meridiano',
  'Centro Comercial Siam Mall',
  'Hotel Ritz Carlton',
  'Hotel Bahía del Duque'
];

const categorias = [
  { nombre: 'Económico', capacidad: 4, puertas: 3 },
  { nombre: 'Compacto', capacidad: 5, puertas: 5 },
  { nombre: 'Intermedio', capacidad: 5, puertas: 5 },
  { nombre: 'Superior', capacidad: 5, puertas: 5 },
  { nombre: 'Premium', capacidad: 5, puertas: 5 },
  { nombre: 'SUV', capacidad: 7, puertas: 5 },
  { nombre: 'Van/Minivan', capacidad: 8, puertas: 5 }
];

// Función para generar VIN único
function generarVIN() {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let vin = '';
  for (let i = 0; i < 17; i++) {
    vin += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return vin;
}

// Función para generar matrícula española
function generarMatricula() {
  const letras = 'BCDFGHJKLMNPRSTVWXYZ';
  const numeros = '0123456789';
  let matricula = '';
  
  // 4 números
  for (let i = 0; i < 4; i++) {
    matricula += numeros.charAt(Math.floor(Math.random() * numeros.length));
  }
  
  // 3 letras
  for (let i = 0; i < 3; i++) {
    matricula += letras.charAt(Math.floor(Math.random() * letras.length));
  }
  
  return matricula;
}

// Función para generar datos de cliente
function generarCliente() {
  const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'Pedro', 'Isabel', 'Miguel', 'Rosa'];
  const apellidos = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martin'];
  
  const nombre = nombres[Math.floor(Math.random() * nombres.length)];
  const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
  const dni = Math.floor(Math.random() * 90000000) + 10000000 + String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const email = `${nombre.toLowerCase()}.${apellido.toLowerCase()}@email.com`;
  const telefono = '6' + Math.floor(Math.random() * 90000000) + 10000000;
  
  return { nombre, apellido, dni, email, telefono };
}

async function generar100Coches() {
  try {
    console.log('🚀 Generando 100 coches con datos realistas...');
    
    // 1. Insertar ubicaciones
    console.log('📍 Insertando ubicaciones...');
    for (let i = 0; i < ubicaciones.length; i++) {
      await query('INSERT INTO ubicaciones (nombre) VALUES ($1) ON CONFLICT DO NOTHING', [ubicaciones[i]]);
    }
    console.log('✅ Ubicaciones insertadas');
    
    // 2. Insertar categorías
    console.log('🚗 Insertando categorías...');
    for (let i = 0; i < categorias.length; i++) {
      const cat = categorias[i];
      await query('INSERT INTO categorias_vehiculo (nombre, capacidad_pasajeros, puertas) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', 
        [cat.nombre, cat.capacidad, cat.puertas]);
    }
    console.log('✅ Categorías insertadas');
    
    // 3. Insertar clientes
    console.log('👥 Insertando clientes...');
    const clientes = [];
    for (let i = 0; i < 50; i++) {
      const cliente = generarCliente();
      const result = await query(`
        INSERT INTO clientes (nombre, apellidos, dni_pasaporte, email, telefono) 
        VALUES ($1, $2, $3, $4, $5) 
        ON CONFLICT (dni_pasaporte) DO NOTHING 
        RETURNING cliente_id
      `, [cliente.nombre, cliente.apellido, cliente.dni, cliente.email, cliente.telefono]);
      
      if (result.rows.length > 0) {
        clientes.push(result.rows[0].cliente_id);
      }
    }
    console.log(`✅ ${clientes.length} clientes insertados`);
    
    // 4. Insertar vehículos
    console.log('🚙 Insertando 100 vehículos...');
    const vehiculos = [];
    const vinsUsados = new Set();
    
    for (let i = 0; i < 100; i++) {
      // Generar VIN único
      let vin;
      do {
        vin = generarVIN();
      } while (vinsUsados.has(vin));
      vinsUsados.add(vin);
      
      const marca = marcas[Math.floor(Math.random() * marcas.length)];
      const modelo = modelos[marca][Math.floor(Math.random() * modelos[marca].length)];
      const matricula = generarMatricula();
      const color = colores[Math.floor(Math.random() * colores.length)];
      const transmision = transmisiones[Math.floor(Math.random() * transmisiones.length)];
      const condicion = condiciones[Math.floor(Math.random() * condiciones.length)];
      const estado = estados[Math.floor(Math.random() * estados.length)];
      
      const anio = Math.floor(Math.random() * 10) + 2015;
      const km_compra = Math.floor(Math.random() * 50000) + 1000;
      const km_actuales = km_compra + Math.floor(Math.random() * 30000);
      
      const precio_compra_base = Math.floor(Math.random() * 30000) + 8000;
      const igic_compra = precio_compra_base * 0.07;
      const precio_compra_total = precio_compra_base + igic_compra;
      
      const precio_venta_base = precio_compra_total * (1 + Math.random() * 0.3);
      const igic_venta = precio_venta_base * 0.07;
      const precio_venta_total = precio_venta_base + igic_venta;
      
      const categoria_id = Math.floor(Math.random() * categorias.length) + 1;
      const ubicacion_id = Math.floor(Math.random() * ubicaciones.length) + 1;
      const grupo = String.fromCharCode(65 + Math.floor(Math.random() * 7)); // A-G
      
      const fecha_compra = new Date(anio, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const fecha_matricula = new Date(fecha_compra.getTime() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
      
      const result = await query(`
        INSERT INTO vehiculos (
          vin, matricula, marca, modelo, anio, color, fecha_matricula, fecha_compra,
          km_compra, km_actuales, transmision, condicion, precio_compra_base, igic_compra,
          precio_compra_total, precio_venta_base, igic_venta, precio_venta_total,
          estado, categoria_id, ubicacion_id, grupo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        RETURNING vehiculo_id
      `, [
        vin, matricula, marca, modelo, anio, color, fecha_matricula, fecha_compra,
        km_compra, km_actuales, transmision, condicion, precio_compra_base, igic_compra,
        precio_compra_total, precio_venta_base, igic_venta, precio_venta_total,
        estado, categoria_id, ubicacion_id, grupo
      ]);
      
      vehiculos.push(result.rows[0].vehiculo_id);
    }
    console.log('✅ 100 vehículos insertados');
    
    // 5. Generar algunos alquileres
    console.log('📅 Generando alquileres...');
    for (let i = 0; i < 30; i++) {
      const vehiculo_id = vehiculos[Math.floor(Math.random() * vehiculos.length)];
      const cliente_id = clientes[Math.floor(Math.random() * clientes.length)];
      const pickup_ubicacion_id = Math.floor(Math.random() * ubicaciones.length) + 1;
      const dropoff_ubicacion_id = Math.floor(Math.random() * ubicaciones.length) + 1;
      
      const fecha_recogida = new Date();
      fecha_recogida.setDate(fecha_recogida.getDate() + Math.floor(Math.random() * 30));
      
      const fecha_devolucion = new Date(fecha_recogida);
      fecha_devolucion.setDate(fecha_devolucion.getDate() + Math.floor(Math.random() * 14) + 1);
      
      const km_salida = Math.floor(Math.random() * 100000) + 1000;
      const km_entrada = km_salida + Math.floor(Math.random() * 500);
      const precio_por_dia = Math.floor(Math.random() * 100) + 30;
      const total_dias = Math.ceil((fecha_devolucion - fecha_recogida) / (1000 * 60 * 60 * 24));
      const ingreso_total = precio_por_dia * total_dias;
      const descuento = Math.random() > 0.7 ? ingreso_total * 0.1 : 0;
      const ingreso_final = ingreso_total - descuento;
      
      await query(`
        INSERT INTO alquileres (
          vehiculo_id, cliente_id, fecha_recogida_real, fecha_devolucion_real,
          pickup_ubicacion_id, dropoff_ubicacion_id, km_salida, km_entrada,
          estado, precio_por_dia, total_dias, ingreso_total, descuento_aplicado, ingreso_final
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        vehiculo_id, cliente_id, fecha_recogida, fecha_devolucion,
        pickup_ubicacion_id, dropoff_ubicacion_id, km_salida, km_entrada,
        'cerrado', precio_por_dia, total_dias, ingreso_total, descuento, ingreso_final
      ]);
    }
    console.log('✅ 30 alquileres generados');
    
    // 6. Generar algunas ventas
    console.log('💰 Generando ventas...');
    for (let i = 0; i < 15; i++) {
      const vehiculo_id = vehiculos[Math.floor(Math.random() * vehiculos.length)];
      const cliente = generarCliente();
      const fecha_venta = new Date();
      fecha_venta.setDate(fecha_venta.getDate() - Math.floor(Math.random() * 365));
      
      const monto_venta = Math.floor(Math.random() * 40000) + 15000;
      const metodo_pago = ['Efectivo', 'Tarjeta', 'Transferencia'][Math.floor(Math.random() * 3)];
      
      await query(`
        INSERT INTO ventas (
          vehiculo_id, fecha_venta, monto_venta, metodo_pago,
          cliente_nombre, cliente_apellidos, cliente_dni, cliente_email, cliente_telefono
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        vehiculo_id, fecha_venta, monto_venta, metodo_pago,
        cliente.nombre, cliente.apellido, cliente.dni, cliente.email, cliente.telefono
      ]);
    }
    console.log('✅ 15 ventas generadas');
    
    // 7. Generar mantenimientos
    console.log('🔧 Generando mantenimientos...');
    for (let i = 0; i < 25; i++) {
      const vehiculo_id = vehiculos[Math.floor(Math.random() * vehiculos.length)];
      const fecha_servicio = new Date();
      fecha_servicio.setDate(fecha_servicio.getDate() - Math.floor(Math.random() * 365));
      
      const km_servicio = Math.floor(Math.random() * 100000) + 1000;
      const descripcion = ['Cambio de aceite', 'Revisión general', 'Cambio de frenos', 'Cambio de neumáticos', 'Revisión eléctrica'][Math.floor(Math.random() * 5)];
      const coste = Math.floor(Math.random() * 500) + 50;
      const proveedor = ['Taller Central', 'AutoServicio Plus', 'Mecánica Express', 'Taller Premium'][Math.floor(Math.random() * 4)];
      const proximo_servicio_km = km_servicio + Math.floor(Math.random() * 10000) + 5000;
      
      await query(`
        INSERT INTO mantenimientos (
          vehiculo_id, fecha_servicio, km_servicio, descripcion, coste, proveedor, proximo_servicio_km
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [vehiculo_id, fecha_servicio, km_servicio, descripcion, coste, proveedor, proximo_servicio_km]);
    }
    console.log('✅ 25 mantenimientos generados');
    
    console.log('🎉 ¡Base de datos poblada exitosamente con 100 coches!');
    console.log('📊 Resumen:');
    console.log('   - 100 vehículos');
    console.log('   - 50 clientes');
    console.log('   - 30 alquileres');
    console.log('   - 15 ventas');
    console.log('   - 25 mantenimientos');
    console.log('   - 8 ubicaciones');
    console.log('   - 7 categorías');
    
  } catch (error) {
    console.error('❌ Error generando datos:', error.message);
  } finally {
    process.exit(0);
  }
}

generar100Coches(); 