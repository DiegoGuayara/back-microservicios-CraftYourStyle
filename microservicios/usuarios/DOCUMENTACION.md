# Documentación del Microservicio de Usuarios - CraftYourStyle

## Índice
1. [Descripción General](#descripción-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Tecnologías y Frameworks](#tecnologías-y-frameworks)
4. [Modelo de Datos](#modelo-de-datos)
5. [API Endpoints](#api-endpoints)
6. [Autenticación JWT](#autenticación-jwt)
7. [Seguridad y Encriptación](#seguridad-y-encriptación)
8. [Métodos Detallados](#métodos-detallados)
9. [Ejemplos de Uso](#ejemplos-de-uso)
10. [Comparación con Node.js/Express](#comparación-con-nodejs-express)

---

## Descripción General

El microservicio de **Usuarios** es responsable de la gestión de autenticación y autorización en el sistema CraftYourStyle:
- **Registro de usuarios** con validación de datos
- **Login** con generación de tokens JWT
- **Encriptación** de contraseñas con BCrypt
- **CRUD completo** de usuarios
- **Validaciones** con Jakarta Bean Validation

**Tecnología:** Java + Spring Boot + Spring Security + JWT  
**Puerto:** 8080  
**Base de datos:** MySQL (JPA/Hibernate)

---

## Estructura del Proyecto

```
usuarios/
├── src/
│   ├── main/
│   │   ├── java/com/example/CraftYourStyle2/
│   │   │   ├── CraftYourStyle2Application.java    # Clase principal
│   │   │   ├── config/                            # Configuración
│   │   │   │   ├── FilterConfig.java              # Filtros HTTP
│   │   │   │   ├── JwtFilter.java                 # Filtro JWT
│   │   │   │   ├── JwtUtil.java                   # Utilidades JWT
│   │   │   │   └── SecurityConfig.java            # Seguridad
│   │   │   ├── controllers/                       # Controladores REST
│   │   │   │   └── UserController.java
│   │   │   ├── dto/                               # Data Transfer Objects
│   │   │   │   ├── LoginUserDto.java
│   │   │   │   ├── RegisterUserDto.java
│   │   │   │   └── UserResponse.java
│   │   │   ├── model/                             # Entidades JPA
│   │   │   │   └── User.java
│   │   │   ├── repository/                        # Repositorios JPA
│   │   │   │   └── UserRepository.java
│   │   │   └── services/                          # Lógica de negocio
│   │   │       └── UserServices.java
│   │   └── resources/
│   │       └── application.properties             # Configuración BD
│   └── test/
│       └── java/.../                              # Tests
├── pom.xml                                         # Dependencias Maven
└── Dockerfile                                      # Contenedor Docker
```

---

## Tecnologías y Frameworks

### Java Spring Boot

Spring Boot es un framework de Java que simplifica el desarrollo de aplicaciones:

| Componente | Descripción | Uso en el Proyecto |
|------------|-------------|-------------------|
| **Spring Boot** | Framework principal | Base de la aplicación |
| **Spring Web** | API REST | Controladores HTTP |
| **Spring Data JPA** | ORM (Hibernate) | Acceso a base de datos |
| **Spring Security** | Seguridad | Autenticación y autorización |
| **BCrypt** | Encriptación | Hasheo de contraseñas |
| **JWT** | Tokens | Autenticación sin estado |
| **Jakarta Validation** | Validaciones | Validar DTOs |
| **MySQL Connector** | Driver BD | Conexión a MySQL |

---

## Modelo de Datos

### Entidad: User

```java
@Entity
@Table(name = "usuarios")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nombre;
    private String email;      // ÚNICO
    private String contraseña;  // Encriptada con BCrypt
}
```

### Tabla: usuarios

| Campo | Tipo | Constraint | Descripción |
|-------|------|------------|-------------|
| **id** | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| **nombre** | VARCHAR(255) | NOT NULL | Nombre completo |
| **email** | VARCHAR(255) | NOT NULL, UNIQUE | Correo electrónico |
| **contraseña** | VARCHAR(255) | NOT NULL | Contraseña encriptada |

---

## API Endpoints

### Base URL
```
http://localhost:8080/v1/usuarios
```

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/v1/usuarios` | Obtener todos los usuarios | No |
| POST | `/v1/usuarios` | Registrar nuevo usuario | No |
| POST | `/v1/usuarios/login` | Iniciar sesión (JWT) | No |
| GET | `/v1/usuarios/{id}` | Obtener usuario por ID | No |
| PUT | `/v1/usuarios?email={email}` | Actualizar usuario | No |
| DELETE | `/v1/usuarios/{id}` | Eliminar usuario | No |

**Nota:** En producción, la mayoría de endpoints deberían requerir autenticación JWT.

---

## Autenticación JWT

### ¿Qué es JWT?

**JWT (JSON Web Token)** es un estándar para crear tokens de acceso que permiten autenticación sin estado (stateless).

### Flujo de Autenticación

```
1. Usuario hace login con email + contraseña
    ↓
2. Servidor valida credenciales
    ↓
3. Servidor genera token JWT
    ↓
4. Cliente guarda token (localStorage/cookie)
    ↓
5. Cliente envía token en cada petición:
   Header: Authorization: Bearer <token>
    ↓
6. Servidor valida token antes de procesar
```

### Estructura de un JWT

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqdWFuQGV4YW1wbGUuY29tIiwiaWF0IjoxNjM5...
│──────────────────│ │──────────────────────────────────────────────│
       HEADER                      PAYLOAD (datos usuario)

                                                      │────────────────│
                                                         SIGNATURE
```

**Partes:**
1. **Header**: Algoritmo de encriptación (HS256)
2. **Payload**: Datos del usuario (email, roles, etc.)
3. **Signature**: Firma para verificar autenticidad

### Configuración JWT en el Proyecto

```java
// JwtUtil.java
public String generarToken(String email) {
    return Jwts.builder()
        .setSubject(email)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
        .signWith(getKey(), SignatureAlgorithm.HS256)
        .compact();
}
```

**Expiración:** 10 horas (configurable)

---

## Seguridad y Encriptación

### BCrypt para Contraseñas

**BCrypt** es un algoritmo de hasheo diseñado para contraseñas:

**Características:**
- **No reversible**: Imposible obtener la contraseña original
- **Salt automático**: Cada hash es único, aunque la contraseña sea igual
- **Lento intencionalmente**: Dificulta ataques de fuerza bruta

**Ejemplo:**

```java
// Encriptar al registrar
String hashedPassword = passwordEncoder.encode("123456");
// Resultado: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

// Verificar al hacer login
boolean matches = passwordEncoder.matches("123456", hashedPassword);
// true si coincide
```

### Validaciones con Jakarta

```java
public class RegisterUserDto {
    @NotBlank(message = "el nombre es obligatorio")
    private String nombre;
    
    @Email(message = "el email debe de ser valido")
    private String email;
    
    @NotBlank(message = "la contraseña debe de ser obligatoria")
    @Size(min = 6, message = "la contraseña debe de tener al menos 6 carecteres")
    private String contraseña;
}
```

**Anotaciones:**
- `@NotBlank`: Campo no puede estar vacío
- `@Email`: Debe ser email válido
- `@Size`: Longitud mínima/máxima

---

## Métodos Detallados

### 1. Registrar Usuario

**Endpoint:** `POST /v1/usuarios`

**Proceso:**
1. Validar datos con Jakarta Validation
2. Verificar que email no exista en BD
3. Encriptar contraseña con BCrypt
4. Guardar usuario en BD

**Request:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "contraseña": "password123"
}
```

**Response exitosa (201 Created):**
```json
{
  "Usuario": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "contraseña": "$2a$10$..."
  },
  "message": "usuario creado"
}
```

**Response error - Email duplicado (409 Conflict):**
```json
{
  "error": true,
  "message": "error este email ya esta registrado"
}
```

---

### 2. Login (Autenticación)

**Endpoint:** `POST /v1/usuarios/login`

**Proceso:**
1. Buscar usuario por email
2. Verificar contraseña con BCrypt
3. Generar token JWT
4. Retornar token y datos del usuario (sin contraseña)

**Request:**
```json
{
  "email": "juan@example.com",
  "contraseña": "password123"
}
```

**Response exitosa (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqdWFuQGV4YW1wbGUuY29tIiwiaWF0IjoxNjM5...",
  "usuario": "juan@example.com",
  "message": "Login exitoso"
}
```

**Response error - Usuario no existe (404 Not Found):**
```json
{
  "error": true,
  "message": "usuario no encontrado"
}
```

**Response error - Contraseña incorrecta (401 Unauthorized):**
```json
{
  "error": true,
  "message": "Contraseña incorrecta"
}
```

---

### 3. Obtener Todos los Usuarios

**Endpoint:** `GET /v1/usuarios`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "contraseña": "$2a$10$..."
  },
  {
    "id": 2,
    "nombre": "María García",
    "email": "maria@example.com",
    "contraseña": "$2a$10$..."
  }
]
```

**Nota:** En producción, no se debe retornar la contraseña encriptada.

---

### 4. Obtener Usuario por ID

**Endpoint:** `GET /v1/usuarios/{id}`

**Ejemplo:** `GET /v1/usuarios/5`

**Response (200 OK):**
```json
{
  "message": "usuario encontrado",
  "usuario": {
    "id": 5,
    "nombre": "Pedro López",
    "email": "pedro@example.com",
    "contraseña": "$2a$10$..."
  }
}
```

**Response error (404 Not Found):**
```json
{
  "message": "usuario no encontrado"
}
```

**Response error - ID inválido (400 Bad Request):**
```json
{
  "message": "ID inválido. Debe ser un número mayor a 0."
}
```

---

### 5. Actualizar Usuario

**Endpoint:** `PUT /v1/usuarios?email={email}`

**Ejemplo:** `PUT /v1/usuarios?email=juan@example.com`

**Request (actualización parcial):**
```json
{
  "nombre": "Juan Carlos Pérez"
}
```

O actualizar contraseña:
```json
{
  "contraseña": "newPassword456"
}
```

O ambos:
```json
{
  "nombre": "Juan Carlos Pérez",
  "contraseña": "newPassword456"
}
```

**Response (200 OK):**
```json
{
  "usuario": {
    "id": 1,
    "nombre": "Juan Carlos Pérez",
    "email": "juan@example.com",
    "contraseña": null
  },
  "message": "usuario actualizado"
}
```

**Comportamiento:**
- Si un campo es `null` o vacío, NO se actualiza
- Solo se modifican los campos enviados
- La contraseña se encripta automáticamente si se actualiza

---

### 6. Eliminar Usuario

**Endpoint:** `DELETE /v1/usuarios/{id}`

**Ejemplo:** `DELETE /v1/usuarios/5`

**Response (200 OK):**
```json
{
  "message": "usuario eliminado correctamente"
}
```

**Response error (404 Not Found):**
```json
{
  "mensaje": "Usuario no encontrado."
}
```

---

## Ejemplos de Uso

### Usando cURL

```bash
# 1. Registrar usuario
curl -X POST http://localhost:8080/v1/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ana Martínez",
    "email": "ana@example.com",
    "contraseña": "ana123456"
  }'

# 2. Login
curl -X POST http://localhost:8080/v1/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ana@example.com",
    "contraseña": "ana123456"
  }'

# Respuesta:
# {
#   "token": "eyJhbGciOiJIUzI1NiJ9...",
#   "usuario": "ana@example.com",
#   "message": "Login exitoso"
# }

# 3. Obtener todos los usuarios
curl http://localhost:8080/v1/usuarios

# 4. Obtener usuario por ID
curl http://localhost:8080/v1/usuarios/1

# 5. Actualizar usuario
curl -X PUT "http://localhost:8080/v1/usuarios?email=ana@example.com" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ana María Martínez"
  }'

# 6. Eliminar usuario
curl -X DELETE http://localhost:8080/v1/usuarios/1
```

---

### Usando JavaScript (Fetch)

```javascript
const BASE_URL = "http://localhost:8080/v1/usuarios";

// 1. Registrar usuario
async function registrar() {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nombre: "Carlos Ruiz",
      email: "carlos@example.com",
      contraseña: "carlos123"
    })
  });
  
  const data = await response.json();
  console.log('Usuario registrado:', data);
}

