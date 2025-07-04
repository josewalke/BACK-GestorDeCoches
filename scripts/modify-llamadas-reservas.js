require('dotenv').config();
const { query } = require('./database-pg');

async function modifyLlamadasReservas() {
  try {
    console.log('🔧 Modificando tabla llamadas_reservas...');
    
    // Eliminar los campos que no interesan
    console.log('🗑️ Eliminando campo operador_id...');
    await query('ALTER TABLE llamadas_reservas DROP COLUMN IF EXISTS operador_id');
    
    console.log('🗑️ Eliminando campo fecha_llamada...');
    await query('ALTER TABLE llamadas_reservas DROP COLUMN IF EXISTS fecha_llamada');
    
    console.log('✅ Campos eliminados exitosamente');
    
    // Mostrar la nueva estructura de la tabla
    console.log('\n📋 Nueva estructura de la tabla llamadas_reservas:');
    const structure = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'llamadas_reservas' 
      ORDER BY ordinal_position
    `);
    
    structure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Verificar cuántos registros quedan
    const count = await query('SELECT COUNT(*) as total FROM llamadas_reservas');
    console.log(`\n📊 Registros en la tabla: ${count.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Error modificando tabla:', error.message);
  }
}

if (require.main === module) {
  modifyLlamadasReservas();
}

module.exports = { modifyLlamadasReservas }; 