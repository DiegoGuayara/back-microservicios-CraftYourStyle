# Documentación del Gateway API - CraftYourStyle

## Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura del Gateway](#arquitectura-del-gateway)
3. [Configuración](#configuración)
4. [Rutas y Mapeo](#rutas-y-mapeo)
5. [Funcionamiento del Proxy](#funcionamiento-del-proxy)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Variables de Entorno](#variables-de-entorno)
8. [Manejo de Errores](#manejo-de-errores)
9. [Logging y Monitoreo](#logging-y-monitoreo)

---

## Descripción General

El **Gateway API** es el punto de entrada único para todos los microservicios del sistema CraftYourStyle. Actúa como intermediario entre los clientes (frontend, aplicaciones móviles) y los microservicios backend.

**Tecnología:** TypeScript + Express + http-proxy-middleware  
**Puerto:** 1010 (configurable)  
**Patrón:** API Gateway Pattern

### Beneficios del Gateway

1. **Punto de entrada único**: Los clientes solo necesitan conocer una URL
2. **Simplicidad**: Oculta la complejidad de la arquitectura de microservicios
3. **Enrutamiento centralizado**: Todas las rutas en un solo lugar
4. **Logging centralizado**: Registro de todas las peticiones
5. **Manejo de errores**: Respuestas consistentes en caso de fallas

---

## Arquitectura del Gateway

### Flujo de una Petición

```
Cliente (Frontend/Mobile)
    ↓
    ↓ HTTP Request: GET /api/usuarios/1
    ↓
Gateway (Puerto 1010)
    ↓
    ↓ Identifica ruta: /api/usuarios
    ↓ Reescribe path: /1
    ↓ Proxy a: http://usuarios:8080/v1/usuarios/1
    ↓
Microservicio de Usuarios (Puerto 8080)
    ↓
    ↓ Procesa petición
    ↓
← Respuesta (200 OK + datos usuario)
    ↓
Gateway
    ↓
← Cliente recibe respuesta
```

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────┐
│           Gateway API (Puerto 1010)         │
├─────────────────────────────────────────────┤
│  /api/transacciones  → transacciones:10101  │
│  /api/personalizacion → personalizacion:10102│
│  /api/catalogo       → catalogo:10103       │
│  /api/notificaciones → notificaciones:10104 │
│  /api/usuarios       → usuarios:8080        │
└─────────────────────────────────────────────┘
         ↓           ↓           ↓
    ┌────────┐  ┌────────┐  ┌────────┐
    │  MS 1  │  │  MS 2  │  │  MS 3  │
    └────────┘  └────────┘  └────────┘
```

---

## Configuración

### Instalación de Dependencias

```bash
npm install express http-proxy-middleware dotenv
npm install --save-dev typescript @types/express @types/node
```

### Archivo package.json

```json
{
  "name": "gateway",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node index.ts",
    "start": "node dist/index.js",
    "build": "tsc"
  },
  "dependencies": {
    "express": "^4.18.0",
    "http-proxy-middleware": "^2.0.0",
    "dotenv": "^16.0.0"
  }
}
```

---

## Rutas y Mapeo

### Tabla de Rutas

| Ruta Gateway | Microservicio Destino | Puerto | Descripción |
|--------------|----------------------|--------|-------------|
| `/api/transacciones` | transacciones | 10101 | Gestión de cuentas bancarias |
| `/api/personalizacion` | personalizacion | 10102 | Personalización de productos |
| `/api/catalogo` | catalogo | 10103 | Catálogo de productos y tiendas |
| `/api/notificaciones` | notificaciones | 10104 | Sistema de notificaciones |
| `/api/usuarios` | usuarios | 8080 | Autenticación y usuarios |

### Reescritura de Rutas (Path Rewrite)

El Gateway elimina el prefijo `/api/{servicio}` antes de enviar la petición al microservicio:

**Ejemplos:**

```
Cliente solicita: GET /api/usuarios/5
Gateway envía a:   GET http://usuarios:8080/v1/usuarios/5

Cliente solicita: POST /api/transacciones/crearCuenta
Gateway envía a:   POST http://transacciones:10101/crearCuenta

Cliente solicita: GET /api/catalogo/productos
Gateway envía a:   GET http://catalogo:10103/productos
```

---

## Funcionamiento del Proxy

### Middleware de Proxy

El Gateway utiliza `http-proxy-middleware` para redirigir peticiones:

```typescript
const proxy = createProxyMiddleware({
  target: 'http://transacciones:10101',  // URL destino
  changeOrigin: true,                     // Cambia Host header
  pathRewrite: { '^/api/transacciones': '' } // Reescribe path
});
```

### Opciones del Proxy

| Opción | Valor | Descripción |
|--------|-------|-------------|
| **target** | URL del microservicio | Destino de las peticiones |
| **changeOrigin** | true | Cambia el header 'Host' al del target |
| **pathRewrite** | Objeto con regex | Reescribe el path antes de enviar |

---

## Ejemplos de Uso

### Desde el Frontend (JavaScript/Fetch)

```javascript
const GATEWAY_URL = "http://localhost:1010";

// 1. Registrar un usuario
async function registrarUsuario() {
  const nuevoUsuario = {
    nombre: "Juan Pérez",
    email: "juan@example.com",
    contraseña: "123456"
  };
  
  const response = await fetch(`${GATEWAY_URL}/api/usuarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(nuevoUsuario)
  });
  
  const data = await response.json();
  console.log('Usuario creado:', data);
}

// 2. Obtener productos del catálogo
async function obtenerProductos() {
  const response = await fetch(`${GATEWAY_URL}/api/catalogo/productos`);
  const productos = await response.json();
  console.log('Productos:', productos);
}

// 3. Crear una cuenta bancaria
async function crearCuenta() {
  const cuenta = {
    numero_de_cuenta: "1234567890",
    tipo_de_cuenta: "debito",
    banco: "Bancolombia",
    id_user: 1
  };
  
  const response = await fetch(`${GATEWAY_URL}/api/transacciones/crearCuenta`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cuenta)
  });
  
  const data = await response.json();
  console.log('Cuenta creada:', data);
}
```

---

### Desde React (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:1010/api'
});

// Login de usuario
async function login(email, password) {
  try {
    const response = await api.post('/usuarios/login', {
      email: email,
      contraseña: password
    });
    
    const { token, usuario } = response.data;
    localStorage.setItem('token', token);
    console.log('Login exitoso:', usuario);
  } catch (error) {
    console.error('Error en login:', error.response.data);
  }
}

// Obtener notificaciones
async function obtenerNotificaciones(userId) {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get(`/notificaciones/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Notificaciones:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

---

### Usando cURL

```bash
# 1. Verificar que el gateway está activo
curl http://localhost:1010/

# 2. Registrar usuario a través del gateway
curl -X POST http://localhost:1010/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María García",
    "email": "maria@example.com",
    "contraseña": "password123"
  }'

# 3. Login
curl -X POST http://localhost:1010/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "contraseña": "password123"
  }'

# 4. Obtener productos
curl http://localhost:1010/api/catalogo/productos

# 5. Crear transacción
curl -X POST http://localhost:1010/api/transacciones/crearCuenta \
  -H "Content-Type: application/json" \
  -d '{
    "numero_de_cuenta": "9876543210",
    "tipo_de_cuenta": "credito",
    "banco": "Davivienda",
    "id_user": 1
  }'
```

---

## Variables de Entorno

### Archivo .env

El Gateway puede ser configurado mediante variables de entorno:

```env
# Puerto del Gateway
PORT=1010

# URLs de los microservicios (opcional)
TRANSACCIONES_URL=http://localhost:10101
PERSONALIZACION_URL=http://localhost:10102
CATALOGO_URL=http://localhost:10103
NOTIFICACIONES_URL=http://localhost:10104
USUARIOS_URL=http://localhost:8080
```

### Valores por Defecto

Si no se configuran las variables de entorno, se usan estos valores:

```typescript
{
  TRANSACCIONES_URL: "http://transacciones:10101",
  PERSONALIZACION_URL: "http://personalizacion:10102",
  CATALOGO_URL: "http://catalogo:10103",
  NOTIFICACIONES_URL: "http://notificaciones:10104",
  USUARIOS_URL: "http://usuarios:8080"
}
```

**Nota:** Los nombres de servicio (`transacciones`, `personalizacion`, etc.) son nombres de contenedores Docker definidos en `docker-compose.yml`.

---

## Manejo de Errores

### Tipos de Errores

#### 1. Error 502 - Bad Gateway

**Cuándo ocurre:**
- El microservicio destino no está disponible
- El microservicio no responde
- Error de conexión de red

**Respuesta del Gateway:**

```json
{
  "error": "Error al conectar con el servicio"
}
```

**Ejemplo en consola:**

```
Error en proxy /api/usuarios: connect ECONNREFUSED 127.0.0.1:8080
```

#### 2. Errores del Microservicio

Si el microservicio responde pero con error, el Gateway reenvía la respuesta tal cual:

**Ejemplo: Usuario no encontrado (404)**

```json
{
  "message": "usuario no encontrado"
}
```

**Ejemplo: Email duplicado (409)**

```json
{
  "error": true,
  "message": "error este email ya esta registrado"
}
```

---

## Logging y Monitoreo

### Logs de Peticiones

Cada petición que pasa por el Gateway se registra en consola:

```
[2025-12-12T05:30:00.000Z] POST /api/usuarios -> http://usuarios:8080
[2025-12-12T05:30:05.123Z] GET /api/catalogo -> http://catalogo:10103
[2025-12-12T05:30:10.456Z] POST /api/transacciones -> http://transacciones:10101
```

**Formato:**
```
[TIMESTAMP] MÉTODO RUTA_GATEWAY -> URL_MICROSERVICIO
```

### Logs de Errores

Cuando hay un error de conexión:

```
Error en proxy /api/usuarios: connect ECONNREFUSED 127.0.0.1:8080
```

---

## Casos de Uso

### Caso 1: Usuario Hace Login desde Frontend

**Flujo:**

1. Usuario ingresa email y contraseña en la interfaz web
2. Frontend envía petición POST al Gateway:
```javascript
POST http://localhost:1010/api/usuarios/login
{
  "email": "juan@example.com",
  "contraseña": "123456"
}
```
3. Gateway reescribe y reenvía a:
```
POST http://usuarios:8080/v1/usuarios/login
```
4. Microservicio de usuarios valida credenciales y retorna token JWT
5. Gateway devuelve la respuesta al frontend
6. Frontend guarda el token y redirige al dashboard

---

### Caso 2: Aplicación Móvil Consulta Productos

**Flujo:**

1. App móvil solicita productos:
```
GET http://localhost:1010/api/catalogo/productos
```
2. Gateway redirige a:
```
GET http://catalogo:10103/productos
```
3. Microservicio de catálogo retorna lista de productos
4. Gateway devuelve productos a la app móvil
5. App muestra productos en pantalla

---

### Caso 3: Error de Conexión

**Flujo:**

1. Cliente solicita:
```
GET http://localhost:1010/api/notificaciones/5
```
2. Gateway intenta conectar con microservicio de notificaciones
3. Microservicio no responde (está apagado o hay error de red)
4. Gateway captura el error y retorna:
```json
HTTP 502 Bad Gateway
{
  "error": "Error al conectar con el servicio"
}
```
5. Cliente maneja el error (muestra mensaje al usuario)

---

## Ventajas del Gateway

### 1. Desacoplamiento

El frontend no necesita conocer las URLs de cada microservicio:

```javascript
// Sin Gateway (malo)
const USUARIOS_URL = "http://localhost:8080";
const TRANSACCIONES_URL = "http://localhost:10101";
const CATALOGO_URL = "http://localhost:10103";
// ... más URLs

// Con Gateway (bueno)
const API_URL = "http://localhost:1010/api";
```

### 2. Seguridad

- Los microservicios pueden estar en red privada
- Solo el Gateway necesita ser accesible públicamente
- Se puede agregar autenticación en el Gateway

### 3. Escalabilidad

- Fácil agregar nuevos microservicios
- Solo se actualiza la configuración del Gateway
- El frontend no necesita cambios

### 4. Monitoreo Centralizado

- Todas las peticiones pasan por el Gateway
- Fácil implementar métricas y analytics
- Logging consistente

---

## Mejoras Futuras

### 1. Autenticación en Gateway

Validar tokens JWT antes de reenviar peticiones:

```typescript
import jwt from 'jsonwebtoken';

app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  
  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
});
```

### 2. Rate Limiting

Limitar número de peticiones por IP:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // 100 peticiones por ventana
});

app.use('/api/', limiter);
```

### 3. CORS Configurado

Permitir peticiones desde dominios específicos:

```typescript
import cors from 'cors';

app.use(cors({
  origin: ['http://localhost:3000', 'https://craftyourstyle.com'],
  credentials: true
}));
```

### 4. Cache de Respuestas

Cachear respuestas de endpoints que no cambian frecuentemente:

```typescript
import apicache from 'apicache';

let cache = apicache.middleware;

// Cachear productos por 5 minutos
app.use('/api/catalogo/productos', cache('5 minutes'));
```

### 5. Health Check

Endpoint para verificar salud de microservicios:

```typescript
app.get('/health', async (req, res) => {
  const services = {
    transacciones: await checkService('http://transacciones:10101'),
    personalizacion: await checkService('http://personalizacion:10102'),
    catalogo: await checkService('http://catalogo:10103'),
    notificaciones: await checkService('http://notificaciones:10104'),
    usuarios: await checkService('http://usuarios:8080')
  };
  
  res.json(services);
});

async function checkService(url: string) {
  try {
    await axios.get(url, { timeout: 2000 });
    return 'UP';
  } catch (error) {
    return 'DOWN';
  }
}
```

---

## Docker y Despliegue

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 1010

CMD ["node", "dist/index.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  gateway:
    build: ./gateway
    ports:
      - "1010:1010"
    environment:
      - PORT=1010
      - TRANSACCIONES_URL=http://transacciones:10101
      - PERSONALIZACION_URL=http://personalizacion:10102
      - CATALOGO_URL=http://catalogo:10103
      - NOTIFICACIONES_URL=http://notificaciones:10104
      - USUARIOS_URL=http://usuarios:8080
    depends_on:
      - transacciones
      - personalizacion
      - catalogo
      - notificaciones
      - usuarios
    networks:
      - microservices-network

  transacciones:
    build: ./transacciones
    ports:
      - "10101:10101"
    networks:
      - microservices-network

  # ... otros microservicios

networks:
  microservices-network:
    driver: bridge
```

---

## Notas para la Exposición

### Puntos Clave

1. **Patrón API Gateway**
   - Un solo punto de entrada para todos los microservicios
   - Simplifica la comunicación cliente-servidor

2. **Proxy Transparente**
   - Reenvía peticiones automáticamente
   - Reescribe rutas para eliminar prefijos

3. **Logging y Monitoreo**
   - Registra todas las peticiones con timestamp
   - Facilita debugging y auditoría

4. **Manejo de Errores**
   - Responde con 502 si microservicio no disponible
   - Logging de errores para diagnóstico

5. **Configuración Flexible**
   - Variables de entorno para diferentes ambientes
   - Valores por defecto para Docker Compose

---

## Resumen Técnico

| Aspecto | Detalle |
|---------|---------|
| **Framework** | Express (Node.js) |
| **Lenguaje** | TypeScript |
| **Puerto** | 1010 |
| **Librería Proxy** | http-proxy-middleware |
| **Microservicios** | 5 (Transacciones, Personalización, Catálogo, Notificaciones, Usuarios) |
| **Patrón** | API Gateway |

---

## Fin de la Documentación

**Fecha de creación:** 2025-12-12  
**Componente:** Gateway API - CraftYourStyle  
**Puerto:** 1010  
**Versión:** 1.0
