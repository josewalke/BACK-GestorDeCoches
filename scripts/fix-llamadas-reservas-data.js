require('dotenv').config();
const { query } = require('./database-pg');

async function fixLlamadasReservasData() {
  try {
    console.log('🔧 Preparando datos antes de eliminar columnas...');
    
    // Primero, mostrar cuántos registros tienen datos en esos campos
    console.log('\n📊 Verificando datos existentes...');
    
    const operadorCount = await query(`
      SELECT COUNT(*) as total 
      FROM llamadas_reservas 
      WHERE operador_id IS NOT NULL
    `);
    
    const fechaCount = await query(`
      SELECT COUNT(*) as total 
      FROM llamadas_reservas 
      WHERE fecha_llamada IS NOT NULL
    `);
    
    console.log(`   Registros con operador_id: ${operadorCount.rows[0].total}`);
    console.log(`   Registros con fecha_llamada: ${fechaCount.rows[0].total}`);
    
    // Mostrar algunos ejemplos de datos que se van a perder
    console.log('\n📋 Ejemplos de datos que se van a eliminar:');
    const examples = await query(`
      SELECT llamada_id, operador_id, fecha_llamada, motivo_llamada
      FROM llamadas_reservas 
      WHERE operador_id IS NOT NULL OR fecha_llamada IS NOT NULL
      LIMIT 5
    `);
    
    examples.rows.forEach(row => {
      console.log(`   Llamada ${row.llamada_id}: Operador ${row.operador_id}, Fecha ${row.fecha_llamada}, Motivo: ${row.motivo_llamada}`);
    });
    
    // Preguntar si continuar
    console.log('\n⚠️  ¿Quieres continuar eliminando estos campos?');
    console.log('   Los datos de operador_id y fecha_llamada se perderán permanentemente.');
    
    // Por ahora, continuamos con la eliminación
    console.log('\n🗑️ Eliminando columnas...');
    
    // Eliminar las columnas
    await query('ALTER TABLE llamadas_reservas DROP COLUMN IF EXISTS operador_id');
    await query('ALTER TABLE llamadas_reservas DROP COLUMN IF EXISTS fecha_llamada');
    
    console.log('✅ Columnas eliminadas exitosamente');
    
    // Verificar la nueva estructura
    console.log('\n📋 Nueva estructura de la tabla:');
    const structure = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'llamadas_reservas' 
      ORDER BY ordinal_position
    `);
    
    structure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Verificar que los datos siguen ahí
    const count = await query('SELECT COUNT(*) as total FROM llamadas_reservas');
    console.log(`\n📊 Registros restantes: ${count.rows[0].total}`);
    
    // Mostrar algunos registros actualizados
    console.log('\n📋 Ejemplos de registros actualizados:');
    const updatedExamples = await query(`
      SELECT llamada_id, cliente_id, vehiculo_id, motivo_llamada, estado_llamada
      FROM llamadas_reservas 
      LIMIT 5
    `);
    
    updatedExamples.rows.forEach(row => {
      console.log(`   Llamada ${row.llamada_id}: Cliente ${row.cliente_id}, Vehículo ${row.vehiculo_id}, Estado: ${row.estado_llamada}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (require.main === module) {
  fixLlamadasReservasData();
}

module.exports = { fixLlamadasReservasData }; 