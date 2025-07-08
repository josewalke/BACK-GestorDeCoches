require('dotenv').config();
const { query } = require('../src/config/database');

async function verificarDatos() {
  try {
    console.log('🔍 Verificando datos en la base de datos...\n');
    
    // Verificar vehículos
    const vehiculos = await query('SELECT COUNT(*) as total FROM vehiculos');
    console.log(`🚗 Total de vehículos: ${vehiculos.rows[0].total}`);
    
    // Verificar estados
    const estados = await query('SELECT estado, COUNT(*) as cantidad FROM vehiculos GROUP BY estado ORDER BY cantidad DESC');
    console.log('\n📊 Estados de vehículos:');
    estados.rows.forEach(row => {
      console.log(`   ${row.estado}: ${row.cantidad}`);
    });
    
    // Verificar marcas
    const marcas = await query('SELECT marca, COUNT(*) as cantidad FROM vehiculos GROUP BY marca ORDER BY cantidad DESC');
    console.log('\n🏷️ Marcas de vehículos:');
    marcas.rows.forEach(row => {
      console.log(`   ${row.marca}: ${row.cantidad}`);
    });
    
    // Verificar usuarios
    const usuarios = await query('SELECT COUNT(*) as total FROM usuarios');
    console.log(`\n👥 Total de usuarios: ${usuarios.rows[0].total}`);
    
    // Verificar clientes
    const clientes = await query('SELECT COUNT(*) as total FROM clientes');
    console.log(`👤 Total de clientes: ${clientes.rows[0].total}`);
    
    // Verificar categorías
    const categorias = await query('SELECT COUNT(*) as total FROM categorias_vehiculo');
    console.log(`📋 Total de categorías: ${categorias.rows[0].total}`);
    
    // Verificar ubicaciones
    const ubicaciones = await query('SELECT COUNT(*) as total FROM ubicaciones');
    console.log(`📍 Total de ubicaciones: ${ubicaciones.rows[0].total}`);
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error verificando datos:', error.message);
  }
}

verificarDatos(); 