require('dotenv').config();
const { query } = require('./database-pg');

async function checkEnums() {
  try {
    console.log('🔍 Verificando tipos enum en la base de datos...\n');
    
    // Verificar enum estado_entrega_enum
    const estadoEntrega = await query(`
      SELECT unnest(enum_range(NULL::estado_entrega_enum)) as valor
    `);
    console.log('📋 Valores válidos para estado_entrega_enum:');
    estadoEntrega.rows.forEach(row => {
      console.log(`   - ${row.valor}`);
    });
    
    // Verificar enum estado_devolucion_enum
    const estadoDevolucion = await query(`
      SELECT unnest(enum_range(NULL::estado_devolucion_enum)) as valor
    `);
    console.log('\n📋 Valores válidos para estado_devolucion_enum:');
    estadoDevolucion.rows.forEach(row => {
      console.log(`   - ${row.valor}`);
    });
    
    // Verificar enum metodo_pago_enum
    const metodoPago = await query(`
      SELECT unnest(enum_range(NULL::metodo_pago_enum)) as valor
    `);
    console.log('\n📋 Valores válidos para metodo_pago_enum:');
    metodoPago.rows.forEach(row => {
      console.log(`   - ${row.valor}`);
    });
    
    // Verificar enum estado_alquiler_enum
    const estadoAlquiler = await query(`
      SELECT unnest(enum_range(NULL::estado_alquiler_enum)) as valor
    `);
    console.log('\n📋 Valores válidos para estado_alquiler_enum:');
    estadoAlquiler.rows.forEach(row => {
      console.log(`   - ${row.valor}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkEnums(); 