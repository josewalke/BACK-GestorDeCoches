const { query } = require('../src/config/database');

async function improveVentasTable() {
  try {
    console.log('🔧 Mejorando tabla ventas con información del cliente comprador...\n');
    
    // 1. Añadir campos para información completa del cliente comprador
    console.log('📝 Añadiendo campos de cliente comprador...');
    await query(`
      ALTER TABLE ventas 
      ADD COLUMN IF NOT EXISTS cliente_nombre VARCHAR(100),
      ADD COLUMN IF NOT EXISTS cliente_apellidos VARCHAR(100),
      ADD COLUMN IF NOT EXISTS cliente_dni VARCHAR(20),
      ADD COLUMN IF NOT EXISTS cliente_email VARCHAR(100),
      ADD COLUMN IF NOT EXISTS cliente_telefono VARCHAR(20),
      ADD COLUMN IF NOT EXISTS cliente_direccion TEXT
    `);
    console.log('✅ Campos de cliente añadidos');
    
    // 2. Actualizar ventas existentes con datos de cliente simulados
    console.log('\n📋 Actualizando ventas existentes con datos de cliente...');
    const ventasExistentes = await query(`
      SELECT venta_id, vehiculo_id, monto_venta, metodo_pago
      FROM ventas
    `);
    
    const nombres = [
      'María', 'José', 'Ana', 'Carlos', 'Isabel', 'Pedro', 'Carmen', 'Luis',
      'Elena', 'Miguel', 'Sofia', 'David', 'Patricia', 'Javier', 'Laura', 'Roberto'
    ];
    
    const apellidos = [
      'García', 'Rodríguez', 'López', 'Martínez', 'González', 'Pérez', 'Fernández',
      'Sánchez', 'Ramírez', 'Torres', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno'
    ];
    
    const dominios = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
    
    for (const venta of ventasExistentes.rows) {
      const nombre = nombres[Math.floor(Math.random() * nombres.length)];
      const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
      const dni = `${Math.floor(Math.random() * 99999999)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
      const email = `${nombre.toLowerCase()}.${apellido.toLowerCase()}@${dominios[Math.floor(Math.random() * dominios.length)]}`;
      const telefono = `+34 ${Math.floor(Math.random() * 999999999)}`;
      const direccion = `Calle ${Math.floor(Math.random() * 100) + 1}, ${Math.floor(Math.random() * 1000) + 10000} Madrid`;
      
      await query(`
        UPDATE ventas 
        SET cliente_nombre = $1,
            cliente_apellidos = $2,
            cliente_dni = $3,
            cliente_email = $4,
            cliente_telefono = $5,
            cliente_direccion = $6
        WHERE venta_id = $7
      `, [nombre, apellido, dni, email, telefono, direccion, venta.venta_id]);
      
      console.log(`   ✅ Venta ${venta.venta_id}: ${nombre} ${apellido} - ${email}`);
    }
    
    // 3. Verificar resultado
    console.log('\n📊 Verificación de datos de cliente:');
    const ventasConCliente = await query(`
      SELECT COUNT(*) as total
      FROM ventas 
      WHERE cliente_nombre IS NOT NULL
    `);
    
    const totalVentas = await query(`
      SELECT COUNT(*) as total
      FROM ventas
    `);
    
    console.log(`   Total ventas: ${totalVentas.rows[0].total}`);
    console.log(`   Con datos de cliente: ${ventasConCliente.rows[0].total}`);
    
    // 4. Mostrar ejemplo de venta con datos completos
    console.log('\n📋 Ejemplo de venta con datos completos:');
    const ejemploVenta = await query(`
      SELECT v.venta_id, v.fecha_venta, v.monto_venta, v.metodo_pago,
             v.cliente_nombre, v.cliente_apellidos, v.cliente_dni, 
             v.cliente_email, v.cliente_telefono, v.cliente_direccion,
             veh.marca, veh.modelo, veh.matricula
      FROM ventas v
      JOIN vehiculos veh ON v.vehiculo_id = veh.vehiculo_id
      LIMIT 1
    `);
    
    if (ejemploVenta.rows.length > 0) {
      const venta = ejemploVenta.rows[0];
      console.log(`   Venta ID: ${venta.venta_id}`);
      console.log(`   Vehículo: ${venta.marca} ${venta.modelo} (${venta.matricula})`);
      console.log(`   Fecha: ${venta.fecha_venta}`);
      console.log(`   Monto: €${venta.monto_venta?.toLocaleString()}`);
      console.log(`   Método: ${venta.metodo_pago}`);
      console.log(`   Cliente: ${venta.cliente_nombre} ${venta.cliente_apellidos}`);
      console.log(`   DNI: ${venta.cliente_dni}`);
      console.log(`   Email: ${venta.cliente_email}`);
      console.log(`   Teléfono: ${venta.cliente_telefono}`);
      console.log(`   Dirección: ${venta.cliente_direccion}`);
    }
    
    console.log('\n✅ Tabla ventas mejorada con información completa del cliente');
    console.log('💡 Ahora puedes hacer seguimiento completo de cada venta');
    
  } catch (error) {
    console.error('❌ Error mejorando tabla ventas:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  improveVentasTable();
}

module.exports = { improveVentasTable }; 