const { query } = require('../src/config/database');

async function updateFuelData() {
  try {
    console.log('🔄 Actualizando datos de combustible a fracciones...');
    
    // Verificar datos actuales
    const currentData = await query(`
      SELECT alquiler_id, nivel_combustible_salida, nivel_combustible_entrada 
      FROM alquileres 
      WHERE nivel_combustible_salida IS NOT NULL OR nivel_combustible_entrada IS NOT NULL
      LIMIT 10
    `);
    
    console.log('📋 Datos actuales (primeros 10 registros):');
    currentData.rows.forEach(row => {
      console.log(`   ID ${row.alquiler_id}: Salida=${row.nivel_combustible_salida}, Entrada=${row.nivel_combustible_entrada}`);
    });
    
    // Función para convertir porcentaje a fracción
    function percentageToFraction(percentage) {
      if (!percentage) return null;
      
      const num = parseFloat(percentage);
      if (isNaN(num)) return null;
      
      if (num <= 25) return '1/4';
      if (num <= 50) return '1/2';
      if (num <= 75) return '3/4';
      return '4/4';
    }
    
    // Actualizar datos existentes
    console.log('\n🔄 Convirtiendo datos existentes...');
    
    const allData = await query(`
      SELECT alquiler_id, nivel_combustible_salida, nivel_combustible_entrada 
      FROM alquileres 
      WHERE nivel_combustible_salida IS NOT NULL OR nivel_combustible_entrada IS NOT NULL
    `);
    
    let updatedCount = 0;
    
    for (const row of allData.rows) {
      const newSalida = percentageToFraction(row.nivel_combustible_salida);
      const newEntrada = percentageToFraction(row.nivel_combustible_entrada);
      
      if (newSalida !== row.nivel_combustible_salida || newEntrada !== row.nivel_combustible_entrada) {
        await query(`
          UPDATE alquileres 
          SET nivel_combustible_salida = $1, nivel_combustible_entrada = $2 
          WHERE alquiler_id = $3
        `, [newSalida, newEntrada, row.alquiler_id]);
        
        updatedCount++;
        console.log(`   ✅ ID ${row.alquiler_id}: ${row.nivel_combustible_salida} → ${newSalida}, ${row.nivel_combustible_entrada} → ${newEntrada}`);
      }
    }
    
    console.log(`\n✅ Actualizados ${updatedCount} registros`);
    
    // Verificar datos finales
    const finalData = await query(`
      SELECT alquiler_id, nivel_combustible_salida, nivel_combustible_entrada 
      FROM alquileres 
      WHERE nivel_combustible_salida IS NOT NULL OR nivel_combustible_entrada IS NOT NULL
      LIMIT 10
    `);
    
    console.log('\n📋 Datos finales (primeros 10 registros):');
    finalData.rows.forEach(row => {
      console.log(`   ID ${row.alquiler_id}: Salida=${row.nivel_combustible_salida}, Entrada=${row.nivel_combustible_entrada}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateFuelData(); 