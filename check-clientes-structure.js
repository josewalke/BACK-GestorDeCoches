const { query } = require('./src/config/database');

async function checkClientesStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla clientes...');
    
    // Verificar estructura de la tabla clientes
    const structureResult = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'clientes'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estructura de la tabla clientes:');
    structureResult.rows.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name} (${col.data_type}) - Nullable: ${col.is_nullable}`);
    });
    
    // Verificar algunos clientes de ejemplo
    const clientesResult = await query(`
      SELECT * FROM clientes LIMIT 3
    `);
    
    console.log('\n👥 Ejemplos de clientes:');
    clientesResult.rows.forEach((cliente, index) => {
      console.log(`${index + 1}. ${JSON.stringify(cliente, null, 2)}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkClientesStructure(); 