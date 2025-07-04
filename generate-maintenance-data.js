require('dotenv').config();
const { query } = require('./database-pg');

// Tipos de mantenimiento realistas
const tiposMantenimiento = [
  'Revisión General',
  'Cambio de Aceite',
  'Frenos',
  'Suspensión',
  'Motor',
  'Transmisión',
  'Aire Acondicionado',
  'Electricidad',
  'Pintura y Carrocería',
  'Neumáticos',
  'Sistema de Escape',
  'Dirección',
  'Climatización',
  'Sistema de Combustible',
  'Diagnóstico Electrónico'
];

// Descripciones de problemas comunes
const problemasComunes = [
  'Ruido anormal en el motor',
  'Frenos desgastados',
  'Fuga de aceite',
  'Problemas de climatización',
  'Luz de check engine encendida',
  'Vibraciones en la dirección',
  'Problemas de transmisión',
  'Suspensión dañada',
  'Sistema eléctrico defectuoso',
  'Problemas de refrigeración',
  'Escape roto',
  'Neumáticos desgastados',
  'Problemas de arranque',
  'Fuga de refrigerante',
  'Sistema de frenos defectuoso'
];

// Generar fecha de inicio de mantenimiento
function generarFechaInicio() {
  const fechaActual = new Date();
  const diasAtras = Math.floor(Math.random() * 14) + 1; // 1-14 días atrás
  const fechaInicio = new Date(fechaActual.getTime() - (diasAtras * 24 * 60 * 60 * 1000));
  return fechaInicio.toISOString().split('T')[0];
}

// Generar fecha estimada de finalización
function generarFechaFin(fechaInicio) {
  const fechaInicioObj = new Date(fechaInicio);
  const diasDuracion = Math.floor(Math.random() * 7) + 2; // 2-8 días de duración
  const fechaFin = new Date(fechaInicioObj.getTime() + (diasDuracion * 24 * 60 * 60 * 1000));
  return fechaFin.toISOString().split('T')[0];
}

// Generar costo de mantenimiento
function generarCosto() {
  const costoBase = Math.floor(Math.random() * 800) + 200; // 200-1000€
  const igic = costoBase * 0.07; // 7% IGIC
  return {
    costo_base: costoBase,
    igic: igic,
    costo_total: costoBase + igic
  };
}

// Generar mantenimiento individual
function generarMantenimiento(vehiculoId, kmActuales) {
  const tipo = tiposMantenimiento[Math.floor(Math.random() * tiposMantenimiento.length)];
  const problema = problemasComunes[Math.floor(Math.random() * problemasComunes.length)];
  const fechaServicio = generarFechaInicio();
  const costos = generarCosto();
  
  return {
    mantenimiento_id: null, // Se auto-incrementará
    vehiculo_id: vehiculoId,
    fecha_servicio: fechaServicio,
    km_servicio: kmActuales,
    descripcion: `${tipo}: ${problema}`,
    coste: costos.costo_total,
    proveedor: generarProveedor(),
    created_at: new Date().toISOString()
  };
}

// Generar proveedor
function generarProveedor() {
  const proveedores = [
    'Taller Central Tenerife',
    'AutoServicio Canarias',
    'Mecánica Express',
    'Taller Premium',
    'Servicio Rápido',
    'Mecánica Profesional',
    'Taller Especializado',
    'AutoMantenimiento',
    'Servicio Técnico Canarias',
    'Taller de Confianza'
  ];
  
  return proveedores[Math.floor(Math.random() * proveedores.length)];
}

async function generarDatosMantenimiento() {
  try {
    console.log('🔧 Generando datos de mantenimientos...\n');
    
    // Obtener vehículos en taller con kilómetros
    const vehiculosEnTaller = await query(`
      SELECT vehiculo_id, marca, modelo, matricula, km_actuales 
      FROM vehiculos 
      WHERE estado = 'taller' 
      ORDER BY vehiculo_id
    `);
    
    console.log(`📊 Vehículos en taller encontrados: ${vehiculosEnTaller.rows.length}\n`);
    
    if (vehiculosEnTaller.rows.length === 0) {
      console.log('❌ No hay vehículos en taller para generar mantenimientos');
      return;
    }
    
    // Limpiar tabla de mantenimientos
    await query('DELETE FROM mantenimientos');
    console.log('🧹 Tabla de mantenimientos limpiada');
    
    // Generar mantenimientos para cada vehículo en taller
    for (const vehiculo of vehiculosEnTaller.rows) {
      const mantenimiento = generarMantenimiento(vehiculo.vehiculo_id, vehiculo.km_actuales);
      
      await query(`
        INSERT INTO mantenimientos (
          vehiculo_id, fecha_servicio, km_servicio, 
          descripcion, coste, proveedor, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        )
      `, [
        mantenimiento.vehiculo_id,
        mantenimiento.fecha_servicio,
        mantenimiento.km_servicio,
        mantenimiento.descripcion,
        mantenimiento.coste,
        mantenimiento.proveedor,
        mantenimiento.created_at
      ]);
      
      console.log(`✅ Mantenimiento generado para ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.matricula})`);
      console.log(`   Descripción: ${mantenimiento.descripcion}`);
      console.log(`   Proveedor: ${mantenimiento.proveedor}`);
      console.log(`   Costo: €${mantenimiento.coste.toLocaleString()}`);
      console.log('');
    }
    
    // Verificar mantenimientos creados
    const mantenimientosCreados = await query('SELECT COUNT(*) as total FROM mantenimientos');
    console.log(`✅ Total de mantenimientos creados: ${mantenimientosCreados.rows[0].total}`);
    
    // Mostrar resumen
    const resumen = await query(`
      SELECT 
        COUNT(*) as total_mantenimientos,
        AVG(coste) as costo_promedio,
        SUM(coste) as costo_total
      FROM mantenimientos
    `);
    
    const resumenData = resumen.rows[0];
    console.log('\n📈 Resumen de mantenimientos:');
    console.log(`   Total mantenimientos: ${resumenData.total_mantenimientos}`);
    console.log(`   Costo promedio: €${Math.round(resumenData.costo_promedio).toLocaleString()}`);
    console.log(`   Costo total: €${Math.round(resumenData.costo_total).toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Error generando datos de mantenimiento:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generarDatosMantenimiento();
}

module.exports = { generarDatosMantenimiento }; 