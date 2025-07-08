const { query } = require('../src/config/database');

async function changeFuelType() {
  try {
    console.log('🔄 Cambiando tipo de datos de las columnas de combustible...');
    
    // Cambiar el tipo de datos de las columnas existentes
    await query(`
      ALTER TABLE alquileres 
      ALTER COLUMN nivel_combustible_salida TYPE VARCHAR(10),
      ALTER COLUMN nivel_combustible_entrada TYPE VARCHAR(10);
    `);
    
    console.log('✅ Tipo de datos cambiado a VARCHAR(10)');
    console.log('💡 Ahora puedes almacenar: 1/4, 1/2, 3/4, 4/4');
    
    // Verificar el cambio
    const structure = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'alquileres' 
      AND (column_name = 'nivel_combustible_salida' OR column_name = 'nivel_combustible_entrada')
    `);
    
    console.log('\n📋 Estructura actualizada:');
    structure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cambiar tipo de datos:', error.message);
    process.exit(1);
  }
}

changeFuelType(); 