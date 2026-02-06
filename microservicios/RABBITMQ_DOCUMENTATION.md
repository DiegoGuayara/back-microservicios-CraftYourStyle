# Documentación RabbitMQ - CraftYourStyle

## 📋 Tabla de Contenidos
- [Visión General](#visión-general)
- [Arquitectura](#arquitectura)
- [Topología de Mensajería](#topología-de-mensajería)
- [Microservicios](#microservicios)
  - [Usuarios (Java/Spring Boot)](#usuarios-javaspring-boot)
  - [Transacciones (TypeScript/Node.js)](#transacciones-typescriptnodejs)
  - [Personalización (TypeScript/Node.js)](#personalización-typescriptnodejs)
  - [Notificaciones (Python/FastAPI)](#notificaciones-pythonfastapi)
- [Flujos de Mensajes](#flujos-de-mensajes)
- [Formato de Mensajes](#formato-de-mensajes)
- [Configuración](#configuración)

---

## Visión General

Este proyecto utiliza **RabbitMQ** como sistema de mensajería asíncrona para la comunicación entre microservicios. La implementación sigue un patrón **Publish/Subscribe** con un **Topic Exchange** que permite enrutamiento flexible basado en routing keys.

### ¿Por qué RabbitMQ?
- ✅ **Desacoplamiento**: Los servicios no necesitan conocerse entre sí
- ✅ **Asincronía**: Procesamiento no bloqueante
- ✅ **Escalabilidad**: Fácil agregar nuevos consumidores
- ✅ **Resiliencia**: Mensajes persistentes y reintento automático
- ✅ **Flexibilidad**: Routing keys permiten patrones complejos

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                     RabbitMQ (Topic Exchange)                       │
│                    craftyourstyle.events                            │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │   Usuarios   │  │ Transacciones│  │Notificaciones│
        │ (PRODUCER +  │  │ (PRODUCER +  │  │  (CONSUMER)  │
        │  CONSUMER)   │  │  CONSUMER)   │  │              │
        └──────────────┘  └──────────────┘  └──────────────┘
                │                │                ▲
                │                │                │
                └────────────────┴────────────────┘
                         │
                         ▼
                ┌──────────────┐
                │Personalización│
                │  (PRODUCER)  │
                └──────────────┘
```

---

## Topología de Mensajería

### Exchange
- **Nombre**: `craftyourstyle.events`
- **Tipo**: `topic`
- **Durabilidad**: `durable: true`

### Routing Keys

| Routing Key | Producer | Consumer(s) | Descripción |
|------------|----------|-------------|-------------|
| `usuario.evento` | Usuarios | Notificaciones | Eventos de usuario (registro, login, actualización) |
| `transaccion.completada` | Transacciones | Notificaciones | Transacciones finalizadas |
| `transaccion.usuario.actualizar` | Transacciones | Usuarios | Solicitud de actualización de datos de usuario |
| `personalizacion.confirmada` | Personalización | Transacciones | Personalización confirmada por el usuario |

### Colas

| Cola | Binding (Routing Key) | Servicio Consumidor |
|------|----------------------|---------------------|
| `usuarios.transaccion.queue` | `transaccion.usuario.actualizar` | Usuarios |
| `transacciones.personalizacion.queue` | `personalizacion.confirmada` | Transacciones |
| `notificaciones.usuario.queue` | `usuario.evento` | Notificaciones |
| `notificaciones.transaccion.queue` | `transaccion.completada` | Notificaciones |

---

## Microservicios

### Usuarios (Java/Spring Boot)

**Ubicación**: `/microservicios/usuarios/src/main/java/com/example/CraftYourStyle2/messaging/`

#### Configuración (`application.properties`)
```properties
spring.rabbitmq.host=${RABBITMQ_HOST:localhost}
spring.rabbitmq.port=${RABBITMQ_PORT:5672}
spring.rabbitmq.username=${RABBITMQ_USER:guest}
spring.rabbitmq.password=${RABBITMQ_PASSWORD:guest}

rabbitmq.exchange.name=craftyourstyle.events
rabbitmq.queue.consume=usuarios.transaccion.queue
rabbitmq.routing.key.consume=transaccion.usuario.actualizar
rabbitmq.routing.key.publish=usuario.evento
```

#### Rol
- **PRODUCTOR** → Publica eventos de usuario
- **CONSUMIDOR** → Escucha actualizaciones desde Transacciones

#### Estructura de Archivos
- `RabbitMQConfig.java`: Configuración del exchange, colas y bindings
- `RabbitMQProducer.java`: Clase para publicar mensajes
- `RabbitMQConsumer.java`: Clase para consumir mensajes

#### Eventos que Publica

##### 1. Usuario Registrado
```java
publishUserRegistered(Long userId, String email, String nombre)
```
**Mensaje**:
```json
{
  "event": "usuario_registrado",
  "user_id": 123,
  "email": "usuario@example.com",
  "nombre": "Juan Pérez",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

##### 2. Usuario Actualizado
```java
publishUserUpdated(Long userId, String campoActualizado)
```
**Mensaje**:
```json
{
  "event": "usuario_actualizado",
  "user_id": 123,
  "campo_actualizado": "email",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

##### 3. Usuario Eliminado
```java
publishUserDeleted(Long userId)
```
**Mensaje**:
```json
{
  "event": "usuario_eliminado",
  "user_id": 123,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

##### 4. Usuario Login
```java
publishUserLogin(Long userId, String email)
```
**Mensaje**:
```json
{
  "event": "usuario_login",
  "user_id": 123,
  "email": "usuario@example.com",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Mensajes que Consume

**Queue**: `usuarios.transaccion.queue`  
**Routing Key**: `transaccion.usuario.actualizar`

**Formato esperado**:
```json
{
  "event": "actualizacion_desde_transacciones",
  "user_id": 123,
  "campo": "saldo",
  "valor_anterior": 100,
  "valor_nuevo": 150,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Uso en Código
```java
// Inyectar el productor
@Autowired
private RabbitMQProducer rabbitMQProducer;

// Publicar evento
rabbitMQProducer.publishUserRegistered(user.getId(), user.getEmail(), user.getNombre());
```

---

### Transacciones (TypeScript/Node.js)

**Ubicación**: `/microservicios/transacciones/config/`

#### Configuración
```typescript
const RABBITMQ_URL = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
const EXCHANGE_NAME = "craftyourstyle.events";
```

#### Rol
- **PRODUCTOR** → Publica eventos de transacciones completadas y actualizaciones de usuario
- **CONSUMIDOR** → Escucha confirmaciones de Personalización

#### Estructura de Archivos
- `rabbitmq.ts`: Conexión, configuración y funciones de publicación
- `messageHandler.ts`: Lógica de procesamiento de mensajes recibidos

#### Routing Keys que Publica
- `transaccion.completada`
- `transaccion.usuario.actualizar`

#### Eventos que Publica

##### 1. Transacción Completada
```typescript
await publishMessage(ROUTING_KEYS.TRANSACCION_COMPLETADA, {
  event: "transaccion_completada",
  transaccion_id: 456,
  user_id: 123,
  monto: 99.99,
  tipo: "compra",
  timestamp: "2024-01-15T10:30:00Z"
});
```

##### 2. Actualización de Usuario
```typescript
await publishMessage(ROUTING_KEYS.TRANSACCION_USUARIO_ACTUALIZAR, {
  event: "actualizacion_desde_transacciones",
  user_id: 123,
  campo: "puntos",
  valor_anterior: 100,
  valor_nuevo: 150,
  timestamp: "2024-01-15T10:30:00Z"
});
```

#### Mensajes que Consume

**Queue**: `transacciones.personalizacion.queue`  
**Routing Key**: `personalizacion.confirmada`

**Formato esperado**:
```json
{
  "event": "personalizacion.confirmada",
  "personalizacion_id": 789,
  "variant_id": 12,
  "user_id": 123,
  "color": "#FF5733",
  "image_url": "https://...",
  "textos": "Mi texto personalizado",
  "tipo_letra": "Arial",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Uso en Código

**Inicializar conexión** (`index.ts`):
```typescript
import { connectRabbitMQ, startConsumer } from "./config/rabbitmq.js";
import { processMessage } from "./config/messageHandler.js";

// En el inicio de la aplicación
await connectRabbitMQ();
await startConsumer(processMessage);
```

**Publicar mensajes** (desde controller):
```typescript
import { notificarTransaccionCompletada } from "../config/messageHandler.js";

// En tu endpoint
await notificarTransaccionCompletada({
  transaccion_id: nuevaTransaccion.id,
  user_id: usuarioId,
  monto: 99.99,
  tipo: "compra"
});
```

---

### Personalización (TypeScript/Node.js)

**Ubicación**: `/microservicios/personalizacion/config/`

#### Configuración
```typescript
const RABBITMQ_URL = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
const EXCHANGE_NAME = "craftyourstyle.events";
export const ROUTING_KEY = "personalizacion.confirmada";
```

#### Rol
- **PRODUCTOR** → Publica eventos de personalización confirmada

#### Eventos que Publica

##### Personalización Confirmada
```typescript
await publishPersonalizacionConfirmada({
  personalizacion_id: 789,
  variant_id: 12,
  user_id: 123,
  color: "#FF5733",
  image_url: "https://example.com/image.png",
  textos: "Mi diseño",
  tipo_letra: "Arial"
});
```

**Mensaje**:
```json
{
  "event": "personalizacion.confirmada",
  "personalizacion_id": 789,
  "variant_id": 12,
  "user_id": 123,
  "color": "#FF5733",
  "image_url": "https://example.com/image.png",
  "textos": "Mi diseño",
  "tipo_letra": "Arial",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Uso en Código

**Inicializar conexión** (`index.ts`):
```typescript
import { connectRabbitMQ } from "./config/rabbitmq.js";

// En el inicio de la aplicación
await connectRabbitMQ();
```

**Publicar evento** (desde controller):
```typescript
import { publishPersonalizacionConfirmada } from "../config/rabbitmq.js";

// Después de guardar la personalización
await publishPersonalizacionConfirmada({
  personalizacion_id: personalizacion.id,
  variant_id: personalizacion.variant_id,
  user_id: personalizacion.user_id,
  color: personalizacion.color,
  image_url: personalizacion.imagen,
  textos: personalizacion.textos,
  tipo_letra: personalizacion.tipo_letra
});
```

---

### Notificaciones (Python/FastAPI)

**Ubicación**: `/microservicios/notificaciones/app/core/`

#### Configuración
```python
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", 5672))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")
EXCHANGE_NAME = "craftyourstyle.events"
```

#### Rol
- **CONSUMIDOR** → Escucha eventos de Usuarios y Transacciones

#### Colas que Consume

##### 1. Cola de Transacciones
- **Queue**: `notificaciones.transaccion.queue`
- **Routing Key**: `transaccion.completada`
- **Handler**: `process_transaccion_message()`

##### 2. Cola de Usuarios
- **Queue**: `notificaciones.usuario.queue`
- **Routing Key**: `usuario.evento`
- **Handler**: `process_usuario_message()`

#### Mensajes que Procesa

**Desde Transacciones**:
```json
{
  "event": "transaccion_completada",
  "transaccion_id": 456,
  "user_id": 123,
  "monto": 99.99,
  "tipo": "compra",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Desde Usuarios**:
```json
{
  "event": "usuario_registrado",
  "user_id": 123,
  "email": "usuario@example.com",
  "nombre": "Juan Pérez",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Uso en Código

**Iniciar consumidores** (`main.py`):
```python
from app.core.rabbitmq import start_consumers_in_background

# Al iniciar la aplicación
@app.on_event("startup")
async def startup_event():
    start_consumers_in_background()
```

**Procesar mensajes** (`rabbitmq.py`):
```python
def process_transaccion_message(ch, method, properties, body):
    message = json.loads(body)
    print(f"📥 [Transacción] Mensaje recibido: {message}")
    
    # Lógica de negocio: enviar email, crear notificación, etc.
    
    ch.basic_ack(delivery_tag=method.delivery_tag)

def process_usuario_message(ch, method, properties, body):
    message = json.loads(body)
    print(f"📥 [Usuario] Mensaje recibido: {message}")
    
    # Lógica de negocio: email de bienvenida, etc.
    
    ch.basic_ack(delivery_tag=method.delivery_tag)
```

---

## Flujos de Mensajes

### Flujo 1: Registro de Usuario
```
1. Usuario hace POST /register
2. [Usuarios] Crea usuario en BD
3. [Usuarios] Publica "usuario_registrado" → routing key: usuario.evento
4. [Notificaciones] Recibe mensaje
5. [Notificaciones] Envía email de bienvenida
```

### Flujo 2: Personalización → Transacción
```
1. Usuario confirma personalización
2. [Personalización] Guarda en BD
3. [Personalización] Publica "personalizacion.confirmada" → routing key: personalizacion.confirmada
4. [Transacciones] Recibe mensaje
5. [Transacciones] Crea transacción pendiente
6. [Transacciones] Publica "transaccion_completada" → routing key: transaccion.completada
7. [Notificaciones] Recibe mensaje
8. [Notificaciones] Envía confirmación al usuario
```

### Flujo 3: Actualización desde Transacción
```
1. [Transacciones] Procesa pago
2. [Transacciones] Publica "transaccion.usuario.actualizar" → routing key: transaccion.usuario.actualizar
3. [Usuarios] Recibe mensaje
4. [Usuarios] Actualiza saldo/puntos del usuario
5. [Usuarios] Publica "usuario_actualizado" → routing key: usuario.evento
6. [Notificaciones] Recibe mensaje
7. [Notificaciones] Notifica al usuario del cambio
```

---

## Formato de Mensajes

### Estructura Común

Todos los mensajes siguen una estructura base:

```json
{
  "event": "nombre_del_evento",
  "timestamp": "2024-01-15T10:30:00Z",
  ...campos_especificos
}
```

### Campos Estándar
- `event` (string, requerido): Identificador del tipo de evento
- `timestamp` (string ISO 8601, requerido): Marca de tiempo del evento
- `user_id` (number, opcional): ID del usuario relacionado

### Convenciones de Nombres
- **Eventos**: `snake_case` en minúsculas
- **Routing Keys**: `formato.punto.separado`
- **Colas**: `microservicio.origen.queue`

---

## Configuración

### Variables de Entorno

Todos los microservicios requieren estas variables:

```env
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

### Docker Compose

```yaml
services:
  rabbitmq:
    image: rabbitmq:3-management
    container_name: rabbitmq
    ports:
      - "5672:5672"      # Puerto AMQP
      - "15672:15672"    # Puerto Management UI
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    healthcheck:
      test: rabbitmq-diagnostics -q ping
      interval: 10s
      timeout: 5s
      retries: 5
```

### Acceso a Management UI

Una vez iniciado RabbitMQ:
- **URL**: http://localhost:15672
- **Usuario**: `guest`
- **Contraseña**: `guest`

---

## Características Implementadas

### ✅ Resiliencia
- **Reconexión automática**: Todos los servicios reintentan conectar si se pierde la conexión
- **Mensajes persistentes**: `durable: true` en exchanges y colas
- **Acknowledgment manual**: Los mensajes se confirman solo después de procesarse correctamente
- **Requeue en error**: Si un mensaje falla, se reencola automáticamente

### ✅ Escalabilidad
- **Prefetch**: Limita mensajes en procesamiento simultáneo
- **Multiple consumers**: Múltiples instancias pueden consumir la misma cola
- **Topic exchange**: Permite routing flexible sin cambios en infraestructura

### ✅ Observabilidad
- **Logs estructurados**: Todos los servicios logean eventos de RabbitMQ con emojis 📤📥✅❌
- **Timestamps**: Todos los mensajes incluyen marca de tiempo
- **Event tracking**: Campo `event` permite rastrear tipos de mensajes

---

## Mejores Prácticas Implementadas

1. **Exchange tipo Topic**: Mayor flexibilidad vs Direct o Fanout
2. **Naming convention consistente**: Facilita debugging
3. **JSON como formato**: Interoperabilidad entre lenguajes
4. **Converters específicos**: Jackson2 (Java), JSON nativo (Python/Node)
5. **Error handling robusto**: Try-catch en todos los handlers
6. **Configuración por variables de entorno**: Facilita despliegue
7. **Healthchecks**: Docker espera que RabbitMQ esté listo antes de iniciar servicios
8. **Threads daemon (Python)**: Consumidores no bloquean el proceso principal

---

## Próximos Pasos / Posibles Mejoras

- [ ] Implementar **Dead Letter Queue** para mensajes que fallan múltiples veces
- [ ] Agregar **retry policies** con backoff exponencial
- [ ] Implementar **circuit breaker** para proteger servicios downstream
- [ ] Agregar **métricas** (Prometheus) para monitorear colas
- [ ] Implementar **tracing distribuido** (Jaeger/Zipkin)
- [ ] Agregar **validación de schemas** (JSON Schema / Pydantic)
- [ ] Implementar **idempotencia** en consumers para evitar procesamiento duplicado
- [ ] Agregar **rate limiting** en producers

---

## Troubleshooting

### Conexión rechazada
```
Error: connect ECONNREFUSED 127.0.0.1:5672
```
**Solución**: Verificar que RabbitMQ esté corriendo y que las variables de entorno sean correctas.

### Mensajes no llegan
1. Verificar que el exchange existe en Management UI
2. Verificar bindings entre colas y exchange
3. Verificar routing keys en producer y consumer
4. Revisar logs de ambos servicios

### Consumer no procesa mensajes
1. Verificar que el consumidor esté iniciado (buscar "👂 Escuchando" en logs)
2. Verificar que la cola tenga mensajes en Management UI
3. Verificar que no haya errores de deserialización JSON
4. Verificar que `basic_ack` se llame correctamente

---

## Referencias

- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [AMQP 0-9-1 Protocol](https://www.rabbitmq.com/amqp-0-9-1-reference.html)
- [Spring AMQP](https://spring.io/projects/spring-amqp)
- [amqplib (Node.js)](https://amqp-node.github.io/amqplib/)
- [pika (Python)](https://pika.readthedocs.io/)

---

**Documentación creada**: 2024  
**Autor**: CraftYourStyle Team  
**Versión**: 1.0
