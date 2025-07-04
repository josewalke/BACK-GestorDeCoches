require('dotenv').config();
const { query } = require('./database-pg');

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estructura de las tablas...\n');
    
    // Verificar estructura de alquileres
    console.log('📋 Estructura de tabla alquileres:');
    const alquileresStructure = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'alquileres'
      ORDER BY ordinal_position
    `);
    
    alquileresStructure.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log('\n📋 Estructura de tabla reservas:');
    const reservasStructure = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'reservas'
      ORDER BY ordinal_position
    `);
    
    reservasStructure.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log('\n📋 Estructura de tabla mantenimientos:');
    const mantenimientosStructure = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'mantenimientos'
      ORDER BY ordinal_position
    `);
    
    mantenimientosStructure.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('❌ Error verificando estructura:', error.message);
  }
}

if (require.main === module) {
  checkTableStructure();
}

module.exports = { checkTableStructure }; 
checkTableStructure(); 