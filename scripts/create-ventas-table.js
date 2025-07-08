const { query } = require('../src/config/database');

async function createVentasTable() {
  try {
    console.log('🔧 Creando tabla ventas...\n');
    
    // 1. Crear tabla ventas
    console.log('📝 Creando tabla ventas...');
    await query(`
      CREATE TABLE IF NOT EXISTS ventas (
        venta_id SERIAL PRIMARY KEY,
        vehiculo_id INTEGER NOT NULL REFERENCES vehiculos(vehiculo_id),
        fecha_venta DATE NOT NULL,
        monto_venta NUMERIC(10,2) NOT NULL,
        metodo_pago VARCHAR(50) NOT NULL,
        cliente_comprador VARCHAR(100),
        notas TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla ventas creada');
    
    // 2. Crear índices para mejor rendimiento
    console.log('\n📋 Creando índices...');
    await query(`
      CREATE INDEX IF NOT EXISTS idx_ventas_vehiculo_id ON ventas(vehiculo_id)
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha_venta)
    `);
    console.log('✅ Índices creados');
    
    // 3. Migrar datos existentes de vehículos vendidos
    console.log('\n📋 Migrando datos existentes...');
    const vehiculosVendidos = await query(`
      SELECT vehiculo_id, fecha_venta, precio_venta_total
      FROM vehiculos 
      WHERE estado = 'vendido' AND fecha_venta IS NOT NULL
    `);
    
    console.log(`Encontrados ${vehiculosVendidos.rows.length} vehículos vendidos para migrar`);
    
    const metodosPago = ['Efectivo', 'Tarjeta de crédito', 'Transferencia bancaria', 'Financiación'];
    
    for (const vehiculo of vehiculosVendidos.rows) {
      const metodoPago = metodosPago[Math.floor(Math.random() * metodosPago.length)];
      
      await query(`
        INSERT INTO ventas (vehiculo_id, fecha_venta, monto_venta, metodo_pago, cliente_comprador)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        vehiculo.vehiculo_id,
        vehiculo.fecha_venta,
        vehiculo.precio_venta_total,
        metodoPago,
        `Cliente ${Math.floor(Math.random() * 100) + 1}`
      ]);
      
      console.log(`   ✅ Migrado: Vehículo ${vehiculo.vehiculo_id} - ${metodoPago}`);
    }
    
    // 4. Verificar migración
    console.log('\n📊 Verificación de migración:');
    const ventasCreadas = await query(`
      SELECT COUNT(*) as total_ventas
      FROM ventas
    `);
    
    const vehiculosVendidosCount = await query(`
      SELECT COUNT(*) as total_vendidos
      FROM vehiculos 
      WHERE estado = 'vendido'
    `);
    
    console.log(`   Ventas en tabla ventas: ${ventasCreadas.rows[0].total_ventas}`);
    console.log(`   Vehículos vendidos: ${vehiculosVendidosCount.rows[0].total_vendidos}`);
    
    // 5. Mostrar ejemplo de datos
    console.log('\n📋 Ejemplo de ventas creadas:');
    const ejemploVentas = await query(`
      SELECT v.venta_id, v.fecha_venta, v.monto_venta, v.metodo_pago, v.cliente_comprador,
             veh.marca, veh.modelo, veh.matricula
      FROM ventas v
      JOIN vehiculos veh ON v.vehiculo_id = veh.vehiculo_id
      LIMIT 3
    `);
    
    ejemploVentas.rows.forEach(venta => {
      console.log(`   - ${venta.marca} ${venta.modelo} (${venta.matricula})`);
      console.log(`     Fecha: ${venta.fecha_venta}`);
      console.log(`     Monto: €${venta.monto_venta?.toLocaleString()}`);
      console.log(`     Método: ${venta.metodo_pago}`);
      console.log(`     Cliente: ${venta.cliente_comprador}`);
      console.log('');
    });
    
    console.log('✅ Tabla ventas creada y datos migrados correctamente');
    console.log('💡 Ahora puedes eliminar fecha_venta de la tabla vehiculos si lo deseas');
    
  } catch (error) {
    console.error('❌ Error creando tabla ventas:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createVentasTable();
}

module.exports = { createVentasTable }; 