const { query } = require('../src/config/database');

async function checkAlquilerConstraints() {
  try {
    console.log('🔍 Revisando estructura de la tabla alquileres...\n');
    
    // 1. Verificar estructura de la tabla alquileres
    console.log('📋 ESTRUCTURA DE LA TABLA ALQUILERES:');
    console.log('=' .repeat(80));
    
    const estructuraResult = await query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'alquileres' 
      ORDER BY ordinal_position
    `);
    
    estructuraResult.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`);
    });
    
    // 2. Verificar si existe la tabla reservas
    console.log('\n📋 VERIFICANDO TABLA RESERVAS:');
    console.log('=' .repeat(80));
    
    const reservasExistResult = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'reservas'
      ) as existe_reservas
    `);
    
    if (reservasExistResult.rows[0].existe_reservas) {
      console.log('✅ La tabla reservas existe');
      
      // Verificar estructura de reservas
      const reservasEstructura = await query(`
        SELECT 
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'reservas' 
        ORDER BY ordinal_position
      `);
      
      console.log('\n📋 ESTRUCTURA DE LA TABLA RESERVAS:');
      reservasEstructura.rows.forEach(col => {
        console.log(`${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
      });
      
      // Verificar si hay foreign key entre alquileres y reservas
      const fkResult = await query(`
        SELECT 
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name = 'alquileres'
          AND kcu.column_name = 'reserva_id'
      `);
      
      if (fkResult.rows.length > 0) {
        console.log('\n🔗 FOREIGN KEY ENCONTRADA:');
        fkResult.rows.forEach(fk => {
          console.log(`${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });
      } else {
        console.log('\n❌ NO HAY FOREIGN KEY entre alquileres.reserva_id y reservas');
      }
      
    } else {
      console.log('❌ La tabla reservas NO existe');
    }
    
    // 3. Verificar datos en alquileres
    console.log('\n📊 DATOS EN LA TABLA ALQUILERES:');
    console.log('=' .repeat(80));
    
    const datosResult = await query(`
      SELECT 
        COUNT(*) as total_alquileres,
        COUNT(CASE WHEN reserva_id IS NOT NULL THEN 1 END) as con_reserva_id,
        COUNT(CASE WHEN reserva_id IS NULL THEN 1 END) as sin_reserva_id
      FROM alquileres
    `);
    
    const datos = datosResult.rows[0];
    console.log(`Total alquileres: ${datos.total_alquileres}`);
    console.log(`Con reserva_id: ${datos.con_reserva_id}`);
    console.log(`Sin reserva_id: ${datos.sin_reserva_id}`);
    
    // 4. Mostrar algunos ejemplos de alquileres con reserva_id
    if (datos.con_reserva_id > 0) {
      console.log('\n📋 EJEMPLOS DE ALQUILERES CON RESERVA_ID:');
      console.log('=' .repeat(80));
      
      const ejemplosResult = await query(`
        SELECT 
          alquiler_id,
          vehiculo_id,
          cliente_id,
          reserva_id,
          fecha_recogida_real,
          fecha_devolucion_real,
          estado,
          ingreso_final
        FROM alquileres 
        WHERE reserva_id IS NOT NULL 
        LIMIT 5
      `);
      
      ejemplosResult.rows.forEach(alquiler => {
        console.log(`Alquiler ID: ${alquiler.alquiler_id}`);
        console.log(`  - Vehículo ID: ${alquiler.vehiculo_id}`);
        console.log(`  - Cliente ID: ${alquiler.cliente_id}`);
        console.log(`  - Reserva ID: ${alquiler.reserva_id}`);
        console.log(`  - Estado: ${alquiler.estado}`);
        console.log(`  - Ingreso: €${alquiler.ingreso_final?.toLocaleString() || '0'}`);
        console.log('');
      });
    }
    
    // 5. Verificar si los reserva_id existen en la tabla reservas
    if (reservasExistResult.rows[0].existe_reservas && datos.con_reserva_id > 0) {
      console.log('\n🔍 VERIFICANDO INTEGRIDAD DE RESERVA_ID:');
      console.log('=' .repeat(80));
      
      const integridadResult = await query(`
        SELECT 
          COUNT(*) as total_con_reserva,
          COUNT(r.reserva_id) as reservas_existentes,
          COUNT(*) - COUNT(r.reserva_id) as reservas_inexistentes
        FROM alquileres a
        LEFT JOIN reservas r ON a.reserva_id = r.reserva_id
        WHERE a.reserva_id IS NOT NULL
      `);
      
      const integridad = integridadResult.rows[0];
      console.log(`Alquileres con reserva_id: ${integridad.total_con_reserva}`);
      console.log(`Reservas que existen: ${integridad.reservas_existentes}`);
      console.log(`Reservas que NO existen: ${integridad.reservas_inexistentes}`);
      
      if (integridad.reservas_inexistentes > 0) {
        console.log('\n❌ PROBLEMA: Hay alquileres con reserva_id que no existen en la tabla reservas');
        
        const problemasResult = await query(`
          SELECT DISTINCT a.reserva_id
          FROM alquileres a
          LEFT JOIN reservas r ON a.reserva_id = r.reserva_id
          WHERE a.reserva_id IS NOT NULL AND r.reserva_id IS NULL
          LIMIT 5
        `);
        
        console.log('Reserva_id problemáticos:');
        problemasResult.rows.forEach(row => {
          console.log(`  - ${row.reserva_id}`);
        });
      } else {
        console.log('\n✅ INTEGRIDAD CORRECTA: Todos los reserva_id existen en la tabla reservas');
      }
    }
    
    // 6. Recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    console.log('=' .repeat(80));
    
    if (!reservasExistResult.rows[0].existe_reservas) {
      console.log('❌ La tabla reservas no existe. Deberías:');
      console.log('   1. Crear la tabla reservas');
      console.log('   2. Agregar foreign key entre alquileres.reserva_id y reservas.reserva_id');
    } else if (fkResult.rows.length === 0) {
      console.log('⚠️  No hay foreign key. Deberías:');
      console.log('   1. Agregar foreign key entre alquileres.reserva_id y reservas.reserva_id');
      console.log('   2. Esto garantizará la integridad referencial');
    } else {
      console.log('✅ La estructura está correcta');
    }
    
    console.log('\n📝 FLUJO TÍPICO:');
    console.log('   1. Se crea una reserva en la tabla reservas');
    console.log('   2. Cuando se ejecuta la reserva, se crea un alquiler');
    console.log('   3. El alquiler referencia la reserva original con reserva_id');
    
  } catch (error) {
    console.error('❌ Error al revisar constraints:', error.message);
  } finally {
    process.exit(0);
  }
}

checkAlquilerConstraints(); 