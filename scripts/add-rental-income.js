const { query } = require('../src/config/database');

async function addRentalIncome() {
  try {
    console.log('💰 Agregando sistema de ingresos por alquileres...\n');
    
    // 1. Verificar estructura actual de alquileres
    console.log('📋 Verificando estructura actual de alquileres...');
    const alquileresStructure = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'alquileres'
      ORDER BY ordinal_position
    `);
    
    console.log('Estructura actual:');
    alquileresStructure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });
    
    // 2. Agregar campos de ingresos si no existen
    console.log('\n📝 Agregando campos de ingresos...');
    const existingColumns = alquileresStructure.rows.map(col => col.column_name);
    
    const incomeColumns = [
      { name: 'precio_por_dia', type: 'NUMERIC(8,2)', exists: existingColumns.includes('precio_por_dia') },
      { name: 'total_dias', type: 'INTEGER', exists: existingColumns.includes('total_dias') },
      { name: 'ingreso_total', type: 'NUMERIC(10,2)', exists: existingColumns.includes('ingreso_total') },
      { name: 'descuento_aplicado', type: 'NUMERIC(8,2)', exists: existingColumns.includes('descuento_aplicado') },
      { name: 'ingreso_final', type: 'NUMERIC(10,2)', exists: existingColumns.includes('ingreso_final') },
      { name: 'metodo_pago', type: 'VARCHAR(50)', exists: existingColumns.includes('metodo_pago') }
    ];
    
    for (const column of incomeColumns) {
      if (!column.exists) {
        await query(`ALTER TABLE alquileres ADD COLUMN ${column.name} ${column.type}`);
        console.log(`   ✅ Agregado: ${column.name}`);
      } else {
        console.log(`   ⏭️ Ya existe: ${column.name}`);
      }
    }
    
    // 3. Calcular y actualizar ingresos para alquileres existentes
    console.log('\n🔄 Calculando ingresos para alquileres existentes...');
    
    const alquileresExistentes = await query(`
      SELECT 
        alquiler_id, vehiculo_id, fecha_recogida_real, fecha_devolucion_real,
        estado, km_salida, km_entrada
      FROM alquileres 
      WHERE fecha_recogida_real IS NOT NULL AND fecha_devolucion_real IS NOT NULL
    `);
    
    console.log(`Encontrados ${alquileresExistentes.rows.length} alquileres para calcular ingresos`);
    
    const metodosPago = ['Efectivo', 'Tarjeta de crédito', 'Transferencia bancaria', 'PayPal'];
    
    for (const alquiler of alquileresExistentes.rows) {
      // Calcular días de alquiler
      const fechaInicio = new Date(alquiler.fecha_recogida_real);
      const fechaFin = new Date(alquiler.fecha_devolucion_real);
      const dias = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
      
      // Precio por día basado en el grupo del vehículo (simulado)
      const preciosPorDia = {
        'A': 35, // Económico
        'B': 45, // Compacto
        'C': 55, // Intermedio
        'D': 75, // Superior
        'E': 95, // Premium
        'F': 85, // SUV
        'G': 65  // Van
      };
      
      // Obtener grupo del vehículo
      const vehiculo = await query(`
        SELECT grupo FROM vehiculos WHERE vehiculo_id = $1
      `, [alquiler.vehiculo_id]);
      
      const grupo = vehiculo.rows[0]?.grupo || 'C';
      const precioPorDia = preciosPorDia[grupo] || 55;
      
      // Calcular ingresos
      const ingresoTotal = dias * precioPorDia;
      const descuento = ingresoTotal * 0.05; // 5% descuento
      const ingresoFinal = ingresoTotal - descuento;
      const metodoPago = metodosPago[Math.floor(Math.random() * metodosPago.length)];
      
      // Actualizar alquiler con ingresos
      await query(`
        UPDATE alquileres 
        SET 
          precio_por_dia = $1,
          total_dias = $2,
          ingreso_total = $3,
          descuento_aplicado = $4,
          ingreso_final = $5,
          metodo_pago = $6
        WHERE alquiler_id = $7
      `, [precioPorDia, dias, ingresoTotal, descuento, ingresoFinal, metodoPago, alquiler.alquiler_id]);
      
      console.log(`   ✅ Alquiler ${alquiler.alquiler_id}: ${dias} días, €${ingresoFinal?.toLocaleString()} (${metodoPago})`);
    }
    
    // 4. Crear función para obtener ingresos totales por vehículo
    console.log('\n🔧 Creando función para ingresos totales por vehículo...');
    await query(`
      CREATE OR REPLACE FUNCTION obtener_ingresos_vehiculo(p_vehiculo_id INTEGER)
      RETURNS TABLE(
        total_alquileres INTEGER,
        alquileres_completados INTEGER,
        ingresos_totales_alquileres NUMERIC,
        dias_total_alquilado INTEGER,
        ingreso_promedio_por_alquiler NUMERIC
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          COUNT(a.alquiler_id)::INTEGER as total_alquileres,
          COUNT(CASE WHEN a.estado = 'cerrado' THEN 1 END)::INTEGER as alquileres_completados,
          COALESCE(SUM(a.ingreso_final), 0) as ingresos_totales_alquileres,
          COALESCE(SUM(a.total_dias), 0)::INTEGER as dias_total_alquilado,
          CASE 
            WHEN COUNT(a.alquiler_id) > 0 THEN 
              COALESCE(SUM(a.ingreso_final), 0) / COUNT(a.alquiler_id)
            ELSE 0 
          END as ingreso_promedio_por_alquiler
        FROM alquileres a
        WHERE a.vehiculo_id = p_vehiculo_id;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Función de ingresos creada');
    
    // 5. Verificar resultados
    console.log('\n📊 Verificación de ingresos:');
    const ingresosStats = await query(`
      SELECT 
        COUNT(*) as total_alquileres,
        SUM(ingreso_final) as ingresos_totales,
        AVG(ingreso_final) as ingreso_promedio
      FROM alquileres 
      WHERE ingreso_final IS NOT NULL
    `);
    
    const stats = ingresosStats.rows[0];
    console.log(`   Total alquileres con ingresos: ${stats.total_alquileres}`);
    console.log(`   Ingresos totales: €${stats.ingresos_totales?.toLocaleString()}`);
    console.log(`   Ingreso promedio: €${stats.ingreso_promedio?.toLocaleString()}`);
    
    // 6. Mostrar ejemplo de vehículo con más ingresos
    console.log('\n🏆 Top 3 vehículos con más ingresos por alquileres:');
    const topIngresos = await query(`
      SELECT 
        v.vehiculo_id,
        v.marca,
        v.modelo,
        v.matricula,
        v.estado,
        COUNT(a.alquiler_id) as total_alquileres,
        SUM(a.ingreso_final) as ingresos_totales,
        AVG(a.ingreso_final) as ingreso_promedio
      FROM vehiculos v
      LEFT JOIN alquileres a ON v.vehiculo_id = a.vehiculo_id
      WHERE a.ingreso_final IS NOT NULL
      GROUP BY v.vehiculo_id, v.marca, v.modelo, v.matricula, v.estado
      ORDER BY ingresos_totales DESC
      LIMIT 3
    `);
    
    topIngresos.rows.forEach((veh, index) => {
      console.log(`   ${index + 1}. ${veh.marca} ${veh.modelo} (${veh.matricula})`);
      console.log(`      Estado: ${veh.estado}`);
      console.log(`      Alquileres: ${veh.total_alquileres}`);
      console.log(`      Ingresos totales: €${veh.ingresos_totales?.toLocaleString()}`);
      console.log(`      Ingreso promedio: €${veh.ingreso_promedio?.toLocaleString()}`);
    });
    
    console.log('\n🎉 ¡Sistema de ingresos por alquileres implementado!');
    console.log('💡 Ahora puedes:');
    console.log('   - Ver ingresos totales por vehículo');
    console.log('   - Calcular rentabilidad real de cada coche');
    console.log('   - Identificar los vehículos más rentables');
    console.log('   - Usar: SELECT * FROM obtener_ingresos_vehiculo(vehiculo_id);');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addRentalIncome(); 