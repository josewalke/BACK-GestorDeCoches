const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('🔐 Obteniendo token de autenticación...');
    
    // Login para obtener token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      nickname: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token obtenido correctamente');
    
    // Probar endpoint de coches
    console.log('🚗 Probando endpoint de coches...');
    const cochesResponse = await axios.get('http://localhost:3001/api/coches', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Endpoint funcionando correctamente');
    console.log(`📊 Total de coches: ${cochesResponse.data.length}`);
    
    console.log('\n📋 Coches obtenidos:');
    cochesResponse.data.forEach(coche => {
      console.log(`  - ${coche.marca} ${coche.modelo} (${coche.año}) - ${coche.estado} - €${coche.precio}`);
    });
    
    // Calcular estadísticas
    const stats = {
      total: cochesResponse.data.length,
      disponibles: cochesResponse.data.filter(c => c.estado === 'disponible').length,
      vendidos: cochesResponse.data.filter(c => c.estado === 'vendido').length,
      indisponibles: cochesResponse.data.filter(c => c.estado === 'indisponible').length
    };
    
    console.log('\n📊 Estadísticas:');
    console.log(`  - Total: ${stats.total}`);
    console.log(`  - Disponibles: ${stats.disponibles}`);
    console.log(`  - Vendidos: ${stats.vendidos}`);
    console.log(`  - Indisponibles: ${stats.indisponibles}`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testEndpoint(); 