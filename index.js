// Entry point para arrancar el servidor
console.log('[INDEX] Iniciando aplicacion GestorDeCoches...');
require('dotenv').config({ path: './config.env' });
require('./src/app'); 