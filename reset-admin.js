require('dotenv').config();
const { query } = require('./database-pg');
const bcrypt = require('bcrypt');

async function resetAdminPassword() {
  try {
    console.log('🔐 Reseteando contraseña del usuario administrador...\n');

    // Verificar si existe el usuario admin
    const existingAdmin = await query('SELECT * FROM usuarios WHERE nickname = $1', ['admin']);
    
    if (existingAdmin.rows.length === 0) {
      console.log('❌ No existe un usuario admin. Creando uno nuevo...');
      
      // Crear usuario admin
      const adminData = {
        nickname: 'admin',
        password: 'admin123',
        rol: 'admin',
        activo: true
      };

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

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
    } else {
      console.log('✅ Usuario admin encontrado. Reseteando contraseña...');
      
      // Resetear contraseña
      const newPassword = 'admin123';
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await query(`
        UPDATE usuarios 
        SET password_hash = $1 
        WHERE nickname = $2
      `, [hashedPassword, 'admin']);

      console.log('✅ Contraseña reseteada exitosamente:');
      console.log(`   - Usuario: admin`);
      console.log(`   - Nueva contraseña: ${newPassword}`);
    }

    console.log('\n🔑 Credenciales actualizadas:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');

  } catch (error) {
    console.error('❌ Error reseteando contraseña:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  resetAdminPassword();
}

module.exports = { resetAdminPassword }; 