const { query } = require('../src/config/database');

async function alterFuelColumns() {
  try {
    // Eliminar columnas temporales si existen
    console.log('🧹 Eliminando columnas temporales si existen...');
    await query(`
      ALTER TABLE alquileres 
      DROP COLUMN IF EXISTS nivel_combustible_salida_tmp,
      DROP COLUMN IF EXISTS nivel_combustible_entrada_tmp;
    `);
    console.log('✅ Columnas temporales eliminadas si existían.');

    // Crear columnas temporales
    console.log('🔄 Creando columnas temporales...');
    await query(`
      ALTER TABLE alquileres 
      ADD COLUMN nivel_combustible_salida_tmp VARCHAR(10),
      ADD COLUMN nivel_combustible_entrada_tmp VARCHAR(10);
    `);
    console.log('✅ Columnas temporales creadas.');

    console.log('🔄 Copiando y convirtiendo datos a las columnas temporales...');
    await query(`
      UPDATE alquileres 
      SET 
        nivel_combustible_salida_tmp = convertir_combustible_a_fraccion(CASE WHEN pg_typeof(nivel_combustible_salida)::text = 'integer' THEN nivel_combustible_salida ELSE NULL END),
        nivel_combustible_entrada_tmp = convertir_combustible_a_fraccion(CASE WHEN pg_typeof(nivel_combustible_entrada)::text = 'integer' THEN nivel_combustible_entrada ELSE NULL END)
    `);
    console.log('✅ Datos copiados y convertidos.');

    console.log('🗑️ Eliminando columnas antiguas...');
    await query(`
      ALTER TABLE alquileres 
      DROP COLUMN nivel_combustible_salida,
      DROP COLUMN nivel_combustible_entrada;
    `);
    console.log('✅ Columnas antiguas eliminadas.');

    console.log('✏️ Renombrando columnas temporales...');
    await query(`ALTER TABLE alquileres RENAME COLUMN nivel_combustible_salida_tmp TO nivel_combustible_salida;`);
    await query(`ALTER TABLE alquileres RENAME COLUMN nivel_combustible_entrada_tmp TO nivel_combustible_entrada;`);
    console.log('✅ Columnas renombradas.');

    console.log('🎉 Migración completada correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  }
}

alterFuelColumns(); 