const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole, login, getCurrentUser, changePassword } = require('../middlewares/auth');

// Login
router.post('/login', async (req, res) => {
  console.log('🔐 [AUTH] Intento de login para usuario:', req.body.nickname);
  try {
    await login(req, res);
  } catch (error) {
    console.error('❌ [AUTH] Error en login:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
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