// 2. Login
async function login(email, password) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      contraseña: password
    })
  });
  
  const data = await response.json();
  
  if (data.token) {
    // Guardar token en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', data.usuario);
    console.log('Login exitoso!');
    return data.token;
  } else {
    console.error('Error en login:', data.message);
  }
}

// 3. Obtener usuario por ID (con token)
async function obtenerUsuario(id) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${BASE_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('Usuario:', data.usuario);
}

// 4. Actualizar usuario
async function actualizarUsuario(email, nuevoNombre) {
  const response = await fetch(`${BASE_URL}?email=${email}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nombre: nuevoNombre
    })
  });
  
  const data = await response.json();
  console.log('Usuario actualizado:', data);
}

// 5. Logout (frontend)
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('Sesión cerrada');
}
```

---

### Usando React + Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/v1/usuarios'
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Componente de Login
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/login', {
        email: email,
        contraseña: password
      });
      
      const { token, usuario } = response.data;
      localStorage.setItem('token', token);
      
      alert(`Bienvenido ${usuario}!`);
      // Redirigir al dashboard
    } catch (error) {
      alert(error.response.data.message);
    }
  };
  
  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email} 
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input 
        type="password" 
        value={password} 
        onChange={e => setPassword(e.target.value)}
        placeholder="Contraseña"
      />
      <button type="submit">Login</button>
    </form>
  );
}

