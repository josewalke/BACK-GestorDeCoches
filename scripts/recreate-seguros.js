require('dotenv').config();
const { query } = require('./database-pg');

// Generar seguro
const generarSeguro = (vehiculoId) => {
  const aseguradoras = ['Mapfre', 'Allianz', 'AXA', 'Generali', 'Zurich'];
  const tiposCobertura = ['Básico', 'Completo', 'Premium', 'Todo Riesgo'];
  
  const fechaInicio = new Date();
  const fechaFin = new Date(fechaInicio.getTime() + (365 * 24 * 60 * 60 * 1000));
  
  return {
    seguro_id: null,
    vehiculo_id: vehiculoId,
    compañia: aseguradoras[Math.floor(Math.random() * aseguradoras.length)],
    poliza_numero: generarNumeroPoliza(),
    cobertura_desde: fechaInicio.toISOString().split('T')[0],
    cobertura_hasta: fechaFin.toISOString().split('T')[0],
    tipo_cobertura: tiposCobertura[Math.floor(Math.random() * tiposCobertura.length)],
    created_at: new Date().toISOString()
  };
};

// Generar número de póliza
const generarNumeroPoliza = () => {
  const numeros = '0123456789';
  let poliza = '';
  for (let i = 0; i < 10; i++) {
    poliza += numeros.charAt(Math.floor(Math.random() * numeros.length));
  }
  return poliza;
};

async function recreateSeguros() {
  try {
    console.log('🗑️ Eliminando todos los seguros existentes...');
    
    // Eliminar todos los seguros
    await query('DELETE FROM seguros_vehiculo');
    console.log('✅ Todos los seguros eliminados.');
    
    // Obtener todos los vehículos
    const vehiculos = await query('SELECT vehiculo_id FROM vehiculos ORDER BY vehiculo_id');
    console.log(`📋 Encontrados ${vehiculos.rows.length} vehículos.`);
    
    // Crear un seguro para cada vehículo
    console.log('🛡️ Creando un seguro para cada vehículo...');
    
    for (const vehiculo of vehiculos.rows) {
      const seguro = generarSeguro(vehiculo.vehiculo_id);
      
      await query(`
        INSERT INTO seguros_vehiculo (
          vehiculo_id, compañia, poliza_numero, cobertura_desde,
          cobertura_hasta, tipo_cobertura, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        seguro.vehiculo_id, seguro.compañia, seguro.poliza_numero, seguro.cobertura_desde,
        seguro.cobertura_hasta, seguro.tipo_cobertura, seguro.created_at
      ]);
    }
    
    // Verificar el resultado
    const count = await query('SELECT COUNT(*) as total FROM seguros_vehiculo');
    console.log(`✅ Se han creado ${count.rows[0].total} seguros (uno por cada vehículo).`);
    
  } catch (error) {
    console.error('❌ Error recreando seguros:', error.message);
  }
}

if (require.main === module) {
  recreateSeguros();
}

module.exports = { recreateSeguros }; 