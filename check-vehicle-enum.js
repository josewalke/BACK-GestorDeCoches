require('dotenv').config();
const { query } = require('./database-pg');

async function checkVehicleEnum() {
  try {
    console.log('🔍 Verificando valores válidos para estado_vehiculo_enum...\n');
    
    // Verificar enum estado_vehiculo_enum
    const vehicleStates = await query(`
      SELECT unnest(enum_range(NULL::estado_vehiculo_enum)) as valor
    `);
    
    console.log('📋 Valores válidos para estado_vehiculo_enum:');
    vehicleStates.rows.forEach(state => {
      console.log(`   - ${state.valor}`);
    });
    
    // Mostrar estado actual de los vehículos
    console.log('\n📊 Estado actual de los vehículos:');
    const currentStates = await query(`
      SELECT estado, COUNT(*) as total
      FROM vehiculos
      GROUP BY estado
      ORDER BY total DESC
    `);
    
    currentStates.rows.forEach(state => {
      console.log(`   ${state.estado}: ${state.total} vehículos`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkVehicleEnum(); 