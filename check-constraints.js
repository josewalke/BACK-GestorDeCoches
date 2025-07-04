require('dotenv').config();
const { query } = require('./database-pg');

async function checkConstraints() {
  try {
    console.log('🔍 Verificando restricciones de las tablas...\n');
    
    // Verificar restricciones de alquileres
    const alquileresConstraints = await query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'alquileres'::regclass
    `);
    
    console.log('📋 Restricciones de la tabla alquileres:');
    alquileresConstraints.rows.forEach(constraint => {
      console.log(`   ${constraint.conname}: ${constraint.definition}`);
    });
    
    // Verificar estructura de alquileres
    const alquileresStructure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'alquileres' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estructura de alquileres:');
    alquileresStructure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}) ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkConstraints(); 