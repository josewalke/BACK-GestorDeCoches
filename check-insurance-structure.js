require('dotenv').config();
const { query } = require('./database-pg');

async function checkInsuranceStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla seguros_vehiculo...\n');
    
    const estructura = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'seguros_vehiculo' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Columnas de la tabla seguros_vehiculo:');
    estructura.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    console.log(`\n📊 Total de columnas: ${estructura.rows.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkInsuranceStructure(); 