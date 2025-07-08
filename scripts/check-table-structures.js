require('dotenv').config();
const { query } = require('../src/config/database');

async function checkTableStructures() {
  try {
    console.log('🔍 Verificando estructuras de tablas...\n');
    
    const tables = [
      'ubicaciones',
      'categorias_vehiculo',
      'clientes',
      'vehiculos',
      'reservas',
      'alquileres',
      'mantenimientos',
      'ventas'
    ];
    
    for (const table of tables) {
      console.log(`📋 ESTRUCTURA DE ${table.toUpperCase()}:`);
      console.log('=' .repeat(80));
      
      try {
        const result = await query(`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = '${table}' 
          ORDER BY ordinal_position
        `);
        
        if (result.rows.length === 0) {
          console.log(`❌ La tabla ${table} no existe`);
        } else {
          result.rows.forEach(col => {
            console.log(`${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`);
          });
        }
      } catch (error) {
        console.log(`❌ Error verificando ${table}: ${error.message}`);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error verificando estructuras:', error.message);
  } finally {
    process.exit(0);
  }
}

checkTableStructures(); 