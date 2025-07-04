require('dotenv').config();
const { query } = require('./database-pg');
const bcrypt = require('bcrypt');

async function createUsers() {
  try {
    console.log('👥 Creando usuarios con contraseñas válidas...\n');

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
      // Verificar si el usuario ya existe
      const existingUser = await query('SELECT * FROM usuarios WHERE nickname = $1', [userData.nickname]);
      
      if (existingUser.rows.length === 0) {
        // Crear nuevo usuario
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        const result = await query(`
          INSERT INTO usuarios (nickname, password_hash, rol, activo, fecha_creacion)
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
          RETURNING usuario_id, nickname, rol
        `, [userData.nickname, hashedPassword, userData.rol, userData.activo]);

        console.log(`✅ Usuario creado: ${userData.nickname} (${userData.rol}) - Contraseña: ${userData.password}`);
      } else {
        // Actualizar contraseña del usuario existente
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        await query(`
          UPDATE usuarios 
          SET password_hash = $1, rol = $2, activo = $3
          WHERE nickname = $4
        `, [hashedPassword, userData.rol, userData.activo, userData.nickname]);

        console.log(`🔄 Usuario actualizado: ${userData.nickname} (${userData.rol}) - Contraseña: ${userData.password}`);
      }
    }

    console.log('\n🔑 Credenciales de acceso:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    users.forEach(user => {
      console.log(`   Usuario: ${user.nickname.padEnd(10)} | Contraseña: ${user.password} | Rol: ${user.rol}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error creando usuarios:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createUsers();
}

module.exports = { createUsers }; 