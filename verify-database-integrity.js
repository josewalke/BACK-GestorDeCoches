require('dotenv').config();
const { query } = require('./database-pg');

async function verifyDatabaseIntegrity() {
  try {
    console.log('🔍 Verificando integridad y relaciones de la base de datos...\n');
    
    // 1. Verificar claves foráneas y relaciones
    console.log('📋 Verificando claves foráneas...');
    
    // Verificar relaciones de vehículos
    const vehiculosRelaciones = await query(`
      SELECT 
        COUNT(*) as total_vehiculos,
        COUNT(CASE WHEN categoria_id IS NOT NULL THEN 1 END) as con_categoria,
        COUNT(CASE WHEN ubicacion_id IS NOT NULL THEN 1 END) as con_ubicacion
      FROM vehiculos
    `);
    
    console.log(`   Vehículos: ${vehiculosRelaciones.rows[0].total_vehiculos} total, ${vehiculosRelaciones.rows[0].con_categoria} con categoría, ${vehiculosRelaciones.rows[0].con_ubicacion} con ubicación`);
    
    // Verificar relaciones de alquileres
    const alquileresRelaciones = await query(`
      SELECT 
        COUNT(*) as total_alquileres,
        COUNT(CASE WHEN vehiculo_id IS NOT NULL THEN 1 END) as con_vehiculo,
        COUNT(CASE WHEN cliente_id IS NOT NULL THEN 1 END) as con_cliente,
        COUNT(CASE WHEN pickup_ubicacion_id IS NOT NULL THEN 1 END) as con_pickup,
        COUNT(CASE WHEN dropoff_ubicacion_id IS NOT NULL THEN 1 END) as con_dropoff
      FROM alquileres
    `);
    
    console.log(`   Alquileres: ${alquileresRelaciones.rows[0].total_alquileres} total, ${alquileresRelaciones.rows[0].con_vehiculo} con vehículo, ${alquileresRelaciones.rows[0].con_cliente} con cliente`);
    
    // Verificar relaciones de reservas
    const reservasRelaciones = await query(`
      SELECT 
        COUNT(*) as total_reservas,
        COUNT(CASE WHEN vehiculo_id IS NOT NULL THEN 1 END) as con_vehiculo,
        COUNT(CASE WHEN cliente_id IS NOT NULL THEN 1 END) as con_cliente,
        COUNT(CASE WHEN categoria_id IS NOT NULL THEN 1 END) as con_categoria,
        COUNT(CASE WHEN pickup_ubicacion_id IS NOT NULL THEN 1 END) as con_pickup,
        COUNT(CASE WHEN dropoff_ubicacion_id IS NOT NULL THEN 1 END) as con_dropoff
      FROM reservas
    `);
    
    console.log(`   Reservas: ${reservasRelaciones.rows[0].total_reservas} total, ${reservasRelaciones.rows[0].con_vehiculo} con vehículo, ${reservasRelaciones.rows[0].con_cliente} con cliente`);
    
    // Verificar relaciones de pagos
    const pagosRelaciones = await query(`
      SELECT 
        COUNT(*) as total_pagos,
        COUNT(CASE WHEN alquiler_id IS NOT NULL THEN 1 END) as con_alquiler
      FROM pagos
    `);
    
    console.log(`   Pagos: ${pagosRelaciones.rows[0].total_pagos} total, ${pagosRelaciones.rows[0].con_alquiler} con alquiler`);
    
    // Verificar relaciones de seguros
    const segurosRelaciones = await query(`
      SELECT 
        COUNT(*) as total_seguros,
        COUNT(CASE WHEN vehiculo_id IS NOT NULL THEN 1 END) as con_vehiculo
      FROM seguros_vehiculo
    `);
    
    console.log(`   Seguros: ${segurosRelaciones.rows[0].total_seguros} total, ${segurosRelaciones.rows[0].con_vehiculo} con vehículo`);
    
    // 2. Verificar consistencia de estados
    console.log('\n📊 Verificando consistencia de estados...');
    
    // Vehículos alquilados vs alquileres activos
    const vehiculosAlquilados = await query(`
      SELECT COUNT(*) as total FROM vehiculos WHERE estado = 'alquilado'
    `);
    
    const alquileresActivos = await query(`
      SELECT COUNT(DISTINCT vehiculo_id) as total FROM alquileres WHERE estado = 'abierto'
    `);
    
    console.log(`   Vehículos marcados como alquilados: ${vehiculosAlquilados.rows[0].total}`);
    console.log(`   Vehículos con alquileres activos: ${alquileresActivos.rows[0].total}`);
    
    // Vehículos reservados vs reservas activas
    const vehiculosReservados = await query(`
      SELECT COUNT(*) as total FROM vehiculos WHERE estado = 'reservado'
    `);
    
    const reservasActivas = await query(`
      SELECT COUNT(DISTINCT vehiculo_id) as total 
      FROM reservas 
      WHERE estado_entrega = 'pendiente' AND fecha_recogida_prevista >= CURRENT_DATE
    `);
    
    console.log(`   Vehículos marcados como reservados: ${vehiculosReservados.rows[0].total}`);
    console.log(`   Vehículos con reservas activas: ${reservasActivas.rows[0].total}`);
    
    // 3. Verificar datos faltantes
    console.log('\n🔍 Verificando datos faltantes...');
    
    // Vehículos sin categoría
    const vehiculosSinCategoria = await query(`
      SELECT COUNT(*) as total FROM vehiculos WHERE categoria_id IS NULL
    `);
    
    // Vehículos sin ubicación
    const vehiculosSinUbicacion = await query(`
      SELECT COUNT(*) as total FROM vehiculos WHERE ubicacion_id IS NULL
    `);
    
    console.log(`   Vehículos sin categoría: ${vehiculosSinCategoria.rows[0].total}`);
    console.log(`   Vehículos sin ubicación: ${vehiculosSinUbicacion.rows[0].total}`);
    
    // 4. Verificar fechas coherentes
    console.log('\n📅 Verificando fechas coherentes...');
    
    // Reservas con fechas pasadas
    const reservasPasadas = await query(`
      SELECT COUNT(*) as total 
      FROM reservas 
      WHERE fecha_recogida_prevista < CURRENT_DATE AND estado_entrega = 'pendiente'
    `);
    
    // Alquileres con fechas futuras
    const alquileresFuturos = await query(`
      SELECT COUNT(*) as total 
      FROM alquileres 
      WHERE fecha_recogida_real > CURRENT_DATE
    `);
    
    console.log(`   Reservas con fechas pasadas: ${reservasPasadas.rows[0].total}`);
    console.log(`   Alquileres con fechas futuras: ${alquileresFuturos.rows[0].total}`);
    
    // 5. Resumen final
    console.log('\n✅ Resumen de verificación:');
    
    const totalVehiculos = await query('SELECT COUNT(*) as total FROM vehiculos');
    const totalClientes = await query('SELECT COUNT(*) as total FROM clientes');
    const totalReservas = await query('SELECT COUNT(*) as total FROM reservas');
    const totalAlquileres = await query('SELECT COUNT(*) as total FROM alquileres');
    const totalPagos = await query('SELECT COUNT(*) as total FROM pagos');
    const totalSeguros = await query('SELECT COUNT(*) as total FROM seguros_vehiculo');
    const totalLlamadas = await query('SELECT COUNT(*) as total FROM llamadas_reservas');
    
    console.log(`   📊 Total de registros:`);
    console.log(`      - Vehículos: ${totalVehiculos.rows[0].total}`);
    console.log(`      - Clientes: ${totalClientes.rows[0].total}`);
    console.log(`      - Reservas: ${totalReservas.rows[0].total}`);
    console.log(`      - Alquileres: ${totalAlquileres.rows[0].total}`);
    console.log(`      - Pagos: ${totalPagos.rows[0].total}`);
    console.log(`      - Seguros: ${totalSeguros.rows[0].total}`);
    console.log(`      - Llamadas: ${totalLlamadas.rows[0].total}`);
    
    console.log('\n🎯 Base de datos verificada correctamente');
    
  } catch (error) {
    console.error('❌ Error verificando base de datos:', error.message);
  }
}

if (require.main === module) {
  verifyDatabaseIntegrity();
}

module.exports = { verifyDatabaseIntegrity }; 