const { query } = require('../src/config/database');

async function updateFuelLevels() {
  try {
    console.log('⛽ Actualizando niveles de combustible a fracciones...\n');
    
    // 1. Verificar la estructura actual de las tablas
    console.log('📋 Verificando estructura actual...');
    
    const alquileresStructure = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'alquileres' 
      AND (column_name = 'nivel_combustible_salida' OR column_name = 'nivel_combustible_entrada')
    `);
    
    console.log('Estructura actual de alquileres:');
    alquileresStructure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });
    
    // 2. Crear función para convertir porcentajes a fracciones
    console.log('\n🔄 Creando función de conversión...');
    await query(`
      CREATE OR REPLACE FUNCTION convertir_combustible_a_fraccion(nivel INTEGER)
      RETURNS VARCHAR AS $$
      BEGIN
        IF nivel IS NULL THEN
          RETURN 'N/A';
        ELSIF nivel <= 25 THEN
          RETURN '1/4';
        ELSIF nivel <= 50 THEN
          RETURN '1/2';
        ELSIF nivel <= 75 THEN
          RETURN '3/4';
        ELSIF nivel <= 100 THEN
          RETURN '4/4';
        ELSE
          RETURN 'N/A';
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Función de conversión creada');
    
    // 3. Actualizar datos existentes en alquileres (mientras la columna es smallint)
    console.log('\n📊 Actualizando datos existentes...');
    const alquileresActualizados = await query(`
      UPDATE alquileres 
      SET 
        nivel_combustible_salida = convertir_combustible_a_fraccion(nivel_combustible_salida),
        nivel_combustible_entrada = convertir_combustible_a_fraccion(nivel_combustible_entrada)
      WHERE nivel_combustible_salida IS NOT NULL OR nivel_combustible_entrada IS NOT NULL
    `);
    console.log(`✅ Actualizados ${alquileresActualizados.rowCount} registros en alquileres`);
    
    // 4. Cambiar el tipo de datos de las columnas
    console.log('\n🔄 Cambiando tipo de datos de las columnas...');
    await query(`
      ALTER TABLE alquileres 
      ALTER COLUMN nivel_combustible_salida TYPE VARCHAR(10),
      ALTER COLUMN nivel_combustible_entrada TYPE VARCHAR(10)
    `);
    console.log('✅ Tipo de datos cambiado a VARCHAR');
    
    // 5. Verificar los cambios
    console.log('\n🔍 Verificando cambios...');
    const muestraAlquileres = await query(`
      SELECT 
        alquiler_id,
        nivel_combustible_salida,
        nivel_combustible_entrada
      FROM alquileres 
      WHERE nivel_combustible_salida IS NOT NULL OR nivel_combustible_entrada IS NOT NULL
      LIMIT 5
    `);
    
    console.log('Muestra de datos actualizados:');
    muestraAlquileres.rows.forEach(row => {
      console.log(`   Alquiler ${row.alquiler_id}: Salida=${row.nivel_combustible_salida}, Entrada=${row.nivel_combustible_entrada}`);
    });
    
    // 6. Crear trigger para futuras inserciones
    console.log('\n🔧 Creando trigger para futuras inserciones...');
    await query(`
      CREATE OR REPLACE FUNCTION actualizar_combustible_trigger()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.nivel_combustible_salida IS NOT NULL THEN
          NEW.nivel_combustible_salida := convertir_combustible_a_fraccion(NEW.nivel_combustible_salida);
        END IF;
        
        IF NEW.nivel_combustible_entrada IS NOT NULL THEN
          NEW.nivel_combustible_entrada := convertir_combustible_a_fraccion(NEW.nivel_combustible_entrada);
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await query(`
      DROP TRIGGER IF EXISTS trigger_combustible_alquileres ON alquileres;
      CREATE TRIGGER trigger_combustible_alquileres
        BEFORE INSERT OR UPDATE ON alquileres
        FOR EACH ROW
        EXECUTE FUNCTION actualizar_combustible_trigger();
    `);
    
    console.log('✅ Trigger creado para futuras inserciones');
    
    // 7. Actualizar comentarios de las columnas
    console.log('\n📝 Actualizando documentación de columnas...');
    await query(`
      COMMENT ON COLUMN alquileres.nivel_combustible_salida IS 'Nivel de combustible al salir: 1/4, 1/2, 3/4, 4/4';
      COMMENT ON COLUMN alquileres.nivel_combustible_entrada IS 'Nivel de combustible al entrar: 1/4, 1/2, 3/4, 4/4';
    `);
    
    console.log('✅ Comentarios actualizados');
    
    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('📋 Resumen:');
    console.log('   - Datos existentes convertidos a fracciones');
    console.log('   - Trigger creado para futuras inserciones');
    console.log('   - Documentación actualizada');
    console.log('\n💡 A partir de ahora, los niveles de combustible se almacenarán como:');
    console.log('   - 1/4 (25% o menos)');
    console.log('   - 1/2 (26-50%)');
    console.log('   - 3/4 (51-75%)');
    console.log('   - 4/4 (76-100%)');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    throw error;
  }
}

// Ejecutar la migración
updateFuelLevels()
  .then(() => {
    console.log('\n✅ Migración completada');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error en la migración:', error);
    process.exit(1);
  }); 