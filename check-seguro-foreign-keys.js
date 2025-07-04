require('dotenv').config();
const { query } = require('./database-pg');

async function checkSeguroForeignKeys() {
  try {
    console.log('🔍 Verificando si seguro_id se usa como clave foránea en otras tablas...\n');
    
    // Buscar todas las claves foráneas que referencian a seguros_vehiculo
    const foreignKeys = await query(`
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'seguros_vehiculo'
        AND ccu.column_name = 'seguro_id'
    `);
    
    if (foreignKeys.rows.length > 0) {
      console.log('📋 Tablas que usan seguro_id como clave foránea:');
      foreignKeys.rows.forEach(fk => {
        console.log(`   - ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    } else {
      console.log('✅ No se encontraron tablas que usen seguro_id como clave foránea.');
    }
    
    // También verificar si hay alguna referencia en el código o estructura
    console.log('\n🔍 Verificando estructura de todas las tablas para referencias a seguros...');
    
    const allTables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    for (const table of allTables.rows) {
      const columns = await query(`
        SELECT column_name, data_type
        FROM information_schema.columns 
        WHERE table_name = '${table.table_name}'
        AND column_name LIKE '%seguro%'
        ORDER BY ordinal_position
      `);
      
      if (columns.rows.length > 0) {
        console.log(`\n📋 Tabla ${table.table_name} tiene columnas relacionadas con seguros:`);
        columns.rows.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSeguroForeignKeys(); 