// Componente de Registro
function RegisterForm() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleRegister = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/', {
        nombre: nombre,
        email: email,
        contraseña: password
      });
      
      alert('Usuario registrado exitosamente!');
      // Redirigir al login
    } catch (error) {
      if (error.response.status === 409) {
        alert('Este email ya está registrado');
      } else {
        alert('Error al registrar usuario');
      }
    }
  };
  
  return (
    <form onSubmit={handleRegister}>
      <input 
        value={nombre} 
        onChange={e => setNombre(e.target.value)}
        placeholder="Nombre completo"
      />
      <input 
        type="email"
        value={email} 
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input 
        type="password"
        value={password} 
        onChange={e => setPassword(e.target.value)}
        placeholder="Contraseña (mín. 6 caracteres)"
      />
      <button type="submit">Registrar</button>
    </form>
  );
}
```

---

## Comparación con Node.js/Express

### Arquitectura

| Aspecto | Spring Boot (Java) | Express (Node.js) |
|---------|-------------------|-------------------|
| **Lenguaje** | Java (compilado) | JavaScript/TypeScript (interpretado) |
| **Arquitectura** | MVC (Model-View-Controller) | Flexible, generalmente MVC |
| **ORM** | JPA/Hibernate | TypeORM, Sequelize, Prisma |
| **Inyección de dependencias** | Nativa (@Autowired) | Manual o con librerías |
| **Anotaciones** | Extensivas (@RestController, @Service, etc.) | Decoradores (con TypeScript) |
| **Validaciones** | Jakarta Validation (@NotBlank, @Email) | express-validator, class-validator |

---

### Ejemplo Comparativo: Crear Usuario

#### Spring Boot (Java)

```java
// Controller
@PostMapping
public ResponseEntity<Object> registrarUsuario(@Valid @RequestBody RegisterUserDto dto) {
    return this.userServices.crearUsuario(dto);
}

