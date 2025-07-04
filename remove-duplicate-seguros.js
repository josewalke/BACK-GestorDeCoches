require('dotenv').config();
const { query } = require('./database-pg');

async function removeDuplicateSeguros() {
  try {
    console.log('🔍 Eliminando seguros duplicados, dejando solo el más reciente por vehículo...');

    // Eliminar todos los seguros excepto el más reciente (mayor seguro_id o created_at) por cada vehículo
    const deleteQuery = `
      DELETE FROM seguros_vehiculo sv
      USING (
        SELECT vehiculo_id, MAX(seguro_id) as max_id
        FROM seguros_vehiculo
        GROUP BY vehiculo_id
      ) sub
      WHERE sv.vehiculo_id = sub.vehiculo_id
        AND sv.seguro_id <> sub.max_id;
    `;
    const result = await query(deleteQuery);
    console.log('✅ Seguros duplicados eliminados.');

    // Mostrar resumen
    const count = await query('SELECT COUNT(*) as total FROM seguros_vehiculo');
    console.log(`Ahora hay ${count.rows[0].total} seguros (debería coincidir con el número de vehículos).`);
  } catch (error) {
    console.error('❌ Error eliminando duplicados:', error.message);
  }
}

if (require.main === module) {
  removeDuplicateSeguros();
}

module.exports = { removeDuplicateSeguros }; 