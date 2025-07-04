require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar rutas
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar JWT_SECRET si no está definido
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'mi_clave_secreta_super_segura_2024';
  console.log('⚠️ [APP] JWT_SECRET no configurado, usando valor por defecto');
}

console.log('🚀 [APP] Iniciando servidor GestorDeCoches...');
console.log(`📊 [APP] Puerto configurado: ${PORT}`);
console.log(`🔐 [APP] Autenticación JWT: ${process.env.JWT_SECRET ? 'Habilitada' : 'Deshabilitada'}`);

// Middleware para CORS y parsear JSON
app.use(cors());
app.use(express.json());

// Middleware de logging para todas las peticiones
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📝 [${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Configurar rutas
app.use('/api', routes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ [APP] Error no manejado:', err.message);
  console.error('📋 [APP] Stack trace:', err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  console.log(`❌ [APP] Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('✅ [APP] Servidor backend iniciado correctamente');
  console.log(`🌐 [APP] URL: http://localhost:${PORT}`);
  console.log(`📊 [APP] Base de datos: PostgreSQL`);
  console.log(`🔐 [APP] Autenticación: JWT habilitada`);
  console.log('🎯 [APP] Servidor listo para recibir peticiones');
});

// Manejo de señales para cierre graceful
process.on('SIGINT', () => {
  console.log('\n🛑 [APP] Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 [APP] Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('💥 [APP] Excepción no capturada:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 [APP] Promesa rechazada no manejada:', reason);
  process.exit(1);
});

module.exports = app; 