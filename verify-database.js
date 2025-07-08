const { query, testConnection } = require('./src/config/database');

async function verifyDatabase() {
  console.log('🔍 Iniciando verificación completa de la base de datos...\n');

  try {
    // 1. Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      return;
    }
    console.log('✅ Conexión exitosa\n');

    // 2. Verificar que todas las tablas existen
    console.log('2. Verificando estructura de tablas...');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    const tables = await query(tablesQuery);
    console.log('📋 Tablas encontradas:');
    tables.rows.forEach(row => console.log(`   - ${row.table_name}`));
    console.log('');

    // 3. Verificar estructura de cada tabla
    console.log('3. Verificando estructura de columnas...');
    for (const table of tables.rows) {
      const tableName = table.table_name;
      console.log(`\n📊 Tabla: ${tableName}`);
      
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `;
      const columns = await query(columnsQuery, [tableName]);
      
      console.log('   Columnas:');
      columns.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`     - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
      });

      // Verificar constraints
      const constraintsQuery = `
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints 
        WHERE table_name = $1
      `;
      const constraints = await query(constraintsQuery, [tableName]);
      if (constraints.rows.length > 0) {
        console.log('   Constraints:');
        constraints.rows.forEach(constraint => {
          console.log(`     - ${constraint.constraint_name}: ${constraint.constraint_type}`);
        });
      }
    }

    // 4. Verificar datos en cada tabla
    console.log('\n4. Verificando datos en las tablas...');
    for (const table of tables.rows) {
      const tableName = table.table_name;
      const countQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
      const count = await query(countQuery);
      console.log(`   ${tableName}: ${count.rows[0].count} registros`);
    }

    // 5. Verificar integridad referencial
    console.log('\n5. Verificando integridad referencial...');
    
    // Verificar foreign keys
    const foreignKeysQuery = `
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, kcu.column_name
    `;
    const foreignKeys = await query(foreignKeysQuery);
    
    if (foreignKeys.rows.length > 0) {
      console.log('   Foreign Keys encontradas:');
      foreignKeys.rows.forEach(fk => {
        console.log(`     - ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    } else {
      console.log('   No se encontraron foreign keys');
    }

    // 6. Verificar enums
    console.log('\n6. Verificando tipos enum...');
    const enumsQuery = `
      SELECT t.typname as enum_name, e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      ORDER BY t.typname, e.enumsortorder
    `;
    const enums = await query(enumsQuery);
    
    if (enums.rows.length > 0) {
      const enumGroups = {};
      enums.rows.forEach(enumRow => {
        if (!enumGroups[enumRow.enum_name]) {
          enumGroups[enumRow.enum_name] = [];
        }
        enumGroups[enumRow.enum_name].push(enumRow.enum_value);
      });
      
      console.log('   Enums encontrados:');
      Object.entries(enumGroups).forEach(([enumName, values]) => {
        console.log(`     - ${enumName}: [${values.join(', ')}]`);
      });
    } else {
      console.log('   No se encontraron enums');
    }

    // 7. Verificar índices
    console.log('\n7. Verificando índices...');
    const indexesQuery = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `;
    const indexes = await query(indexesQuery);
    
    if (indexes.rows.length > 0) {
      console.log('   Índices encontrados:');
      indexes.rows.forEach(index => {
        console.log(`     - ${index.indexname} en ${index.tablename}`);
      });
    } else {
      console.log('   No se encontraron índices');
    }

    // 8. Verificar datos específicos importantes
    console.log('\n8. Verificando datos específicos...');
    
    // Verificar usuarios
    const usersCount = await query('SELECT COUNT(*) as count FROM usuarios');
    console.log(`   Usuarios: ${usersCount.rows[0].count}`);
    
    // Verificar vehículos por estado
    const vehiclesByState = await query(`
      SELECT estado, COUNT(*) as count 
      FROM vehiculos 
      GROUP BY estado 
      ORDER BY estado
    `);
    console.log('   Vehículos por estado:');
    vehiclesByState.rows.forEach(row => {
      console.log(`     - ${row.estado}: ${row.count}`);
    });
    
    // Verificar alquileres activos
    const activeRentals = await query(`
      SELECT COUNT(*) as count 
      FROM alquileres 
      WHERE estado = 'abierto'
    `);
    console.log(`   Alquileres activos: ${activeRentals.rows[0].count}`);
    
    // Verificar reservas activas
    const activeReservations = await query(`
      SELECT COUNT(*) as count 
      FROM reservas 
      WHERE fecha_devolucion_prevista >= CURRENT_DATE
    `);
    console.log(`   Reservas activas: ${activeReservations.rows[0].count}`);

    console.log('\n✅ Verificación completa finalizada');
    console.log('📊 La base de datos parece estar en buen estado');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

// Ejecutar la verificación
verifyDatabase().then(() => {
  console.log('\n🏁 Proceso de verificación completado');
  process.exit(0);
}).catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
}); 