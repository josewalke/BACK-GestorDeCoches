const { query } = require('../src/config/database');

async function checkVehicleFields() {
  try {
    console.log('🔍 Verificando campos de la tabla vehiculos...\n');
    
    // Verificar estructura de la tabla
    const structure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'vehiculos'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Campos de la tabla vehiculos:');
    structure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Verificar si existe campo de fecha de venta
    const fechaVenta = structure.rows.find(col => col.column_name === 'fecha_venta');
    if (fechaVenta) {
      console.log('\n✅ Campo fecha_venta existe');
    } else {
      console.log('\n❌ Campo fecha_venta NO existe');
    }
    
    // Verificar algunos registros de vehículos vendidos
    console.log('\n📋 Ejemplo de vehículos vendidos:');
    const vehiculosVendidos = await query(`
      SELECT vehiculo_id, marca, modelo, matricula, estado, fecha_compra, fecha_matricula
      FROM vehiculos 
      WHERE estado = 'vendido'
      LIMIT 3
    `);
    
    vehiculosVendidos.rows.forEach(v => {
      console.log(`   - ${v.marca} ${v.modelo} (${v.matricula})`);
      console.log(`     Fecha compra: ${v.fecha_compra}`);
      console.log(`     Fecha matriculación: ${v.fecha_matricula}`);
    });
    
  } catch (error) {
    console.error('❌ Error verificando campos:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkVehicleFields();
}

module.exports = { checkVehicleFields }; 