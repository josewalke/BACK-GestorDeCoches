require('dotenv').config();
const { query } = require('../src/config/database');

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla alquileres...');
    
    const structure = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'alquileres'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estructura de la tabla alquileres:');
    structure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Verificar si hay datos
    const count = await query(`SELECT COUNT(*) as total FROM alquileres`);
    console.log(`\n📊 Total de registros: ${count.rows[0].total}`);
    
    if (count.rows[0].total > 0) {
      const sample = await query(`SELECT * FROM alquileres LIMIT 1`);
      console.log('\n📋 Columnas disponibles en el primer registro:');
      Object.keys(sample.rows[0]).forEach(key => {
        console.log(`   ${key}: ${sample.rows[0][key]}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  checkTableStructure();
}

module.exports = { checkTableStructure }; 
checkTableStructure(); 