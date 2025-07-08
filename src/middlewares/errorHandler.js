// Middleware para manejo seguro de errores
const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';
  const method = req.method;
  const url = req.url;

  // Log del error para debugging
  console.error(`🚨 Error en ${method} ${url}:`);
  console.error(`   IP: ${ip}`);
  console.error(`   User-Agent: ${userAgent}`);
  console.error(`   Timestamp: ${timestamp}`);
  console.error(`   Error: ${err.message}`);
  console.error(`   Stack: ${err.stack}`);

  // Determinar el tipo de error y responder apropiadamente
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      message: err.message,
      timestamp: timestamp
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Token inválido o expirado',
      timestamp: timestamp
    });
  }

  if (err.code === '23505') { // PostgreSQL unique constraint violation
    return res.status(409).json({
      error: 'Conflicto de datos',
      message: 'El registro ya existe',
      timestamp: timestamp
    });
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    return res.status(400).json({
      error: 'Referencia inválida',
      message: 'El registro referenciado no existe',
      timestamp: timestamp
    });
  }

  if (err.code === '42P01') { // PostgreSQL undefined table
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Problema con la base de datos',
      timestamp: timestamp
    });
  }

  // Para errores de base de datos en general
  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({
      error: 'Error de datos',
      message: 'Los datos proporcionados no son válidos',
      timestamp: timestamp
    });
  }

  // Para errores de sintaxis SQL
  if (err.code === '42601') {
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Problema con la consulta a la base de datos',
      timestamp: timestamp
    });
  }

  // Para errores de conexión a la base de datos
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: 'Servicio no disponible',
      message: 'La base de datos no está disponible',
      timestamp: timestamp
    });
  }

  // Para errores de timeout
  if (err.code === 'ETIMEDOUT') {
    return res.status(504).json({
      error: 'Timeout',
      message: 'La operación tardó demasiado tiempo',
      timestamp: timestamp
    });
  }

  // Para errores de memoria
  if (err.code === 'ENOMEM') {
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Problema de recursos del servidor',
      timestamp: timestamp
    });
  }

  // Error genérico (no exponer detalles internos en producción)
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return res.status(500).json({
    error: 'Error interno del servidor',
    message: isDevelopment ? err.message : 'Ha ocurrido un error inesperado',
    ...(isDevelopment && { stack: err.stack }),
    timestamp: timestamp
  });
};

// Middleware para capturar errores no manejados
const unhandledErrorHandler = () => {
  process.on('uncaughtException', (err) => {
    console.error('🚨 Excepción no capturada:', err);
    console.error('Stack:', err.stack);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Promesa rechazada no manejada:', reason);
    console.error('Promise:', promise);
    process.exit(1);
  });
};

// Middleware para validar que el servidor esté funcionando
const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
};

module.exports = {
  errorHandler,
  unhandledErrorHandler,
  healthCheck
}; 