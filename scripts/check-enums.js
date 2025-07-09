require('dotenv').config();
const { query } = require('../src/config/database');

async function checkEnums() {
  try {
    console.log('🔍 Verificando enums en la base de datos...\n');

    // Verificar enum estado_entrega_enum
    const estadoEntregaResult = await query(`
      SELECT unnest(enum_range(NULL::estado_entrega_enum)) as valores
    `);
    
    console.log('📋 Valores del enum estado_entrega_enum:');
    estadoEntregaResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.valores}`);
    });
    console.log('');

    // Verificar enum estado_devolucion_enum
    const estadoDevolucionResult = await query(`
      SELECT unnest(enum_range(NULL::estado_devolucion_enum)) as valores
    `);
    
    console.log('📋 Valores del enum estado_devolucion_enum:');
    estadoDevolucionResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.valores}`);
    });
    console.log('');

    // Verificar enum estado_vehiculo_enum
    const estadoVehiculoResult = await query(`
      SELECT unnest(enum_range(NULL::estado_vehiculo_enum)) as valores
    `);
    
    console.log('📋 Valores del enum estado_vehiculo_enum:');
    estadoVehiculoResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.valores}`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Error verificando enums:', error.message);
  } finally {
    process.exit(0);
  }
}

checkEnums(); 