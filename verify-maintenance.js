require('dotenv').config();
const { query } = require('./database-pg');

async function verifyMaintenance() {
  try {
    console.log('🔧 Verificando mantenimientos en la base de datos...\n');
    
    const mantenimientos = await query(`
      SELECT 
        m.mantenimiento_id, 
        v.marca, 
        v.modelo, 
        v.matricula, 
        m.descripcion, 
        m.coste, 
        m.proveedor, 
        m.fecha_servicio 
      FROM mantenimientos m 
      JOIN vehiculos v ON m.vehiculo_id = v.vehiculo_id 
      ORDER BY m.mantenimiento_id
    `);
    
    console.log(`📊 Total de mantenimientos: ${mantenimientos.rows.length}\n`);
    
    mantenimientos.rows.forEach((m, i) => {
      console.log(`${i+1}. ${m.marca} ${m.modelo} (${m.matricula})`);
      console.log(`   Descripción: ${m.descripcion}`);
      console.log(`   Proveedor: ${m.proveedor}`);
      console.log(`   Costo: €${m.coste.toLocaleString()}`);
      console.log(`   Fecha: ${m.fecha_servicio}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyMaintenance(); 