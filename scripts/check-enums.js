require('dotenv').config();
const { query } = require('../src/config/database');

async function checkEnums() {
  try {
    console.log('🔍 Verificando enums...\n');
    
    // Verificar enum de transmisión
    console.log('📋 ENUM TRANSMISIÓN:');
    console.log('=' .repeat(80));
    try {
      const transmisionResult = await query(`
        SELECT unnest(enum_range(NULL::transmision_enum)) as valor
      `);
      console.log('Valores válidos:');
      transmisionResult.rows.forEach(row => {
        console.log(`  - ${row.valor}`);
      });
    } catch (error) {
      console.log(`❌ Error verificando transmision_enum: ${error.message}`);
    }
    
    // Verificar enum de condición
    console.log('\n📋 ENUM CONDICIÓN:');
    console.log('=' .repeat(80));
    try {
      const condicionResult = await query(`
        SELECT unnest(enum_range(NULL::condicion_enum)) as valor
      `);
      console.log('Valores válidos:');
      condicionResult.rows.forEach(row => {
        console.log(`  - ${row.valor}`);
      });
    } catch (error) {
      console.log(`❌ Error verificando condicion_enum: ${error.message}`);
    }
    
    // Verificar enum de estado de vehículo
    console.log('\n📋 ENUM ESTADO VEHÍCULO:');
    console.log('=' .repeat(80));
    try {
      const estadoResult = await query(`
        SELECT unnest(enum_range(NULL::estado_vehiculo_enum)) as valor
      `);
      console.log('Valores válidos:');
      estadoResult.rows.forEach(row => {
        console.log(`  - ${row.valor}`);
      });
    } catch (error) {
      console.log(`❌ Error verificando estado_vehiculo_enum: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error verificando enums:', error.message);
  } finally {
    process.exit(0);
  }
}

checkEnums(); 