require('dotenv').config();
const { query } = require('./database-pg');
const bcrypt = require('bcrypt');

async function cleanAndCreateUsers() {
  try {
    console.log('🧹 Limpiando usuarios existentes...\n');

    // Limpiar todos los usuarios
    await query('DELETE FROM usuarios');
    console.log('✅ Usuarios eliminados');

    // Resetear la secuencia de IDs
    await query('ALTER SEQUENCE usuarios_usuario_id_seq RESTART WITH 1');
    console.log('✅ Secuencia de IDs reseteada');

    console.log('\n👥 Creando usuarios con contraseñas válidas...\n');

    const users = [
      {
        nickname: 'admin',
        password: 'admin123',
        rol: 'admin',
        activo: true
      },
      {
        nickname: 'manager',
        password: 'manager123',
        rol: 'admin',
        activo: true
      },
      {
        nickname: 'user1',
        password: 'user123',
        rol: 'admin',
        activo: true
      },
      {
        nickname: 'user2',
        password: 'user123',
        rol: 'admin',
        activo: true
      }
    ];

    for (const userData of users) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const result = await query(`
        INSERT INTO usuarios (nickname, password_hash, rol, activo, fecha_creacion)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING usuario_id, nickname, rol
      `, [userData.nickname, hashedPassword, userData.rol, userData.activo]);

      console.log(`✅ Usuario creado: ${userData.nickname} (${userData.rol}) - Contraseña: ${userData.password}`);
    }

    console.log('\n🔑 Credenciales de acceso:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    users.forEach(user => {
      console.log(`   Usuario: ${user.nickname.padEnd(10)} | Contraseña: ${user.password} | Rol: ${user.rol}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanAndCreateUsers();
}

module.exports = { cleanAndCreateUsers }; 