const { query } = require('../src/config/database');

async function setupFuelTriggers() {
  try {
    console.log('🔧 Configurando triggers para conversión automática de combustible...');
    
    // 1. Crear función para convertir porcentajes a fracciones
    console.log('🔄 Creando función de conversión...');
    await query(`
      CREATE OR REPLACE FUNCTION convertir_combustible_a_fraccion(nivel INTEGER)
      RETURNS VARCHAR AS $$
      BEGIN
        IF nivel IS NULL THEN
          RETURN NULL;
        ELSIF nivel <= 25 THEN
          RETURN '1/4';
        ELSIF nivel <= 50 THEN
          RETURN '1/2';
        ELSIF nivel <= 75 THEN
          RETURN '3/4';
        ELSIF nivel <= 100 THEN
          RETURN '4/4';
        ELSE
          RETURN NULL;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Función de conversión creada');
    
    // 2. Crear trigger para futuras inserciones
    console.log('🔧 Creando trigger para futuras inserciones...');
    await query(`
      CREATE OR REPLACE FUNCTION actualizar_combustible_trigger()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Si se inserta un número (porcentaje), convertirlo a fracción
        IF NEW.nivel_combustible_salida IS NOT NULL AND NEW.nivel_combustible_salida ~ '^[0-9]+$' THEN
          NEW.nivel_combustible_salida := convertir_combustible_a_fraccion(NEW.nivel_combustible_salida::INTEGER);
        END IF;
        
        IF NEW.nivel_combustible_entrada IS NOT NULL AND NEW.nivel_combustible_entrada ~ '^[0-9]+$' THEN
          NEW.nivel_combustible_entrada := convertir_combustible_a_fraccion(NEW.nivel_combustible_entrada::INTEGER);
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
    
    // 3. Actualizar comentarios de las columnas
    console.log('📝 Actualizando documentación de columnas...');
    await query(`
      COMMENT ON COLUMN alquileres.nivel_combustible_salida IS 'Nivel de combustible al salir: 1/4, 1/2, 3/4, 4/4';
      COMMENT ON COLUMN alquileres.nivel_combustible_entrada IS 'Nivel de combustible al entrar: 1/4, 1/2, 3/4, 4/4';
    `);
    
    console.log('✅ Comentarios actualizados');
    
    // 4. Verificar configuración
    console.log('\n🔍 Verificando configuración...');
    const triggers = await query(`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers 
      WHERE event_object_table = 'alquileres' 
      AND trigger_name = 'trigger_combustible_alquileres'
    `);
    
    if (triggers.rows.length > 0) {
      console.log('✅ Trigger configurado correctamente');
      triggers.rows.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name}: ${trigger.event_manipulation}`);
      });
    } else {
      console.log('❌ No se encontró el trigger');
    }
    
    console.log('\n🎉 ¡Configuración completada!');
    console.log('💡 A partir de ahora:');
    console.log('   - Si insertas un número (ej: 75), se convertirá automáticamente a fracción (3/4)');
    console.log('   - Si insertas una fracción directamente (ej: 3/4), se mantendrá tal cual');
    console.log('   - Valores válidos: 1/4, 1/2, 3/4, 4/4');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    process.exit(1);
  }
}

setupFuelTriggers(); 