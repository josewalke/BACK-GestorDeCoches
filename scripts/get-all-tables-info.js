const { query } = require('../src/config/database');

async function getAllTablesInfo() {
  try {
    console.log('🔍 Obteniendo información completa de todas las tablas...\n');
    
    // 1. Obtener todas las tablas del esquema público
    const tablasResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`📊 Total de tablas encontradas: ${tablasResult.rows.length}\n`);
    
    // 2. Para cada tabla, obtener información detallada
    for (const tabla of tablasResult.rows) {
      const tableName = tabla.table_name;
      console.log(`\n📦 TABLA: ${tableName.toUpperCase()}`);
      console.log('=' .repeat(50));
      
      // Obtener columnas de la tabla
      const columnasResult = await query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position
      `, [tableName]);
      
      console.log(`\n📋 CAMPOS (${columnasResult.rows.length} campos):`);
      console.log('─' .repeat(80));
      console.log('Campo'.padEnd(25) + 'Tipo'.padEnd(20) + 'Nullable'.padEnd(10) + 'Default'.padEnd(15) + 'Descripción');
      console.log('─' .repeat(80));
      
      columnasResult.rows.forEach(col => {
        const campo = col.column_name.padEnd(25);
        const tipo = col.data_type.padEnd(20);
        const nullable = (col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL').padEnd(10);
        const default_val = (col.column_default || '').padEnd(15);
        
        console.log(`${campo}${tipo}${nullable}${default_val}`);
      });
      
      // Obtener información de índices
      const indicesResult = await query(`
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename = $1
        ORDER BY indexname
      `, [tableName]);
      
      if (indicesResult.rows.length > 0) {
        console.log(`\n🔗 ÍNDICES (${indicesResult.rows.length} índices):`);
        indicesResult.rows.forEach(idx => {
          console.log(`   - ${idx.indexname}`);
        });
      }
      
      // Obtener información de constraints
      const constraintsResult = await query(`
        SELECT 
          conname as constraint_name,
          contype as constraint_type,
          pg_get_constraintdef(oid) as constraint_definition
        FROM pg_constraint 
        WHERE conrelid = $1::regclass
        ORDER BY conname
      `, [tableName]);
      
      if (constraintsResult.rows.length > 0) {
        console.log(`\n🔒 CONSTRAINTS (${constraintsResult.rows.length} constraints):`);
        constraintsResult.rows.forEach(constraint => {
          console.log(`   - ${constraint.constraint_name} (${constraint.constraint_type}): ${constraint.constraint_definition}`);
        });
      }
      
      // Obtener estadísticas de la tabla
      const statsResult = await query(`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE tablename = $1
        ORDER BY attname
      `, [tableName]);
      
      if (statsResult.rows.length > 0) {
        console.log(`\n📊 ESTADÍSTICAS DE LA TABLA:`);
        console.log(`   - Filas estimadas: ${statsResult.rows.length > 0 ? 'Disponible' : 'No disponible'}`);
      }
      
      // Obtener número de filas reales
      try {
        const countResult = await query(`SELECT COUNT(*) as total FROM ${tableName}`);
        console.log(`   - Filas actuales: ${countResult.rows[0].total}`);
      } catch (error) {
        console.log(`   - Filas actuales: Error al contar`);
      }
    }
    
    // 3. Resumen final
    console.log('\n' + '=' .repeat(80));
    console.log('📊 RESUMEN FINAL');
    console.log('=' .repeat(80));
    
    let totalCampos = 0;
    let totalIndices = 0;
    let totalConstraints = 0;
    
    for (const tabla of tablasResult.rows) {
      const tableName = tabla.table_name;
      
      const columnasResult = await query(`
        SELECT COUNT(*) as total_campos
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
      `, [tableName]);
      
      const indicesResult = await query(`
        SELECT COUNT(*) as total_indices
        FROM pg_indexes 
        WHERE tablename = $1
      `, [tableName]);
      
      const constraintsResult = await query(`
        SELECT COUNT(*) as total_constraints
        FROM pg_constraint 
        WHERE conrelid = $1::regclass
      `, [tableName]);
      
      totalCampos += parseInt(columnasResult.rows[0].total_campos);
      totalIndices += parseInt(indicesResult.rows[0].total_indices);
      totalConstraints += parseInt(constraintsResult.rows[0].total_constraints);
      
      console.log(`   ${tableName.padEnd(20)} - ${columnasResult.rows[0].total_campos} campos, ${indicesResult.rows[0].total_indices} índices, ${constraintsResult.rows[0].total_constraints} constraints`);
    }
    
    console.log('\n' + '─' .repeat(80));
    console.log(`TOTAL: ${tablasResult.rows.length} tablas, ${totalCampos} campos, ${totalIndices} índices, ${totalConstraints} constraints`);
    
  } catch (error) {
    console.error('❌ Error obteniendo información de las tablas:', error.message);
  } finally {
    process.exit(0);
  }
}

getAllTablesInfo(); 