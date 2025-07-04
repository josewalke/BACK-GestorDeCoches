require('dotenv').config();
const { query } = require('./database-pg');

async function checkVehicles() {
  try {
    console.log('🔍 Verificando vehículos en la base de datos...\n');
    
    // Obtener todos los vehículos
    const vehiculos = await query('SELECT vehiculo_id, marca, modelo, matricula, estado FROM vehiculos ORDER BY vehiculo_id');
    
    console.log(`📊 Total de vehículos: ${vehiculos.rows.length}\n`);
    
    // Mostrar todos los vehículos
    vehiculos.rows.forEach((v, i) => {
      const estadoIcon = {
        'disponible': '✅',
        'alquilado': '🚗',
        'taller': '🔧',
        'vendido': '💰'
      }[v.estado] || '❓';
      
      console.log(`${i+1}. ID: ${v.vehiculo_id} - ${v.marca} ${v.modelo} (${v.matricula}) - Estado: ${estadoIcon} ${v.estado}`);
    });
    
    // Contar por estado
    const estados = {};
    vehiculos.rows.forEach(v => {
      estados[v.estado] = (estados[v.estado] || 0) + 1;
    });
    
    console.log('\n📈 Distribución por estado:');
    Object.entries(estados).forEach(([estado, cantidad]) => {
      console.log(`   ${estado}: ${cantidad} vehículos`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkVehicles(); 