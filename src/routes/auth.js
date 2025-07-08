const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { authenticateToken, requireRole, login, getCurrentUser, changePassword } = require('../middlewares/auth');

// Login
router.post('/login', async (req, res) => {
  console.log('🔐 [AUTH] Intento de login');
  console.log('📋 [AUTH] Body recibido:', req.body);
  console.log('📋 [AUTH] Headers:', req.headers);
  
  try {
    const { nickname, password } = req.body;

    // Validar que se proporcionen los campos requeridos
    if (!nickname || !password) {
      console.log('❌ [AUTH] Campos faltantes - nickname:', !!nickname, 'password:', !!password);
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'Nickname y contraseña son obligatorios'
      });
    }

    // Buscar usuario en la base de datos
    const result = await query(
      'SELECT * FROM usuarios WHERE nickname = $1',
      [nickname]
    );

    if (result.rows.length === 0) {
      console.log('❌ [AUTH] Usuario no encontrado:', nickname);
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos'
      });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      console.log('❌ [AUTH] Contraseña incorrecta para usuario:', nickname);
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user.usuario_id, 
        nickname: user.nickname,
        rol: user.rol || 'user'
      },
      process.env.JWT_SECRET || 'tu_secreto_jwt',
      { expiresIn: '24h' }
    );

    console.log('✅ [AUTH] Login exitoso para usuario:', nickname);
    
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.usuario_id,
        nickname: user.nickname,
        rol: user.rol || 'user'
      }
    });

  } catch (error) {
    console.error('❌ [AUTH] Error en login:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error durante el proceso de autenticación'
    });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token requerido',
        message: 'Se requiere un token de autenticación'
      });
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
    
    res.json({
      valid: true,
      user: {
        id: decoded.userId,
        username: decoded.username,
        role: decoded.role
      }
    });

  } catch (error) {
    console.error('❌ [AUTH] Error verificando token:', error.message);
    res.status(401).json({
      error: 'Token inválido',
      message: 'El token proporcionado no es válido'
    });
  }
});

// Logout (opcional - el cliente puede simplemente eliminar el token)
router.post('/logout', (req, res) => {
  console.log('🔐 [AUTH] Logout solicitado');
  res.json({
    message: 'Logout exitoso',
    note: 'El token debe ser eliminado del lado del cliente'
  });
});

// Obtener usuario actual
router.get('/me', authenticateToken, async (req, res) => {
  console.log('👤 [AUTH] Verificando usuario actual:', req.user?.nickname);
  try {
    await getCurrentUser(req, res);
  } catch (error) {
    console.error('❌ [AUTH] Error obteniendo usuario actual:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Cambiar contraseña
router.post('/change-password', authenticateToken, async (req, res) => {
  console.log('🔑 [AUTH] Cambio de contraseña solicitado para usuario:', req.user?.nickname);
  try {
    await changePassword(req, res);
  } catch (error) {
    console.error('❌ [AUTH] Error cambiando contraseña:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 