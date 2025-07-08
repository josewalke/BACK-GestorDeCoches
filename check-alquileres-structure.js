const { query } = require('./src/config/database');

async function checkAlquileresStructure() {
  try {
    console.log('🔍 Estructura de la tabla alquileres:');
    const structure = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'alquileres'
      ORDER BY ordinal_position
    `);
    structure.rows.forEach((col, i) => {
      console.log(`${i + 1}. ${col.column_name} (${col.data_type}) - Nullable: ${col.is_nullable}`);
    });
    const ejemplos = await query('SELECT * FROM alquileres LIMIT 2');
    console.log('\nEjemplos:');
    ejemplos.rows.forEach((row, i) => {
      console.log(`${i + 1}.`, row);
    });
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    process.exit(0);
  }
}
checkAlquileresStructure(); 