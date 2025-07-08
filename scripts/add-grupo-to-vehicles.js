const { query } = require('../src/config/database');

async function addGrupoToVehicles() {
  try {
    console.log('🚗 Añadiendo campo grupo a la tabla vehiculos...\n');
    
    // 1. Añadir columna grupo a la tabla vehiculos
    console.log('📝 Añadiendo columna grupo...');
    await query(`
      ALTER TABLE vehiculos 
      ADD COLUMN IF NOT EXISTS grupo VARCHAR(10) DEFAULT 'A'
    `);
    console.log('✅ Columna grupo añadida');
    
    // 2. Definir los grupos estándar de rent-a-car
    const gruposRentACar = [
      { codigo: 'A', nombre: 'Económico', descripcion: 'Fiat 500, Renault Twingo, VW Up' },
      { codigo: 'B', nombre: 'Compacto', descripcion: 'VW Golf, Ford Focus, Renault Clio' },
      { codigo: 'C', nombre: 'Intermedio', descripcion: 'VW Passat, Ford Mondeo, BMW Serie 3' },
      { codigo: 'D', nombre: 'Superior', descripcion: 'BMW Serie 5, Mercedes Clase E, Audi A6' },
      { codigo: 'E', nombre: 'Premium', descripcion: 'BMW Serie 7, Mercedes Clase S, Audi A8' },
      { codigo: 'F', nombre: 'SUV', descripcion: 'BMW X3, Mercedes GLC, Audi Q5' },
      { codigo: 'G', nombre: 'Van/Minivan', descripcion: 'VW Transporter, Mercedes Vito, Ford Transit' }
    ];
    
    console.log('\n📋 Grupos estándar de rent-a-car:');
    gruposRentACar.forEach(grupo => {
      console.log(`   ${grupo.codigo} - ${grupo.nombre}: ${grupo.descripcion}`);
    });
    
    // 3. Actualizar vehículos existentes con grupos basados en marca/modelo
    console.log('\n🔄 Asignando grupos a vehículos existentes...');
    
    const vehiculos = await query('SELECT vehiculo_id, marca, modelo FROM vehiculos ORDER BY vehiculo_id');
    
    for (const vehiculo of vehiculos.rows) {
      let grupo = 'A'; // Por defecto
      
      // Lógica para asignar grupo basado en marca/modelo
      const marca = vehiculo.marca.toLowerCase();
      const modelo = vehiculo.modelo.toLowerCase();
      
      if (marca.includes('bmw') || marca.includes('mercedes') || marca.includes('audi')) {
        if (modelo.includes('serie 7') || modelo.includes('clase s') || modelo.includes('a8')) {
          grupo = 'E'; // Premium
        } else if (modelo.includes('serie 5') || modelo.includes('clase e') || modelo.includes('a6')) {
          grupo = 'D'; // Superior
        } else if (modelo.includes('serie 3') || modelo.includes('clase c') || modelo.includes('a4')) {
          grupo = 'C'; // Intermedio
        } else if (modelo.includes('x') || modelo.includes('glc') || modelo.includes('q')) {
          grupo = 'F'; // SUV
        }
      } else if (marca.includes('volkswagen')) {
        if (modelo.includes('golf') || modelo.includes('polo')) {
          grupo = 'B'; // Compacto
        } else if (modelo.includes('passat')) {
          grupo = 'C'; // Intermedio
        } else if (modelo.includes('transporter') || modelo.includes('caddy')) {
          grupo = 'G'; // Van
        }
      } else if (marca.includes('ford')) {
        if (modelo.includes('focus') || modelo.includes('fiesta')) {
          grupo = 'B'; // Compacto
        } else if (modelo.includes('mondeo')) {
          grupo = 'C'; // Intermedio
        } else if (modelo.includes('transit')) {
          grupo = 'G'; // Van
        }
      } else if (marca.includes('toyota')) {
        if (modelo.includes('corolla') || modelo.includes('yaris')) {
          grupo = 'B'; // Compacto
        } else if (modelo.includes('camry')) {
          grupo = 'C'; // Intermedio
        } else if (modelo.includes('rav4')) {
          grupo = 'F'; // SUV
        }
      } else if (marca.includes('honda')) {
        if (modelo.includes('civic') || modelo.includes('jazz')) {
          grupo = 'B'; // Compacto
        } else if (modelo.includes('accord')) {
          grupo = 'C'; // Intermedio
        } else if (modelo.includes('cr-v')) {
          grupo = 'F'; // SUV
        }
      } else if (marca.includes('fiat') || marca.includes('renault')) {
        if (modelo.includes('500') || modelo.includes('twingo') || modelo.includes('clio')) {
          grupo = 'A'; // Económico
        }
      }
      
      // Actualizar vehículo con el grupo asignado
      await query(`
        UPDATE vehiculos 
        SET grupo = $1 
        WHERE vehiculo_id = $2
      `, [grupo, vehiculo.vehiculo_id]);
      
      console.log(`   ✅ ${vehiculo.marca} ${vehiculo.modelo} → Grupo ${grupo}`);
    }
    
    // 4. Mostrar estadísticas finales
    console.log('\n📊 Estadísticas por grupo:');
    const estadisticas = await query(`
      SELECT grupo, COUNT(*) as total 
      FROM vehiculos 
      GROUP BY grupo 
      ORDER BY grupo
    `);
    
    estadisticas.rows.forEach(stat => {
      console.log(`   Grupo ${stat.grupo}: ${stat.total} vehículos`);
    });
    
    console.log('\n✅ Campo grupo añadido y asignado correctamente');
    console.log('💡 Ahora cada vehículo tiene su grupo estándar de rent-a-car');
    
  } catch (error) {
    console.error('❌ Error añadiendo grupo:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addGrupoToVehicles();
}

module.exports = { addGrupoToVehicles }; 