// Service
public ResponseEntity<Object> crearUsuario(RegisterUserDto dto) {
    Optional<User> respuesta = userRepository.findByEmail(dto.getEmail());
    
    if(respuesta.isPresent()) {
        return new ResponseEntity<>(
            Map.of("error", true, "message", "Email ya registrado"),
            HttpStatus.CONFLICT
        );
    }
    
    User user = new User();
    user.setEmail(dto.getEmail());
    user.setContraseña(passwordEncoder.encode(dto.getContraseña()));
    
    userRepository.save(user);
    return new ResponseEntity<>(user, HttpStatus.CREATED);
}
```

#### Express (Node.js/TypeScript)

```typescript
// Controller
async crearUsuario(req: Request, res: Response) {
    const { email, contraseña } = req.body;
    
    const usuarioExiste = await UserRepository.findByEmail(email);
    
    if (usuarioExiste) {
        return res.status(409).json({
            error: true,
            message: "Email ya registrado"
        });
    }
    
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    
    const nuevoUsuario = await UserRepository.create({
        email,
        contraseña: hashedPassword
    });
    
    return res.status(201).json(nuevoUsuario);
}
```

---

### Ventajas de Spring Boot

1. **Tipado fuerte**: Errores detectados en compilación
2. **Ecosistema robusto**: Soluciones maduras para todo
3. **Spring Security**: Seguridad integrada y completa
4. **JPA/Hibernate**: ORM muy potente
5. **Escalabilidad**: Excelente para aplicaciones grandes

### Ventajas de Express

1. **Simplicidad**: Menos boilerplate, más directo
2. **Rapidez de desarrollo**: Prototipado rápido
3. **JavaScript**: Un solo lenguaje (frontend + backend)
4. **Asíncrono por defecto**: Manejo eficiente de I/O
5. **Comunidad grande**: Muchas librerías disponibles

---

## Configuración de la Base de Datos

### application.properties

```properties
# Configuración de MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/CraftYourStyle_Usuarios
spring.datasource.username=root
spring.datasource.password=

# Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# Puerto del servidor
server.port=8080
```

---

## Casos de Uso

### Caso 1: Usuario Se Registra en la Plataforma

**Flujo:**
1. Usuario ingresa nombre, email y contraseña en formulario
2. Frontend envía POST a `/v1/usuarios`
3. Backend valida datos (email válido, contraseña mín. 6 caracteres)
4. Backend verifica que email no exista
5. Backend encripta contraseña con BCrypt
6. Backend guarda usuario en BD
7. Frontend muestra mensaje de éxito

---

### Caso 2: Usuario Hace Login

**Flujo:**
1. Usuario ingresa email y contraseña
2. Frontend envía POST a `/v1/usuarios/login`
3. Backend busca usuario por email
4. Backend verifica contraseña con BCrypt
5. Backend genera token JWT (válido 10 horas)
6. Frontend recibe token y lo guarda en localStorage
7. Frontend redirige al dashboard

---

### Caso 3: Usuario Hace Petición Protegida

**Flujo:**
1. Frontend envía petición con token:
```
GET /api/catalogo/productos
Headers: Authorization: Bearer eyJhbGciOi...
```
2. Gateway reenvía petición al microservicio
3. Microservicio valida token JWT
4. Si token válido, procesa petición
5. Si token inválido, retorna 401 Unauthorized

---

## Mejoras Futuras

### 1. Roles y Permisos

```java
@Entity
public class User {
    // ... campos existentes
    
    @Enumerated(EnumType.STRING)
    private Role role; // ADMIN, USER, VENDEDOR
}

public enum Role {
    ADMIN,
    USER,
    VENDEDOR
}
```

### 2. Refresh Tokens

Tokens de larga duración para renovar access tokens:

```java
public class TokenResponse {
    private String accessToken;  // Expira en 1 hora
    private String refreshToken; // Expira en 30 días
}
```

### 3. Verificación de Email

Enviar email de confirmación al registrarse:

```java
@Entity
public class User {
    // ... campos existentes
    
    private boolean emailVerified = false;
    private String verificationToken;
}
```

### 4. Recuperación de Contraseña

Endpoint para resetear contraseña:

```java
@PostMapping("/forgot-password")
public ResponseEntity<?> forgotPassword(@RequestParam String email) {
    // Generar token temporal
    // Enviar email con link
}
```

### 5. OAuth2 (Google, Facebook)

Permitir login con redes sociales:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
```

---

## Códigos de Estado HTTP

| Código | Significado | Cuándo se Usa |
|--------|-------------|---------------|
| **200 OK** | Operación exitosa | GET, PUT, DELETE exitosos |
| **201 Created** | Recurso creado | POST exitoso (registro) |
| **400 Bad Request** | Datos inválidos | Validaciones fallaron, ID inválido |
| **401 Unauthorized** | No autorizado | Contraseña incorrecta, token inválido |
| **404 Not Found** | No encontrado | Usuario no existe |
| **409 Conflict** | Conflicto | Email duplicado |
| **500 Internal Server Error** | Error del servidor | Error inesperado |

---

## Notas para la Exposición

### Puntos Clave

1. **Spring Boot vs Node.js**
   - Java compilado vs JavaScript interpretado
   - Tipado fuerte vs dinámico
   - JPA/Hibernate vs TypeORM

2. **Seguridad**
   - BCrypt para contraseñas (hash + salt)
   - JWT para autenticación sin estado
   - Spring Security para proteger endpoints

3. **Arquitectura en Capas**
   - Controller: Maneja HTTP
   - Service: Lógica de negocio
   - Repository: Acceso a datos
   - Model: Entidades JPA

4. **Validaciones**
   - Jakarta Validation en DTOs
   - Validaciones automáticas con @Valid

5. **JPA/Hibernate**
   - ORM: mapea objetos Java a tablas SQL
   - Queries automáticas (findByEmail)
   - Sin escribir SQL manual

---

## Resumen Técnico

| Aspecto | Detalle |
|---------|---------|
| **Framework** | Spring Boot 3.x |
| **Lenguaje** | Java 17+ |
| **Base de Datos** | MySQL |
| **ORM** | JPA/Hibernate |
| **Seguridad** | Spring Security + BCrypt + JWT |
| **Validaciones** | Jakarta Bean Validation |
| **Puerto** | 8080 |
| **Build Tool** | Maven |

---

## Fin de la Documentación

**Fecha de creación:** 2025-12-12  
**Microservicio:** Usuarios - CraftYourStyle  
**Puerto:** 8080  
**Versión:** 1.0
