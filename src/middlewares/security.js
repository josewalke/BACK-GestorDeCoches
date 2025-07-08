const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Rate limiting para prevenir ataques de bots
const createRateLimiters = () => {
  // Rate limiter general - máximo 100 requests por 15 minutos por IP
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: {
      error: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Demasiadas peticiones desde esta IP',
        message: 'Por favor, espera 15 minutos antes de intentar de nuevo',
        retryAfter: Math.ceil(15 * 60 / 60) // minutos
      });
    }
  });

  // Rate limiter más estricto para login - máximo 5 intentos por 15 minutos
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos de login
    message: {
      error: 'Demasiados intentos de login, intenta de nuevo en 15 minutos',
      code: 'LOGIN_RATE_LIMIT_EXCEEDED'
    },
    skipSuccessfulRequests: true, // no contar requests exitosos
    handler: (req, res) => {
      res.status(429).json({
        error: 'Demasiados intentos de login',
        message: 'Por favor, espera 15 minutos antes de intentar de nuevo',
        retryAfter: Math.ceil(15 * 60 / 60)
      });
    }
  });

  // Rate limiter para API endpoints - máximo 50 requests por 10 minutos
  const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 50, // máximo 50 requests por ventana
    message: {
      error: 'Demasiadas peticiones a la API',
      code: 'API_RATE_LIMIT_EXCEEDED'
    },
    handler: (req, res) => {
      res.status(429).json({
        error: 'Demasiadas peticiones a la API',
        message: 'Por favor, espera 10 minutos antes de intentar de nuevo',
        retryAfter: Math.ceil(10 * 60 / 60)
      });
    }
  });

  return { generalLimiter, loginLimiter, apiLimiter };
};

// Slow down para ralentizar requests sospechosos
const createSlowDown = () => {
  return slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutos
    delayAfter: 50, // después de 50 requests
    delayMs: 500, // añadir 500ms de delay por request
    maxDelayMs: 20000, // máximo 20 segundos de delay
    skipSuccessfulRequests: true,
    skipFailedRequests: false
  });
};

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como aplicaciones móviles)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // React dev server
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      // Agregar aquí tu dominio de producción
      // 'https://tudominio.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS bloqueado: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true, // permitir cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // cache preflight por 24 horas
};

// Middleware para validar y sanitizar requests
const validateRequest = (req, res, next) => {
  // Verificar que el Content-Type sea correcto para POST/PUT
  if ((req.method === 'POST' || req.method === 'PUT') && 
      req.headers['content-type'] && 
      !req.headers['content-type'].includes('application/json')) {
    return res.status(400).json({
      error: 'Content-Type inválido',
      message: 'Se requiere application/json'
    });
  }

  // Verificar tamaño del body (máximo 1MB)
  const contentLength = parseInt(req.headers['content-length'] || '0');
  if (contentLength > 1024 * 1024) { // 1MB
    return res.status(413).json({
      error: 'Payload demasiado grande',
      message: 'El tamaño máximo permitido es 1MB'
    });
  }

  next();
};

// Middleware para logging de requests sospechosos
const suspiciousRequestLogger = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.ip || req.connection.remoteAddress;
  
  // Detectar bots y requests sospechosos
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /php/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious) {
    console.log(`🚨 Request sospechoso detectado:`);
    console.log(`   IP: ${ip}`);
    console.log(`   User-Agent: ${userAgent}`);
    console.log(`   URL: ${req.method} ${req.url}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
  }
  
  next();
};

// Middleware para prevenir ataques de inyección
const preventInjection = (req, res, next) => {
  const body = req.body;
  const query = req.query;
  
  // Función para detectar patrones sospechosos
  const hasSuspiciousPattern = (obj) => {
    if (!obj) return false;
    
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /update\s+set/i
    ];
    
    const checkValue = (value) => {
      if (typeof value === 'string') {
        return suspiciousPatterns.some(pattern => pattern.test(value));
      }
      if (typeof value === 'object') {
        return Object.values(value).some(checkValue);
      }
      return false;
    };
    
    return checkValue(obj);
  };
  
  if (hasSuspiciousPattern(body) || hasSuspiciousPattern(query)) {
    console.log(`🚨 Posible ataque de inyección detectado:`);
    console.log(`   IP: ${req.ip}`);
    console.log(`   URL: ${req.method} ${req.url}`);
    console.log(`   Body: ${JSON.stringify(body)}`);
    console.log(`   Query: ${JSON.stringify(query)}`);
    
    return res.status(400).json({
      error: 'Request inválido',
      message: 'Se detectó contenido sospechoso en la petición'
    });
  }
  
  next();
};

// Configuración de Helmet para headers de seguridad
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};

// Middleware principal de seguridad
const securityMiddleware = (app) => {
  // Configurar Helmet
  app.use(helmet(helmetConfig));
  
  // Configurar CORS
  app.use(require('cors')(corsOptions));
  
  // Configurar compresión
  app.use(compression());
  
  // Configurar logging
  app.use(morgan('combined'));
  
  // Aplicar rate limiters
  const { generalLimiter, loginLimiter, apiLimiter } = createRateLimiters();
  app.use(generalLimiter);
  app.use('/api/auth/login', loginLimiter);
  app.use('/api', apiLimiter);
  
  // Aplicar slow down
  app.use(createSlowDown());
  
  // Middlewares de validación
  app.use(validateRequest);
  app.use(suspiciousRequestLogger);
  app.use(preventInjection);
  
  // Middleware para manejar errores de CORS
  app.use((err, req, res, next) => {
    if (err.message === 'No permitido por CORS') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Origen no permitido'
      });
    }
    next(err);
  });
};

module.exports = {
  securityMiddleware,
  createRateLimiters,
  createSlowDown,
  corsOptions,
  validateRequest,
  suspiciousRequestLogger,
  preventInjection
}; 