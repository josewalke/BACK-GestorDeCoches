const { query } = require('./src/config/database');

async function checkCategoriasStructure() {
  try {
    console.log('🔍 Estructura de la tabla categorias_vehiculo:');
    const structure = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'categorias_vehiculo'
      ORDER BY ordinal_position
    `);
    structure.rows.forEach((col, i) => {
      console.log(`${i + 1}. ${col.column_name} (${col.data_type}) - Nullable: ${col.is_nullable}`);
    });
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    process.exit(0);
  }
}
checkCategoriasStructure(); 