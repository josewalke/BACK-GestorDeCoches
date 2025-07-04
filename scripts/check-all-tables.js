require('dotenv').config();
const { query } = require('./database-pg');

async function checkAllTables() {
  try {
    console.log('🔍 Verificando todas las tablas de la base de datos...\n');
    
    // Obtener todas las tablas
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas encontradas:');
    tables.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    console.log(`\n📊 Total de tablas: ${tables.rows.length}\n`);
    
    // Verificar contenido de cada tabla
    for (const table of tables.rows) {
      const tableName = table.table_name;
      
      try {
        const count = await query(`SELECT COUNT(*) as total FROM ${tableName}`);
        const total = count.rows[0].total;
        
        console.log(`📈 ${tableName}: ${total} registros`);
        
        // Si la tabla está vacía, mostrar su estructura
        if (total === 0) {
          const structure = await query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = '${tableName}' 
            ORDER BY ordinal_position
          `);
          
          console.log(`   ⚠️  Tabla vacía - Estructura:`);
          structure.rows.forEach(col => {
            console.log(`      ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
          });
        }
        
      } catch (error) {
        console.log(`   ❌ Error verificando ${tableName}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAllTables(); 