const { query } = require('../src/config/database');

async function cleanFuelColumns() {
  try {
    console.log('🧹 Limpiando estructura de columnas de combustible...');
    
    // Verificar columnas existentes
    const columns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'alquileres' 
      AND (column_name LIKE '%combustible%' OR column_name LIKE '%nivel%')
      ORDER BY column_name
    `);
    
    console.log('📋 Columnas actuales:');
    columns.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });
    
    // Eliminar columnas temporales si existen
    const tmpColumns = columns.rows.filter(c => c.column_name.includes('_tmp'));
    if (tmpColumns.length > 0) {
      console.log('\n🗑️ Eliminando columnas temporales...');
      for (const col of tmpColumns) {
        await query(`ALTER TABLE alquileres DROP COLUMN IF EXISTS ${col.column_name};`);
        console.log(`   ✅ Eliminada: ${col.column_name}`);
      }
    }
    
    // Asegurar que las columnas principales tengan el tipo correcto
    console.log('\n🔧 Asegurando tipo correcto en columnas principales...');
    
    // Verificar si existen las columnas principales
    const mainColumns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'alquileres' 
      AND (column_name = 'nivel_combustible_salida' OR column_name = 'nivel_combustible_entrada')
    `);
    
    if (mainColumns.rows.length === 0) {
      console.log('➕ Creando columnas principales...');
      await query(`ALTER TABLE alquileres ADD COLUMN nivel_combustible_salida VARCHAR(10);`);
      await query(`ALTER TABLE alquileres ADD COLUMN nivel_combustible_entrada VARCHAR(10);`);
      console.log('✅ Columnas principales creadas');
    } else {
      console.log('✅ Las columnas principales ya existen');
    }
    
    // Verificar estructura final
    const finalColumns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'alquileres' 
      AND (column_name = 'nivel_combustible_salida' OR column_name = 'nivel_combustible_entrada')
      ORDER BY column_name
    `);
    
    console.log('\n📋 Estructura final limpia:');
    finalColumns.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n💡 Ahora puedes usar: 1/4, 1/2, 3/4, 4/4');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanFuelColumns(); 