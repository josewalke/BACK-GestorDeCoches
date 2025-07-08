const { query } = require('../src/config/database');

async function checkAndFixColumns() {
  try {
    console.log('🔍 Verificando estructura actual de la tabla alquileres...');
    
    // Verificar qué columnas existen
    const columns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'alquileres' 
      AND (column_name LIKE '%combustible%' OR column_name LIKE '%nivel%')
      ORDER BY column_name
    `);
    
    console.log('📋 Columnas relacionadas con combustible:');
    if (columns.rows.length === 0) {
      console.log('   No se encontraron columnas de combustible');
    } else {
      columns.rows.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type}`);
      });
    }
    
    // Verificar si existen las columnas que necesitamos
    const needSalida = !columns.rows.find(c => c.column_name === 'nivel_combustible_salida');
    const needEntrada = !columns.rows.find(c => c.column_name === 'nivel_combustible_entrada');
    
    if (needSalida || needEntrada) {
      console.log('\n➕ Creando columnas faltantes...');
      
      if (needSalida) {
        await query(`ALTER TABLE alquileres ADD COLUMN nivel_combustible_salida VARCHAR(10);`);
        console.log('✅ Columna nivel_combustible_salida creada');
      }
      
      if (needEntrada) {
        await query(`ALTER TABLE alquileres ADD COLUMN nivel_combustible_entrada VARCHAR(10);`);
        console.log('✅ Columna nivel_combustible_entrada creada');
      }
      
      console.log('\n💡 Ahora puedes almacenar: 1/4, 1/2, 3/4, 4/4');
    } else {
      console.log('\n✅ Las columnas ya existen');
    }
    
    // Verificar estructura final
    const finalColumns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'alquileres' 
      AND (column_name = 'nivel_combustible_salida' OR column_name = 'nivel_combustible_entrada')
      ORDER BY column_name
    `);
    
    console.log('\n📋 Estructura final:');
    finalColumns.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndFixColumns(); 