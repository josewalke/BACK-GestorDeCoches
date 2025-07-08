const { query } = require('./src/config/database');

async function checkEnums() {
  try {
    console.log('🔍 Verificando valores de enums...');
    
    // Verificar enum de transmisión
    const transmisionEnum = await query(`
      SELECT unnest(enum_range(NULL::transmision_enum)) as valor
    `);
    console.log('📋 Valores válidos para transmision_enum:');
    transmisionEnum.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.valor}`);
    });
    
    // Verificar enum de condición
    const condicionEnum = await query(`
      SELECT unnest(enum_range(NULL::condicion_enum)) as valor
    `);
    console.log('\n📋 Valores válidos para condicion_enum:');
    condicionEnum.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.valor}`);
    });
    
    // Verificar enum de estado
    const estadoEnum = await query(`
      SELECT unnest(enum_range(NULL::estado_vehiculo_enum)) as valor
    `);
    console.log('\n📋 Valores válidos para estado_vehiculo_enum:');
    estadoEnum.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.valor}`);
    });
    
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    process.exit(0);
  }
}
checkEnums(); 