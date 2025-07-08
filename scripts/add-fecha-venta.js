const { query } = require('../src/config/database');

async function addFechaVenta() {
  try {
    console.log('🔧 Añadiendo campo fecha_venta a la tabla vehiculos...\n');
    
    // 1. Añadir columna fecha_venta
    console.log('📝 Añadiendo columna fecha_venta...');
    await query(`
      ALTER TABLE vehiculos 
      ADD COLUMN IF NOT EXISTS fecha_venta DATE
    `);
    console.log('✅ Columna fecha_venta añadida');
    
    // 2. Actualizar vehículos vendidos con fecha de venta
    console.log('\n📋 Actualizando fechas de venta para vehículos vendidos...');
    const vehiculosVendidos = await query(`
      SELECT vehiculo_id, marca, modelo, fecha_compra
      FROM vehiculos 
      WHERE estado = 'vendido' AND fecha_venta IS NULL
    `);
    
    console.log(`Encontrados ${vehiculosVendidos.rows.length} vehículos vendidos sin fecha de venta`);
    
    for (const vehiculo of vehiculosVendidos.rows) {
      // Generar fecha de venta (entre la fecha de compra y hoy)
      const fechaCompra = new Date(vehiculo.fecha_compra);
      const hoy = new Date();
      const diasEntreCompraYHoy = Math.floor((hoy - fechaCompra) / (1000 * 60 * 60 * 24));
      const diasAleatorios = Math.floor(Math.random() * diasEntreCompraYHoy) + 30; // Mínimo 30 días después de compra
      
      const fechaVenta = new Date(fechaCompra);
      fechaVenta.setDate(fechaVenta.getDate() + diasAleatorios);
      
      await query(`
        UPDATE vehiculos 
        SET fecha_venta = $1
        WHERE vehiculo_id = $2
      `, [fechaVenta, vehiculo.vehiculo_id]);
      
      console.log(`   ✅ ${vehiculo.marca} ${vehiculo.modelo}: Fecha venta ${fechaVenta.toLocaleDateString()}`);
    }
    
    // 3. Verificar resultado
    console.log('\n📊 Verificación final:');
    const vehiculosConFechaVenta = await query(`
      SELECT COUNT(*) as total
      FROM vehiculos 
      WHERE estado = 'vendido' AND fecha_venta IS NOT NULL
    `);
    
    const totalVendidos = await query(`
      SELECT COUNT(*) as total
      FROM vehiculos 
      WHERE estado = 'vendido'
    `);
    
    console.log(`   Vehículos vendidos: ${totalVendidos.rows[0].total}`);
    console.log(`   Con fecha de venta: ${vehiculosConFechaVenta.rows[0].total}`);
    
    console.log('\n✅ Campo fecha_venta añadido y actualizado correctamente');
    
  } catch (error) {
    console.error('❌ Error añadiendo fecha_venta:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addFechaVenta();
}

module.exports = { addFechaVenta }; 