const axios = require('axios');

async function testSecurity() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 Probando medidas de seguridad del backend...\n');
  
  try {
    // 1. Test de rate limiting
    console.log('📊 Probando rate limiting...');
    const promises = [];
    
    // Enviar 10 requests rápidos para probar rate limiting
    for (let i = 0; i < 10; i++) {
      promises.push(
        axios.get(`${baseURL}/health`)
          .then(() => console.log(`   ✅ Request ${i + 1} exitoso`))
          .catch(err => {
            if (err.response?.status === 429) {
              console.log(`   🚫 Request ${i + 1} bloqueado por rate limiting`);
            } else {
              console.log(`   ❌ Request ${i + 1} falló: ${err.message}`);
            }
          })
      );
    }
    
    await Promise.all(promises);
    
    // 2. Test de CORS
    console.log('\n🌐 Probando CORS...');
    try {
      const corsResponse = await axios.get(`${baseURL}/health`, {
        headers: {
          'Origin': 'http://malicious-site.com'
        }
      });
      console.log('   ❌ CORS no bloqueó origen malicioso');
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('   ✅ CORS bloqueó origen malicioso correctamente');
      } else {
        console.log(`   ⚠️ Error de CORS: ${err.message}`);
      }
    }
    
    // 3. Test de inyección de código
    console.log('\n🚨 Probando protección contra inyección...');
    const injectionTests = [
      { name: 'XSS básico', payload: '<script>alert("xss")</script>' },
      { name: 'SQL Injection', payload: "'; DROP TABLE users; --" },
      { name: 'JavaScript injection', payload: 'javascript:alert("xss")' },
      { name: 'Event handler', payload: 'onclick="alert(\'xss\')"' }
    ];
    
    for (const test of injectionTests) {
      try {
        await axios.post(`${baseURL}/api/auth/login`, {
          username: test.payload,
          password: test.payload
        });
        console.log(`   ❌ ${test.name} no fue bloqueado`);
      } catch (err) {
        if (err.response?.status === 400) {
          console.log(`   ✅ ${test.name} fue bloqueado correctamente`);
        } else {
          console.log(`   ⚠️ ${test.name}: ${err.message}`);
        }
      }
    }
    
    // 4. Test de headers de seguridad
    console.log('\n🛡️ Verificando headers de seguridad...');
    try {
      const response = await axios.get(`${baseURL}/health`);
      const headers = response.headers;
      
      const securityHeaders = {
        'x-frame-options': 'X-Frame-Options',
        'x-content-type-options': 'X-Content-Type-Options',
        'x-xss-protection': 'X-XSS-Protection',
        'strict-transport-security': 'Strict-Transport-Security'
      };
      
      let headersFound = 0;
      for (const [key, headerName] of Object.entries(securityHeaders)) {
        if (headers[key]) {
          console.log(`   ✅ ${headerName} presente`);
          headersFound++;
        } else {
          console.log(`   ❌ ${headerName} ausente`);
        }
      }
      
      console.log(`   📊 ${headersFound}/${Object.keys(securityHeaders).length} headers de seguridad encontrados`);
      
    } catch (err) {
      console.log(`   ❌ Error verificando headers: ${err.message}`);
    }
    
    // 5. Test de payload size limit
    console.log('\n📏 Probando límite de tamaño de payload...');
    const largePayload = 'x'.repeat(2 * 1024 * 1024); // 2MB
    
    try {
      await axios.post(`${baseURL}/api/auth/login`, {
        username: 'test',
        password: largePayload
      });
      console.log('   ❌ Payload grande no fue bloqueado');
    } catch (err) {
      if (err.response?.status === 413) {
        console.log('   ✅ Payload grande fue bloqueado correctamente');
      } else {
        console.log(`   ⚠️ Error con payload grande: ${err.message}`);
      }
    }
    
    // 6. Test de User-Agent sospechoso
    console.log('\n🤖 Probando detección de bots...');
    const suspiciousUserAgents = [
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'curl/7.68.0',
      'python-requests/2.25.1',
      'wget/1.20.3'
    ];
    
    for (const userAgent of suspiciousUserAgents) {
      try {
        await axios.get(`${baseURL}/health`, {
          headers: {
            'User-Agent': userAgent
          }
        });
        console.log(`   ⚠️ User-Agent sospechoso no fue detectado: ${userAgent}`);
      } catch (err) {
        console.log(`   ✅ User-Agent sospechoso detectado: ${userAgent}`);
      }
    }
    
    console.log('\n🎉 Pruebas de seguridad completadas');
    console.log('💡 Revisa los logs del servidor para ver detalles de las detecciones');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
  }
}

// Solo ejecutar si se llama directamente
if (require.main === module) {
  testSecurity();
}

module.exports = { testSecurity }; 