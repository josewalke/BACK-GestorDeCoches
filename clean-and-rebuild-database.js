const { query } = require('./src/config/database');

async function cleanAndRebuildDatabase() {
  try {
    console.log('🧹 LIMPIANDO BASE DE DATOS...');
    
    // Limpiar todas las tablas excepto users
    const tablesToClean = [
      'alquileres',
      'reservas', 
      'mantenimientos',
      'ventas',
      'vehiculos',
      'clientes',
      'categorias_vehiculo',
      'ubicaciones'
    ];
    
    for (const table of tablesToClean) {
      console.log(`🗑️  Limpiando tabla: ${table}`);
      await query(`DELETE FROM ${table}`);
    }
    
    console.log('✅ Base de datos limpiada\n');
    
    // Crear ubicaciones
    console.log('📍 CREANDO UBICACIONES...');
    const ubicacionesList = [
      'Aeropuerto Tenerife Sur',
      'Aeropuerto Tenerife Norte', 
      'Puerto de Santa Cruz',
      'Puerto de Los Cristianos',
      'Centro Comercial Meridiano',
      'Centro Comercial Siam Mall',
      'Hotel Ritz Carlton',
      'Hotel Bahía del Duque'
    ];
    let ubicacionesIds = [];
    for (const ubicacion of ubicacionesList) {
      const result = await query('INSERT INTO ubicaciones (nombre) VALUES ($1) RETURNING ubicacion_id', [ubicacion]);
      ubicacionesIds.push(result.rows[0].ubicacion_id);
    }
    console.log(`✅ ${ubicacionesList.length} ubicaciones creadas`);
    
    // Crear categorías de vehículos
    console.log('\n🚗 CREANDO CATEGORÍAS...');
    const categorias = [
      { nombre: 'Económico', capacidad_pasajeros: 4, puertas: 4 },
      { nombre: 'Compacto', capacidad_pasajeros: 5, puertas: 5 },
      { nombre: 'Intermedio', capacidad_pasajeros: 5, puertas: 5 },
      { nombre: 'Superior', capacidad_pasajeros: 5, puertas: 5 },
      { nombre: 'Premium', capacidad_pasajeros: 5, puertas: 5 },
      { nombre: 'SUV', capacidad_pasajeros: 7, puertas: 5 },
      { nombre: 'Van', capacidad_pasajeros: 8, puertas: 5 }
    ];
    let categoriasIds = [];
    for (const categoria of categorias) {
      const result = await query(`
        INSERT INTO categorias_vehiculo (nombre, capacidad_pasajeros, puertas)
        VALUES ($1, $2, $3) RETURNING categoria_id
      `, [categoria.nombre, categoria.capacidad_pasajeros, categoria.puertas]);
      categoriasIds.push(result.rows[0].categoria_id);
    }
    console.log(`✅ ${categorias.length} categorías creadas`);
    
    // Crear clientes
    console.log('\n👥 CREANDO CLIENTES...');
    const nombres = ['Ana', 'Carlos', 'Elena', 'Francisco', 'Isabel', 'Javier', 'Laura', 'Miguel', 'Natalia', 'Oscar'];
    const apellidos = ['García', 'Martínez', 'López', 'Rodríguez', 'González', 'Pérez', 'Sánchez', 'Fernández', 'Ramírez', 'Torres'];
    
    for (let i = 0; i < 50; i++) {
      const nombre = nombres[i % nombres.length];
      const apellido = apellidos[i % apellidos.length];
      const email = `${nombre.toLowerCase()}.${apellido.toLowerCase()}@email.com`;
      const telefono = `6${Math.floor(Math.random() * 90000000) + 10000000}`;
      const dni = `${Math.floor(Math.random() * 90000000) + 10000000}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
      
      await query(`
        INSERT INTO clientes (nombre, apellidos, email, telefono, dni_pasaporte)
        VALUES ($1, $2, $3, $4, $5)
      `, [nombre, apellido, email, telefono, dni]);
    }
    console.log('✅ 50 clientes creados');
    
    // Crear 100 vehículos distribuidos equitativamente
    console.log('\n🚗 CREANDO 100 VEHÍCULOS...');
    const marcas = ['Audi', 'BMW', 'Citroën', 'Ford', 'Honda', 'Kia', 'Nissan', 'Opel', 'Peugeot', 'Renault', 'Seat', 'Volkswagen'];
    const modelos = ['A3', 'Serie 3', 'C3', 'Fiesta', 'Civic', 'Sportage', 'Qashqai', 'Corsa', '2008', 'Captur', 'Arona', 'Polo'];
    const colores = ['Blanco', 'Negro', 'Gris', 'Azul', 'Rojo', 'Verde', 'Plata'];
    const transmisiones = ['MANUAL', 'AUTOMATICO'];
    const condiciones = ['NUEVO', 'USADO'];
    
    const estados = ['disponible', 'alquilado', 'reservado', 'taller', 'vendido'];
    const estadosPorCategoria = 20; // 20 vehículos por cada estado
    
    for (let i = 0; i < 100; i++) {
      const marca = marcas[i % marcas.length];
      const modelo = modelos[i % modelos.length];
      const color = colores[i % colores.length];
      const transmision = transmisiones[i % transmisiones.length];
      const condicion = condiciones[i % condiciones.length];
      const estado = estados[Math.floor(i / estadosPorCategoria)];
      
      // Matrícula: 4 números + 3 letras (ejemplo: 1234ABC)
      const matricula = `${Math.floor(Math.random() * 9000) + 1000}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
      // VIN: exactamente 17 caracteres
      const vin = `VIN${Math.floor(Math.random() * 1e14)}`.padEnd(17, '0').slice(0, 17);
      const anio = Math.floor(Math.random() * 10) + 2015;
      const km = Math.floor(Math.random() * 100000) + 1000;
      const precioCompra = Math.floor(Math.random() * 30000) + 10000;
      const precioVenta = precioCompra * (1.2 + Math.random() * 0.3);
      
      const categoriaId = categoriasIds[Math.floor(Math.random() * categoriasIds.length)];
      const ubicacionId = ubicacionesIds[Math.floor(Math.random() * ubicacionesIds.length)];
      
      const result = await query(`
        INSERT INTO vehiculos (
          vin, matricula, marca, modelo, anio, color, fecha_matricula, 
          fecha_compra, km_compra, km_actuales, transmision, condicion, 
          precio_compra_base, igic_compra, precio_compra_total, 
          precio_venta_base, igic_venta, precio_venta_total, 
          estado, categoria_id, ubicacion_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING vehiculo_id
      `, [
        vin, matricula, marca, modelo, anio, color, new Date(anio, 0, 1),
        new Date(anio, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        km, km, transmision, condicion, precioCompra, precioCompra * 0.07,
        precioCompra * 1.07, precioVenta, precioVenta * 0.07, precioVenta * 1.07,
        estado, categoriaId, ubicacionId
      ]);
      
      console.log(`${i + 1}/100: ${marca} ${modelo} (${matricula}) - ${estado}`);
    }
    
    console.log('\n✅ 100 vehículos creados con distribución equitativa');
    
    // Crear alquileres para los 20 vehículos alquilados
    console.log('\n📋 CREANDO ALQUILERES PARA VEHÍCULOS ALQUILADOS...');
    const vehiculosAlquilados = await query(`
      SELECT vehiculo_id, marca, modelo, matricula 
      FROM vehiculos 
      WHERE estado = 'alquilado'
      ORDER BY vehiculo_id
    `);
    
    const clientes = await query('SELECT cliente_id, nombre, apellidos FROM clientes ORDER BY cliente_id LIMIT 20');
    const ubicaciones = await query('SELECT ubicacion_id FROM ubicaciones ORDER BY ubicacion_id');
    
    for (let i = 0; i < vehiculosAlquilados.rows.length; i++) {
      const vehiculo = vehiculosAlquilados.rows[i];
      const cliente = clientes.rows[i % clientes.rows.length];
      const pickupUbicacion = ubicacionesIds[i % ubicacionesIds.length];
      const dropoffUbicacion = ubicacionesIds[(i + 1) % ubicacionesIds.length];
      
      const fechaRecogida = new Date();
      fechaRecogida.setDate(fechaRecogida.getDate() - Math.floor(Math.random() * 7));
      
      const fechaDevolucion = new Date(fechaRecogida);
      fechaDevolucion.setDate(fechaDevolucion.getDate() + Math.floor(Math.random() * 14) + 1);
      
      const totalDias = Math.ceil((fechaDevolucion - fechaRecogida) / (1000 * 60 * 60 * 24));
      const precioPorDia = Math.floor(Math.random() * 50) + 30;
      const ingresoTotal = precioPorDia * totalDias;
      
      await query(`
        INSERT INTO alquileres (
          vehiculo_id, cliente_id, fecha_recogida_real, fecha_devolucion_real,
          pickup_ubicacion_id, dropoff_ubicacion_id, km_salida, nivel_combustible_salida,
          precio_por_dia, total_dias, ingreso_total, ingreso_final, estado, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      `, [
        vehiculo.vehiculo_id, cliente.cliente_id, fechaRecogida, fechaDevolucion,
        pickupUbicacion, dropoffUbicacion, Math.floor(Math.random() * 50000) + 10000,
        Math.floor(Math.random() * 4) + 1, precioPorDia, totalDias, ingresoTotal, ingresoTotal, 'abierto'
      ]);
      
      console.log(`✅ Alquiler creado para ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.matricula})`);
    }
    
    console.log('\n🎉 ¡BASE DE DATOS RECONSTRUIDA EXITOSAMENTE!');
    console.log('📊 Distribución final:');
    console.log('   - 20 vehículos disponibles');
    console.log('   - 20 vehículos alquilados (con alquileres activos)');
    console.log('   - 20 vehículos reservados');
    console.log('   - 20 vehículos en mantenimiento');
    console.log('   - 20 vehículos vendidos');
    console.log('   - 50 clientes');
    console.log('   - 8 ubicaciones');
    console.log('   - 7 categorías de vehículos');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

cleanAndRebuildDatabase(); 