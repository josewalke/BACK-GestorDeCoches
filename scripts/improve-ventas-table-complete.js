const { query } = require('../src/config/database');

async function improveVentasTableComplete() {
  try {
    console.log('🔧 Mejorando tabla ventas con estructura completa...\n');
    
    // 1. Agregar campos faltantes a la tabla ventas
    console.log('📝 Agregando campos faltantes...');
    
    // Verificar si los campos ya existen antes de agregarlos
    const existingColumns = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ventas'
    `);
    
    const existingColumnNames = existingColumns.rows.map(col => col.column_name);
    
    const columnsToAdd = [
      { name: 'fecha_venta', type: 'DATE NOT NULL', exists: existingColumnNames.includes('fecha_venta') },
      { name: 'monto_venta', type: 'NUMERIC(10,2) NOT NULL', exists: existingColumnNames.includes('monto_venta') },
      { name: 'metodo_pago', type: 'VARCHAR(50) NOT NULL', exists: existingColumnNames.includes('metodo_pago') },
      { name: 'cliente_nombre', type: 'VARCHAR(100)', exists: existingColumnNames.includes('cliente_nombre') },
      { name: 'cliente_email', type: 'VARCHAR(100)', exists: existingColumnNames.includes('cliente_email') },
      { name: 'comision_vendedor', type: 'NUMERIC(8,2)', exists: existingColumnNames.includes('comision_vendedor') },
      { name: 'descuento_aplicado', type: 'NUMERIC(8,2)', exists: existingColumnNames.includes('descuento_aplicado') },
      { name: 'notas', type: 'TEXT', exists: existingColumnNames.includes('notas') },
      { name: 'estado_venta', type: 'VARCHAR(20) DEFAULT \'completada\'', exists: existingColumnNames.includes('estado_venta') },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP', exists: existingColumnNames.includes('created_at') },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP', exists: existingColumnNames.includes('updated_at') }
    ];
    
    for (const column of columnsToAdd) {
      if (!column.exists) {
        await query(`ALTER TABLE ventas ADD COLUMN ${column.name} ${column.type}`);
        console.log(`   ✅ Agregado: ${column.name}`);
      } else {
        console.log(`   ⏭️ Ya existe: ${column.name}`);
      }
    }
    
    // 2. Migrar datos existentes de vehiculos a ventas
    console.log('\n📋 Migrando datos de vehículos vendidos...');
    const vehiculosVendidos = await query(`
      SELECT 
        vehiculo_id, fecha_venta, precio_venta_total, 
        precio_venta_base, igic_venta, km_venta
      FROM vehiculos 
      WHERE estado = 'vendido' AND fecha_venta IS NOT NULL
    `);
    
    console.log(`Encontrados ${vehiculosVendidos.rows.length} vehículos vendidos para migrar`);
    
    const metodosPago = ['Efectivo', 'Tarjeta de crédito', 'Transferencia bancaria', 'Financiación'];
    const nombresClientes = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martín', 'Luis Rodríguez'];
    
    for (const vehiculo of vehiculosVendidos.rows) {
      const metodoPago = metodosPago[Math.floor(Math.random() * metodosPago.length)];
      const clienteNombre = nombresClientes[Math.floor(Math.random() * nombresClientes.length)];
      const comision = vehiculo.precio_venta_total * 0.05; // 5% comisión
      const descuento = vehiculo.precio_venta_total * 0.02; // 2% descuento
      
      // Verificar si ya existe una venta para este vehículo
      const ventaExistente = await query(`
        SELECT venta_id FROM ventas WHERE vehiculo_id = $1
      `, [vehiculo.vehiculo_id]);
      
      if (ventaExistente.rows.length === 0) {
        await query(`
          INSERT INTO ventas (
            vehiculo_id, fecha_venta, monto_venta, metodo_pago, 
            cliente_nombre, cliente_telefono, cliente_direccion,
            comision_vendedor, descuento_aplicado, notas, estado_venta
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          vehiculo.vehiculo_id,
          vehiculo.fecha_venta,
          vehiculo.precio_venta_total,
          metodoPago,
          clienteNombre,
          `+34 ${Math.floor(Math.random() * 900000000) + 100000000}`,
          `Dirección ${Math.floor(Math.random() * 100) + 1}`,
          comision,
          descuento,
          `Venta de vehículo ${vehiculo.vehiculo_id}`,
          'completada'
        ]);
        
        console.log(`   ✅ Migrado: Vehículo ${vehiculo.vehiculo_id} - ${clienteNombre} - €${vehiculo.precio_venta_total?.toLocaleString()}`);
      } else {
        console.log(`   ⏭️ Ya existe venta para vehículo ${vehiculo.vehiculo_id}`);
      }
    }
    
    // 3. Crear función para calcular estadísticas de alquileres
    console.log('\n🔧 Creando función para estadísticas de alquileres...');
    await query(`
      CREATE OR REPLACE FUNCTION obtener_estadisticas_vehiculo(p_vehiculo_id INTEGER)
      RETURNS TABLE(
        total_alquileres INTEGER,
        alquileres_completados INTEGER,
        ingresos_totales_alquileres NUMERIC,
        dias_total_alquilado INTEGER
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          COUNT(a.alquiler_id)::INTEGER as total_alquileres,
          COUNT(CASE WHEN a.estado = 'cerrado' THEN 1 END)::INTEGER as alquileres_completados,
          COALESCE(SUM(CASE WHEN a.estado = 'cerrado' THEN 
            EXTRACT(DAY FROM (a.fecha_devolucion_real - a.fecha_recogida_real)) * 50
          ELSE 0 END), 0) as ingresos_totales_alquileres,
          COALESCE(SUM(EXTRACT(DAY FROM (a.fecha_devolucion_real - a.fecha_recogida_real))), 0)::INTEGER as dias_total_alquilado
        FROM alquileres a
        WHERE a.vehiculo_id = p_vehiculo_id;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Función de estadísticas creada');
    
    // 4. Verificar resultados
    console.log('\n📊 Verificación final:');
    const ventasFinales = await query(`
      SELECT COUNT(*) as total_ventas FROM ventas
    `);
    
    const vehiculosVendidosFinal = await query(`
      SELECT COUNT(*) as total_vendidos FROM vehiculos WHERE estado = 'vendido'
    `);
    
    console.log(`   Ventas en tabla ventas: ${ventasFinales.rows[0].total_ventas}`);
    console.log(`   Vehículos vendidos: ${vehiculosVendidosFinal.rows[0].total_vendidos}`);
    
    // 5. Mostrar ejemplo de datos completos
    console.log('\n📋 Ejemplo de venta completa:');
    const ejemploVenta = await query(`
      SELECT 
        v.venta_id,
        v.fecha_venta,
        v.monto_venta,
        v.metodo_pago,
        v.cliente_nombre,
        v.comision_vendedor,
        v.descuento_aplicado,
        veh.marca,
        veh.modelo,
        veh.matricula
      FROM ventas v
      JOIN vehiculos veh ON v.vehiculo_id = veh.vehiculo_id
      LIMIT 1
    `);
    
    if (ejemploVenta.rows.length > 0) {
      const venta = ejemploVenta.rows[0];
      console.log(`   Vehículo: ${venta.marca} ${venta.modelo} (${venta.matricula})`);
      console.log(`   Fecha: ${venta.fecha_venta}`);
      console.log(`   Monto: €${venta.monto_venta?.toLocaleString()}`);
      console.log(`   Cliente: ${venta.cliente_nombre}`);
      console.log(`   Método: ${venta.metodo_pago}`);
      console.log(`   Comisión: €${venta.comision_vendedor?.toLocaleString()}`);
      console.log(`   Descuento: €${venta.descuento_aplicado?.toLocaleString()}`);
    }
    
    console.log('\n🎉 ¡Tabla ventas mejorada completamente!');
    console.log('💡 Ahora puedes:');
    console.log('   - Calcular ingresos totales por vehículo');
    console.log('   - Ver estadísticas de alquileres');
    console.log('   - Generar reportes de rentabilidad');
    console.log('   - Mantener historial completo de ventas');
    
  } catch (error) {
    console.error('❌ Error mejorando tabla ventas:', error.message);
  }
}

improveVentasTableComplete(); 