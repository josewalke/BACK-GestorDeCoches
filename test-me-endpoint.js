require('dotenv').config();
const axios = require('axios');

async function testMeEndpoint() {
  try {
    console.log('🔍 Probando endpoint /api/auth/me...');
    console.log('🌐 URL base: http://localhost:3002');
    
    // Primero hacer login para obtener un token válido
    console.log('📝 Intentando login...');
    const loginResponse = await axios.post('http://localhost:3002/api/auth/login', {
      nickname: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso, token obtenido');
    console.log('🔑 Token:', token.substring(0, 50) + '...');
    
    // Ahora probar el endpoint /me
    console.log('📝 Probando endpoint /me...');
    const meResponse = await axios.get('http://localhost:3002/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Endpoint /me funciona correctamente:');
    console.log('Usuario:', meResponse.data);
    
  } catch (error) {
    console.error('❌ Error completo:', error);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
    } else if (error.request) {
      console.error('📋 No se recibió respuesta del servidor');
    } else {
      console.error('📋 Error de configuración:', error.message);
    }
  }
}

testMeEndpoint(); 