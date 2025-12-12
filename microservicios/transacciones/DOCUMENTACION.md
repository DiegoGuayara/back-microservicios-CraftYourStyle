# Documentación del Microservicio de Transacciones - CraftYourStyle

## Índice
1. [Descripción General](#descripción-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Modelo de Datos](#modelo-de-datos)
4. [API Endpoints](#api-endpoints)
5. [Métodos Detallados](#métodos-detallados)
6. [Integración con Otros Microservicios](#integración-con-otros-microservicios)
7. [Ejemplos de Uso](#ejemplos-de-uso)

---

## Descripción General

El microservicio de transacciones maneja la gestión de **cuentas bancarias** para procesar pagos:
- **Registro de cuentas** bancarias (débito/crédito)
- **Consulta de cuentas** por usuario
- **Actualización** de información bancaria
- **Eliminación** de cuentas
- **Integración** con microservicio de usuarios

**Tecnología:** TypeScript + Express + MySQL + Axios  
**Puerto:** 10101  
**Base de datos:** CraftYourStyle_Transacciones

---

## Estructura del Proyecto

```
transacciones/
├── index.ts                          # Punto de entrada del microservicio
├── config/
│   └── db-config.ts                 # Configuración de conexión a BD
├── DTO/
│   └── transaccionesDto.ts          # Definición de datos de cuentas
├── repository/
│   └── transaccionesRepository.ts   # Operaciones de base de datos
├── controllers/
│   └── transaccionesController.ts   # Lógica de peticiones HTTP
├── routes/
│   └── transaccionesRoutes.ts       # Definición de rutas
├── CraftYourStyle-Transacciones.sql # Script de creación de BD
└── package.json                      # Dependencias del proyecto
```

---

## Modelo de Datos

### Tabla: transacciones

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| **id** | INT (PK, AUTO_INCREMENT) | Identificador único | 1 |
| **numero_de_cuenta** | VARCHAR(100) | Número de cuenta bancaria | "1234567890123456" |
| **tipo_de_cuenta** | ENUM('debito', 'credito') | Tipo de cuenta | "debito" |
| **banco** | VARCHAR(50) | Nombre del banco | "Bancolombia" |
| **id_user** | INT | ID del usuario dueño | 5 |

### Tipos de Cuenta
- **debito**: Tarjeta de débito / cuenta de ahorros
- **credito**: Tarjeta de crédito

---

## API Endpoints

### Base URL
```
http://localhost:10101/transacciones
```

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/crearCuenta` | Crea una nueva cuenta bancaria |
| GET | `/obtenerCuentas/:id_user` | Obtiene todas las cuentas de un usuario |
| PATCH | `/actualizarCuenta/:id_user/:id` | Actualiza una cuenta bancaria |
| DELETE | `/eliminarCuenta/:id/:id_user` | Elimina una cuenta bancaria |

---

## Métodos Detallados

### 1. Crear Cuenta Bancaria

**Endpoint:** `POST /transacciones/crearCuenta`

**Descripción:**  
Registra una nueva cuenta bancaria para un usuario. Valida que el número de cuenta no esté duplicado.

**Body esperado:**
```json
{
  "numero_de_cuenta": "1234567890123456",
  "tipo_de_cuenta": "debito",
  "banco": "Bancolombia",
  "id_user": 5
}
```

**Campos:**
- **numero_de_cuenta** (obligatorio): Número de cuenta bancaria (máx. 100 caracteres)
- **tipo_de_cuenta** (obligatorio): "debito" o "credito"
- **banco** (obligatorio): Nombre del banco (máx. 50 caracteres)
- **id_user** (obligatorio): ID del usuario dueño de la cuenta

**Respuesta exitosa (201):**
```json
{
  "message": "Transacción creada",
  "id": {
    "insertId": 1,
    "affectedRows": 1
  }
}
```

**Respuesta de error - Cuenta duplicada (400):**
```json
{
  "message": "Esta cuenta ya existe"
}
```

**Respuesta de error - Servidor (500):**
```json
{
  "message": "Error al crear la transacción",
  "error": "..."
}
```

---

### 2. Obtener Cuentas de un Usuario

**Endpoint:** `GET /transacciones/obtenerCuentas/:id_user`

**Ejemplo:** `GET /transacciones/obtenerCuentas/5`

**Descripción:**  
Obtiene todas las cuentas bancarias de un usuario específico. Se integra con el microservicio de usuarios para obtener información completa del usuario.

**Respuesta exitosa (200):**
```json
{
  "usuario": {
    "id": 5,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "3001234567"
  },
  "cuentas": [
    {
      "id": 1,
      "numero_de_cuenta": "1234567890123456",
      "tipo_de_cuenta": "debito",
      "banco": "Bancolombia",
      "id_user": 5
    },
    {
      "id": 2,
      "numero_de_cuenta": "9876543210987654",
      "tipo_de_cuenta": "credito",
      "banco": "Davivienda",
      "id_user": 5
    }
  ]
}
```

**Notas importantes:**
- Se hace una petición HTTP al microservicio de usuarios en `http://localhost:8080/v1/usuarios/:id_user`
- La contraseña del usuario se excluye de la respuesta por seguridad
- Si el microservicio de usuarios no responde, retorna error 500

---

### 3. Actualizar Cuenta Bancaria

**Endpoint:** `PATCH /transacciones/actualizarCuenta/:id_user/:id`

**Ejemplo:** `PATCH /transacciones/actualizarCuenta/5/1`

**Descripción:**  
Actualiza información de una cuenta bancaria. Solo se deben enviar los campos que se quieren modificar.

**Body (actualización parcial):**
```json
{
  "banco": "Banco de Bogotá"
}
```

O múltiples campos:
```json
{
  "numero_de_cuenta": "1111222233334444",
  "banco": "Banco de Bogotá",
  "tipo_de_cuenta": "credito"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    "result": {
      "affectedRows": 1
    },
    "banco": "Banco de Bogotá"
  }
}
```

**Respuesta de error - Sin campos (400):**
```json
{
  "message": "No fields to update"
}
```

**Nota importante:**  
Este método es dinámico. Construye la query SQL dinámicamente según los campos enviados. Solo actualiza los campos que no sean undefined, null o string vacío.

---

### 4. Eliminar Cuenta Bancaria

**Endpoint:** `DELETE /transacciones/eliminarCuenta/:id/:id_user`

**Ejemplo:** `DELETE /transacciones/eliminarCuenta/1/5`

**Parámetros:**
- **id**: ID de la cuenta a eliminar
- **id_user**: ID del usuario dueño de la cuenta

**Respuesta exitosa (200):**
```json
{
  "message": "Cuenta eliminada correctamente"
}
```

**Respuesta de error - No encontrada (404):**
```json
{
  "message": "Cuenta no encontrada"
}
```

**Nota de seguridad:**  
Este endpoint requiere tanto el ID de la cuenta como el ID del usuario para evitar que usuarios eliminen cuentas de otros usuarios.

---

## Integración con Otros Microservicios

### Microservicio de Usuarios

El endpoint `obtenerCuentas` se integra con el microservicio de usuarios para obtener información completa.

**Petición realizada:**
```javascript
const { data } = await axios.get(
  `http://localhost:8080/v1/usuarios/${id_user}`
);
```

**Datos recibidos del microservicio de usuarios:**
```json
{
  "usuario": {
    "id": 5,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "3001234567",
    "contraseña": "hashed_password"
  }
}
```

**Procesamiento:**
```javascript
// Eliminar contraseña por seguridad
const { contraseña, ...usuarioSinContraseña } = data.usuario;

// Combinar con cuentas bancarias
res.json({
  usuario: usuarioSinContraseña,
  cuentas: cuenta
});
```

**Manejo de errores:**
- Si el microservicio de usuarios no responde: error 500
- Si el usuario no existe: error 500

---

## Ejemplos de Uso

### Usando cURL

#### Crear una cuenta
```bash
curl -X POST http://localhost:10101/transacciones/crearCuenta \
  -H "Content-Type: application/json" \
  -d '{
    "numero_de_cuenta": "1234567890123456",
    "tipo_de_cuenta": "debito",
    "banco": "Bancolombia",
    "id_user": 5
  }'
```

#### Obtener cuentas de un usuario
```bash
curl -X GET http://localhost:10101/transacciones/obtenerCuentas/5
```

#### Actualizar una cuenta
```bash
curl -X PATCH http://localhost:10101/transacciones/actualizarCuenta/5/1 \
  -H "Content-Type: application/json" \
  -d '{
    "banco": "Banco de Bogotá"
  }'
```

#### Eliminar una cuenta
```bash
curl -X DELETE http://localhost:10101/transacciones/eliminarCuenta/1/5
```

---

### Usando JavaScript (fetch)

```javascript
const BASE_URL = "http://localhost:10101/transacciones";

// 1. Crear cuenta bancaria
async function crearCuenta(userId) {
  const nuevaCuenta = {
    numero_de_cuenta: "1234567890123456",
    tipo_de_cuenta: "debito",
    banco: "Bancolombia",
    id_user: userId
  };
  
  const response = await fetch(`${BASE_URL}/crearCuenta`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(nuevaCuenta)
  });
  
  const data = await response.json();
  console.log('Cuenta creada:', data);
}

// 2. Obtener cuentas de un usuario
async function obtenerCuentas(userId) {
  const response = await fetch(`${BASE_URL}/obtenerCuentas/${userId}`);
  const data = await response.json();
  
  console.log('Usuario:', data.usuario);
  console.log('Cuentas:', data.cuentas);
  data.cuentas.forEach(cuenta => {
    console.log(`${cuenta.banco} - ${cuenta.numero_de_cuenta} (${cuenta.tipo_de_cuenta})`);
  });
}

// 3. Actualizar cuenta
async function actualizarCuenta(userId, cuentaId) {
  const cambios = {
    banco: "Banco de Bogotá"
  };
  
  const response = await fetch(`${BASE_URL}/actualizarCuenta/${userId}/${cuentaId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cambios)
  });
  
  const data = await response.json();
  console.log('Actualización:', data);
}

// 4. Eliminar cuenta
async function eliminarCuenta(cuentaId, userId) {
  const response = await fetch(`${BASE_URL}/eliminarCuenta/${cuentaId}/${userId}`, {
    method: 'DELETE'
  });
  
  const data = await response.json();
  console.log('Eliminación:', data);
}
```

---

## Arquitectura

### Flujo de una Petición

```
Cliente HTTP Request
    ↓
Express Router (transaccionesRoutes.ts)
    ↓
Controller (transaccionesController.ts)
    - Valida datos
    - Verifica duplicados (si es crear)
    - Integra con microservicio de usuarios (si es obtener)
    ↓
Repository (transaccionesRepository.ts)
    - Ejecuta queries SQL
    ↓
MySQL Database
    ↓
← Respuesta en sentido inverso
```

### Integración con Microservicio de Usuarios

```
transacciones/obtenerCuentas/:id_user
    ↓
Controller: obtenerCuentas()
    ↓
Repository: findAccountsByUserId() → Obtiene cuentas de BD
    ↓
Axios: GET http://localhost:8080/v1/usuarios/:id_user
    ↓
Microservicio de Usuarios → Retorna datos del usuario
    ↓
Controller: Combina usuario + cuentas
    ↓
Cliente recibe: {usuario: {...}, cuentas: [...]}
```

---

## Códigos de Estado HTTP

| Código | Significado | Uso en el Microservicio |
|--------|-------------|-------------------------|
| **200 OK** | Operación exitosa | GET, PATCH, DELETE exitosos |
| **201 Created** | Recurso creado | POST exitoso |
| **400 Bad Request** | Datos inválidos | Cuenta duplicada, sin campos para actualizar |
| **404 Not Found** | Recurso no encontrado | Cuenta no existe |
| **500 Internal Server Error** | Error del servidor | Error de BD, microservicio de usuarios no responde |

---

## Validaciones

### Crear Cuenta (POST)
- ✅ Todos los campos son obligatorios
- ✅ `numero_de_cuenta` debe ser único (no duplicado)
- ✅ `tipo_de_cuenta` debe ser "debito" o "credito"
- ✅ `id_user` debe existir (validado al momento de usar la cuenta)

### Actualizar Cuenta (PATCH)
- ✅ Al menos un campo debe ser enviado
- ✅ Campos vacíos, null o undefined son ignorados
- ✅ Requiere `id_user` e `id` para seguridad

### Eliminar Cuenta (DELETE)
- ✅ Requiere `id` de cuenta e `id_user` para seguridad
- ✅ Evita que usuarios eliminen cuentas de otros

---

## Casos de Uso

### Caso 1: Usuario Registra su Tarjeta de Débito

**Escenario:**  
Un usuario quiere agregar su tarjeta de débito para realizar compras.

**Flujo:**
1. Usuario ingresa datos de su tarjeta
2. Sistema crea la cuenta:
```json
POST /transacciones/crearCuenta
{
  "numero_de_cuenta": "4111111111111111",
  "tipo_de_cuenta": "debito",
  "banco": "Bancolombia",
  "id_user": 10
}
```
3. Sistema valida que no exista esa cuenta
4. Guarda la cuenta en la BD
5. Usuario puede usarla para compras

---

### Caso 2: Usuario Ve sus Métodos de Pago

**Escenario:**  
Un usuario quiere ver todas sus cuentas registradas.

**Flujo:**
```
GET /transacciones/obtenerCuentas/10
```

Sistema retorna:
- Información del usuario (sin contraseña)
- Lista de todas sus cuentas bancarias

---

### Caso 3: Usuario Cambia de Banco

**Escenario:**  
Un usuario cambió el banco de su tarjeta.

**Flujo:**
```json
PATCH /transacciones/actualizarCuenta/10/1
{
  "banco": "Davivienda"
}
```

Solo actualiza el banco, los demás datos permanecen igual.

---

### Caso 4: Usuario Elimina Tarjeta Vencida

**Escenario:**  
Un usuario quiere eliminar una tarjeta que ya no usa.

**Flujo:**
```
DELETE /transacciones/eliminarCuenta/1/10
```

La cuenta se elimina permanentemente.

---

## Seguridad

### Verificación de Duplicados
- Antes de crear una cuenta, se verifica que el `numero_de_cuenta` no exista
- Evita cuentas duplicadas en el sistema

### Validación de Propiedad
- Al actualizar o eliminar, se requiere el `id_user`
- Evita que usuarios modifiquen cuentas de otros

### Exclusión de Contraseñas
- Al obtener datos del usuario, se elimina la contraseña de la respuesta
- Protege información sensible

---

## Dependencias Clave

### Axios
```typescript
import axios from "axios";
```

**Uso:** Realizar peticiones HTTP al microservicio de usuarios.

**Instalación:**
```bash
npm install axios
```

---

## Mejoras Futuras

### 1. Encriptación de Números de Cuenta
```typescript
import crypto from 'crypto';

function encryptAccount(account: string): string {
  // Implementar encriptación
  return crypto.createHash('sha256').update(account).digest('hex');
}
```

### 2. Validación de Formato de Tarjeta
```typescript
function isValidCardNumber(number: string): boolean {
  // Algoritmo de Luhn
  return /^\d{13,19}$/.test(number);
}
```

### 3. Límite de Cuentas por Usuario
```typescript
const MAX_ACCOUNTS = 5;

const existingAccounts = await TransaccionesRepository.findAccountsByUserId(id_user);
if (existingAccounts.length >= MAX_ACCOUNTS) {
  res.status(400).json({ message: "Límite de cuentas alcanzado" });
  return;
}
```

### 4. Historial de Transacciones
```sql
CREATE TABLE historial_transacciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cuenta_id INT,
  monto DECIMAL(10,2),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('exitosa', 'fallida'),
  FOREIGN KEY (cuenta_id) REFERENCES transacciones(id)
);
```

### 5. Verificación de Usuario Existe
```typescript
// Antes de crear cuenta, verificar que el usuario exista
const { data } = await axios.get(`http://localhost:8080/v1/usuarios/${id_user}`);
if (!data.usuario) {
  res.status(404).json({ message: "Usuario no encontrado" });
  return;
}
```

---

## Bancos Comunes en Colombia

Para facilitar el registro, estos son bancos comunes:

- Bancolombia
- Banco de Bogotá
- Davivienda
- Banco de Occidente
- BBVA
- Banco Popular
- Banco Av Villas
- Banco Caja Social
- Colpatria
- Banco Agrario

---

## Notas para la Exposición

### Puntos Clave

1. **Propósito del Microservicio**
   - Gestiona métodos de pago de usuarios
   - Permite procesar transacciones

2. **Integración con Microservicios**
   - Se comunica con microservicio de usuarios vía HTTP (Axios)
   - Arquitectura de microservicios independientes

3. **Seguridad**
   - Verifica duplicados
   - Valida propiedad de cuentas
   - Excluye contraseñas

4. **Actualización Dinámica**
   - Construye SQL dinámicamente
   - Solo actualiza campos enviados

5. **Tipos de Cuenta**
   - Débito: tarjetas/cuentas de ahorros
   - Crédito: tarjetas de crédito

---

## Resumen Técnico

| Aspecto | Detalle |
|---------|---------|
| **Framework** | Express (Node.js) |
| **Lenguaje** | TypeScript |
| **Base de Datos** | MySQL |
| **Puerto** | 10101 |
| **Integración** | Axios → Microservicio de Usuarios |
| **Arquitectura** | Routes → Controller → Repository |
| **Operaciones** | CRUD completo |

---

## Fin de la Documentación

**Fecha de creación:** 2025-12-12  
**Microservicio:** Transacciones - CraftYourStyle  
**Puerto:** 10101  
**Versión:** 1.0
