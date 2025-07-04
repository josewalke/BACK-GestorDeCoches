require('dotenv').config();
const { query } = require('./database-pg');

async function checkTableStructures() {
  try {
    console.log('🔍 Verificando estructura de todas las tablas...\n');
    
    const tablasVacias = ['tarifas', 'reservas', 'alquileres', 'pagos', 'seguros_vehiculo'];
    
    for (const tabla of tablasVacias) {
      console.log(`📋 Estructura de la tabla ${tabla}:`);
      
      const estructura = await query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = '${tabla}' 
        ORDER BY ordinal_position
      `);
      
      estructura.rows.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
      
      console.log(`   Total columnas: ${estructura.rows.length}\n`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTableStructures(); 