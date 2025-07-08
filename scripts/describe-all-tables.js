const { query } = require('../src/config/database');

async function describeAllTables() {
  try {
    console.log('🔍 Listando todas las tablas y sus columnas...\n');
    // Listar todas las tablas del esquema público
    const tablas = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    for (const t of tablas.rows) {
      console.log(`\n📦 Tabla: ${t.table_name}`);
      const columnas = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [t.table_name]);
      columnas.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})${col.column_default ? ' [default: ' + col.column_default + ']' : ''}`);
      });
    }
  } catch (error) {
    console.error('❌ Error listando tablas:', error.message);
  }
}

if (require.main === module) {
  describeAllTables();
}

module.exports = { describeAllTables }; 