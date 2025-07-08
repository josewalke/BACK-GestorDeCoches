require('dotenv').config();
const { query } = require('../src/config/database');
const bcrypt = require('bcrypt');

async function createAdminUser() {
  try {
    console.log('🔐 Creando usuario administrador...\n');

    // Verificar si ya existe un usuario admin
    const existingAdmin = await query('SELECT * FROM usuarios WHERE rol = $1', ['admin']);
    
    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Ya existe un usuario administrador:');
      existingAdmin.rows.forEach(user => {
        console.log(`   - Usuario: ${user.nickname} (Rol: ${user.rol})`);
      });
      return;
    }

    // Datos del usuario admin
    const adminData = {
      nickname: 'admin',
      password: 'admin123', // Contraseña temporal
      rol: 'admin',
      activo: true
    };

    // Encriptar la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

    // Insertar el usuario admin
    const result = await query(`
      INSERT INTO usuarios (nickname, password_hash, rol, activo, fecha_creacion)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING usuario_id, nickname, rol
    `, [adminData.nickname, hashedPassword, adminData.rol, adminData.activo]);

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log(`   - ID: ${result.rows[0].usuario_id}`);
    console.log(`   - Usuario: ${result.rows[0].nickname}`);
    console.log(`   - Rol: ${result.rows[0].rol}`);
    console.log(`   - Contraseña: ${adminData.password}`);
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión');

  } catch (error) {
    console.error('❌ Error creando usuario admin:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser }; 