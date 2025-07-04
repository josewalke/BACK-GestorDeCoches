# Guía de Instalación de PostgreSQL

## 🐧 Ubuntu/Debian

### 1. Actualizar el sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
```

### 3. Iniciar y habilitar el servicio
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 4. Configurar el usuario postgres
```bash
sudo -u postgres psql
```

En el prompt de PostgreSQL:
```sql
ALTER USER postgres PASSWORD 'tu_password_seguro';
CREATE DATABASE gestordecoches;
\q
```

### 5. Configurar acceso remoto (opcional)
Editar `/etc/postgresql/*/main/postgresql.conf`:
```
listen_addresses = '*'
```

Editar `/etc/postgresql/*/main/pg_hba.conf`:
```
host    all             all             0.0.0.0/0               md5
```

Reiniciar PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## 🐧 CentOS/RHEL/Rocky Linux

### 1. Instalar PostgreSQL
```bash
sudo dnf install postgresql-server postgresql-contrib -y
# O para versiones más antiguas:
# sudo yum install postgresql-server postgresql-contrib -y
```

### 2. Inicializar la base de datos
```bash
sudo postgresql-setup --initdb
```

### 3. Iniciar y habilitar el servicio
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 4. Configurar el usuario postgres
```bash
sudo -u postgres psql
```

En el prompt de PostgreSQL:
```sql
ALTER USER postgres PASSWORD 'tu_password_seguro';
CREATE DATABASE gestordecoches;
\q
```

## 🪟 Windows Server

### 1. Descargar PostgreSQL
- Ve a https://www.postgresql.org/download/windows/
- Descarga el instalador oficial
- Ejecuta el instalador como administrador

### 2. Configuración durante la instalación
- Puerto: 5432 (por defecto)
- Contraseña para usuario postgres: `tu_password_seguro`
- Locale: Default locale

### 3. Crear la base de datos
```cmd
psql -U postgres
```

En el prompt de PostgreSQL:
```sql
CREATE DATABASE gestordecoches;
\q
```

## 🐳 Docker (Alternativa)

### 1. Instalar Docker
```bash
# Ubuntu/Debian
sudo apt install docker.io docker-compose -y

# CentOS/RHEL
sudo dnf install docker docker-compose -y
```

### 2. Crear docker-compose.yml
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: gestordecoches-db
    environment:
      POSTGRES_DB: gestordecoches
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: tu_password_seguro
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### 3. Ejecutar con Docker
```bash
docker-compose up -d
```

## 🔧 Configuración del Proyecto

### 1. Ejecutar el script de configuración
```bash
cd backend
node setup-server.js
```

### 2. Seguir las instrucciones del script
- Ingresa la información de tu servidor PostgreSQL
- El script creará automáticamente el archivo `.env`

### 3. Inicializar la base de datos
```bash
node init-db.js
```

### 4. Iniciar el servidor
```bash
node index.js
```

## 🔒 Configuración de Seguridad

### 1. Firewall (Ubuntu/Debian)
```bash
sudo ufw allow 5432/tcp
```

### 2. Firewall (CentOS/RHEL)
```bash
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --reload
```

### 3. Firewall (Windows)
- Abrir el Firewall de Windows
- Permitir PostgreSQL en el puerto 5432

## 📊 Verificar la Instalación

### 1. Conectar desde la línea de comandos
```bash
psql -h localhost -U postgres -d gestordecoshes
```

### 2. Verificar las tablas
```sql
\dt
```

### 3. Salir
```sql
\q
```

## 🚨 Solución de Problemas

### Error: "connection refused"
- Verificar que PostgreSQL esté ejecutándose
- Verificar el puerto (5432)
- Verificar la configuración de firewall

### Error: "authentication failed"
- Verificar la contraseña del usuario postgres
- Verificar la configuración de pg_hba.conf

### Error: "database does not exist"
- Crear la base de datos: `CREATE DATABASE gestordecoches;` 