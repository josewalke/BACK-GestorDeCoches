const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

// Middleware para autenticar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Token requerido',
      message: 'Se requiere un token de autenticación'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt', (err, decoded) => {
    if (err) {
      console.log('❌ [AUTH] Token inválido:', err.message);
      return res.status(403).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido o ha expirado'
      });
    }

    req.user = decoded;
    next();
  });
};

// Middleware para verificar roles específicos
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Se requiere autenticación'
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log(`❌ [AUTH] Acceso denegado: usuario ${req.user.username} (${req.user.role}) intentó acceder a recurso que requiere roles: ${roles.join(', ')}`);
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};

// Función para crear hash de contraseña
const hashPassword = async (password) => {
  const saltRounds = 12; // Número de rondas de salt (más alto = más seguro pero más lento)
  return await bcrypt.hash(password, saltRounds);
};

// Función para verificar contraseña
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Función para generar token JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.usuario_id,
      username: user.username,
      role: user.role || 'user'
    },
    process.env.JWT_SECRET || 'tu_secreto_jwt',
    { expiresIn: '24h' }
  );
};

// Función para validar fortaleza de contraseña
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`La contraseña debe tener al menos ${minLength} caracteres`);
  }
  if (!hasUpperCase) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }
  if (!hasLowerCase) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }
  if (!hasNumbers) {
    errors.push('La contraseña debe contener al menos un número');
  }
  if (!hasSpecialChar) {
    errors.push('La contraseña debe contener al menos un carácter especial');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Función para sanitizar entrada de usuario
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+\s*=/gi, ''); // Remover event handlers
};

// Middleware para sanitizar inputs
const sanitizeInputs = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }

  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeInput(req.query[key]);
      }
    });
  }

  next();
};

// Función de login
async function login(req, res) {
  try {
    const { nickname, password } = req.body;

    if (!nickname || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Buscar usuario en la base de datos
    const result = await query(
      'SELECT * FROM usuarios WHERE nickname = $1 AND activo = true',
      [nickname]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const validPassword = await verifyPassword(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Generar token JWT
    const token = generateToken(user);

    // Enviar respuesta
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        usuario_id: user.usuario_id,
        nickname: user.nickname,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Función para obtener información del usuario actual
async function getCurrentUser(req, res) {
  try {
    const result = await query(
      'SELECT usuario_id, nickname, rol, activo, fecha_creacion FROM usuarios WHERE usuario_id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Función para cambiar contraseña
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }

    // Obtener usuario actual
    const userResult = await query(
      'SELECT password_hash FROM usuarios WHERE usuario_id = $1',
      [req.user.usuario_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const validPassword = await verifyPassword(currentPassword, userResult.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Encriptar nueva contraseña
    const hashedNewPassword = await hashPassword(newPassword);

    // Actualizar contraseña
    await query(
      'UPDATE usuarios SET password_hash = $1 WHERE usuario_id = $2',
      [hashedNewPassword, req.user.usuario_id]
    );

    res.json({ message: 'Contraseña actualizada exitosamente' });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  authenticateToken,
  requireRole,
  hashPassword,
  verifyPassword,
  generateToken,
  validatePasswordStrength,
  sanitizeInput,
  sanitizeInputs,
  login,
  getCurrentUser,
  changePassword
}; 