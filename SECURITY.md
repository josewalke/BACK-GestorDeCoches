# 🔒 Medidas de Seguridad del Backend

## 🛡️ Protección contra Ataques de Bots y DDoS

### 📊 Rate Limiting
- **Rate Limiter General**: 100 requests por 15 minutos por IP
- **Rate Limiter Login**: 5 intentos por 15 minutos por IP
- **Rate Limiter API**: 50 requests por 10 minutos por IP
- **Slow Down**: Ralentiza requests después de 50 peticiones

### 🌐 CORS (Cross-Origin Resource Sharing)
- **Orígenes permitidos**: Solo localhost y dominios específicos
- **Métodos permitidos**: GET, POST, PUT, DELETE, OPTIONS
- **Headers permitidos**: Content-Type, Authorization, X-Requested-With
- **Credentials**: Habilitado para cookies

### 🚨 Detección de Bots
- **User-Agent Analysis**: Detecta patrones de bots conocidos
- **Logging**: Registra requests sospechosos
- **Patrones detectados**: bot, crawler, spider, scraper, curl, wget, python, php

### 🛡️ Headers de Seguridad (Helmet)
- **X-Frame-Options**: Previene clickjacking
- **X-Content-Type-Options**: Previene MIME sniffing
- **X-XSS-Protection**: Protección XSS básica
- **Strict-Transport-Security**: Fuerza HTTPS
- **Content-Security-Policy**: Política de seguridad de contenido

### 🚨 Prevención de Inyección
- **SQL Injection**: Detecta patrones SQL maliciosos
- **XSS**: Bloquea scripts y event handlers
- **JavaScript Injection**: Previene ejecución de código JS
- **Sanitización**: Limpia inputs automáticamente

### 📏 Límites de Payload
- **Tamaño máximo**: 1MB por request
- **Content-Type**: Validación estricta para JSON
- **Compresión**: Habilitada para optimizar tráfico

## 🔐 Autenticación y Autorización

### JWT (JSON Web Tokens)
- **Expiración**: 24 horas
- **Algoritmo**: HMAC SHA256
- **Payload**: userId, username, role
- **Verificación**: Middleware automático

### Contraseñas
- **Hash**: bcryptjs con 12 rondas de salt
- **Validación**: Fortaleza de contraseña
- **Requisitos**: 8+ caracteres, mayúsculas, minúsculas, números, símbolos

### Roles y Permisos
- **Middleware**: requireRole() para endpoints específicos
- **Logging**: Registra intentos de acceso denegado
- **Roles**: admin, user (extensible)

## 📝 Logging y Monitoreo

### Logs de Seguridad
- **Requests sospechosos**: IP, User-Agent, URL, timestamp
- **Intentos de inyección**: Payload completo bloqueado
- **Acceso denegado**: Usuario, recurso, roles requeridos
- **Rate limiting**: IPs bloqueadas

### Health Check
- **Endpoint**: `/health`
- **Información**: Estado, uptime, memoria, entorno
- **Monitoreo**: Fácil integración con herramientas externas

## 🚀 Configuración de Producción

### Variables de Entorno
```env
NODE_ENV=production
JWT_SECRET=tu_secreto_super_seguro_aqui
PORT=3000
```

### Headers Recomendados
```nginx
# Nginx configuration
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## 🧪 Testing de Seguridad

### Script de Pruebas
```bash
node scripts/test-security.js
```

**Pruebas incluidas:**
- Rate limiting
- CORS
- Inyección de código
- Headers de seguridad
- Límites de payload
- Detección de bots

## 📊 Métricas de Seguridad

### Endpoints de Monitoreo
- `GET /health` - Estado del servidor
- `GET /info` - Información del sistema
- Logs automáticos de seguridad

### Alertas Recomendadas
- Múltiples requests 429 (Rate Limit)
- Requests con User-Agent sospechoso
- Intentos de inyección bloqueados
- Errores 403 (CORS/Acceso denegado)

## 🔧 Configuración Avanzada

### Personalización de Rate Limiting
```javascript
// En src/middlewares/security.js
const customLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Mensaje personalizado'
});
```

### Agregar Orígenes CORS
```javascript
// En src/middlewares/security.js
const allowedOrigins = [
  'http://localhost:5173',
  'https://tudominio.com',
  'https://app.tudominio.com'
];
```

### Logging Personalizado
```javascript
// En src/middlewares/security.js
const customLogger = (req, res, next) => {
  // Tu lógica de logging personalizada
  next();
};
```

## 🚨 Respuesta a Incidentes

### Procedimientos
1. **Detección**: Logs automáticos
2. **Análisis**: Revisar logs de seguridad
3. **Contención**: Rate limiting automático
4. **Eliminación**: Bloqueo de IPs maliciosas
5. **Recuperación**: Monitoreo continuo

### Contactos de Emergencia
- **Desarrollador**: [Tu contacto]
- **Hosting**: [Proveedor de hosting]
- **Backup**: [Contacto de respaldo]

## 📚 Recursos Adicionales

### Documentación
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practices-security.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js Documentation](https://helmetjs.github.io/)

### Herramientas Recomendadas
- **Monitoreo**: PM2, New Relic, DataDog
- **Logs**: Winston, Bunyan
- **Testing**: OWASP ZAP, Burp Suite
- **SSL**: Let's Encrypt

---

**⚠️ Importante**: Esta configuración proporciona una base sólida de seguridad, pero debe ser revisada y actualizada regularmente según las necesidades específicas de tu aplicación. 