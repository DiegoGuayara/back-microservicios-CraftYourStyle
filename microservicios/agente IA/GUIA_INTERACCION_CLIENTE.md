# 🤖 Guía de Interacción Cliente - Agente de IA
## CraftYourStyle - Virtual Try-On y Personalización Asistida

---

## 📍 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Cómo Funciona la Subida de Fotos](#cómo-funciona-la-subida-de-fotos)
3. [Escenario 1: Personalización Asistida](#escenario-1-personalización-asistida)
4. [Escenario 2: Virtual Try-On](#escenario-2-virtual-try-on)
5. [Escenario 3: Iteración y Refinamiento](#escenario-3-iteración-y-refinamiento)
6. [Escenario 4: Recomendaciones de Outfit](#escenario-4-recomendaciones-de-outfit)
7. [Diagrama de Flujo Técnico](#diagrama-de-flujo-técnico)
8. [Ejemplo de Interfaz](#ejemplo-de-interfaz)
9. [Casos de Uso](#casos-de-uso)
10. [Endpoints del API](#endpoints-del-api)
11. [Implementación Frontend](#implementación-frontend)

---

## 🎯 Introducción

Este documento describe la experiencia completa de interacción entre el cliente y el agente de inteligencia artificial de CraftYourStyle. El agente utiliza Google Gemini para conversaciones inteligentes y tecnología de Virtual Try-On para mostrar cómo quedan las prendas personalizadas.

### Tecnologías Involucradas
- **Google Gemini**: Conversaciones y análisis de imágenes
- **Mirascope**: Framework para agentes de IA
- **Banana/IDM-VTON**: Modelos de Virtual Try-On
- **Cloudinary**: Almacenamiento de imágenes
- **FastAPI**: API REST del backend

---

## 📸 Cómo Funciona la Subida de Fotos

### ¿De Dónde Vienen las Fotos?

Las fotos **NO vienen de Cloudinary**. El cliente toma o selecciona fotos desde su dispositivo (celular, cámara web, galería). Cloudinary solo se usa para **almacenar** las fotos después de subirlas.

### Flujo Completo de Subida

```
CLIENTE (Dispositivo)
    │
    │ 1. Toma foto con cámara o selecciona de galería
    │    → Foto está en el dispositivo (foto.jpg)
    │
    │ 2. Frontend crea FormData con la imagen
    │    → FormData { file: [bytes], id_user: 1 }
    │
    │ 3. Envía POST HTTP al backend
    │
    ↓
BACKEND (FastAPI)
    │
    │ 4. Recibe archivo en memoria (UploadFile)
    │
    │ 5. Guarda temporalmente en uploads/
    │    → uploads/abc123_foto.jpg
    │
    │ 6. Sube a Cloudinary
    │
    ↓
CLOUDINARY (Nube)
    │
    │ 7. Almacena y optimiza la imagen
    │    → Genera URL: https://res.cloudinary.com/.../user1.jpg
    │
    │ 8. Devuelve URL al backend
    │
    ↓
BACKEND
    │
    │ 9. Guarda URL en MySQL (tabla fotos_usuario)
    │
    │ 10. Elimina archivo temporal de uploads/
    │
    │ 11. Responde al cliente con la URL
    │
    ↓
CLIENTE
    │
    └─ 12. Recibe URL y puede usarla para try-on
```

### Paso a Paso Detallado

#### 1. Cliente Captura/Selecciona Foto

El usuario tiene 3 opciones:
- **Tomar foto nueva**: Usa la cámara del dispositivo
- **Seleccionar de galería**: Elige una foto existente
- **Usar foto guardada**: Si ya subió fotos antes

#### 2. Frontend Prepara el Envío

```javascript
// El frontend crea FormData (formato para enviar archivos)
const formData = new FormData();
formData.append('file', {
  uri: 'file:///path/to/photo.jpg',  // Ruta local
  type: 'image/jpeg',
  name: 'foto_usuario.jpg'
});
formData.append('id_user', 1);
formData.append('es_principal', true);
```

#### 3. Se Envía al Backend

```http
POST /images/photo
Content-Type: multipart/form-data
Authorization: Bearer [token]

[Bytes de la imagen + metadata]
```

#### 4. Backend Procesa

```python
# FastAPI recibe el archivo
@router.post("/photo")
async def upload_user_photo(
    file: UploadFile = File(...),  # ← Imagen aquí
    id_user: int = Form(...),
    es_principal: bool = Form(False)
):
    # 1. Validar que es imagen
    # 2. Guardar temp en uploads/
    # 3. Subir a Cloudinary
    # 4. Guardar URL en BD
    # 5. Eliminar archivo temp
    # 6. Responder
```

#### 5. Respuesta Final

```json
{
  "id": 5,
  "id_user": 1,
  "foto_url": "https://res.cloudinary.com/craftyourstyle/user1.jpg",
  "es_principal": true,
  "fecha_subida": "2026-02-12T00:00:00Z"
}
```

### 🛡️ Seguridad y Validaciones

**El backend valida:**
- ✅ Que sea una imagen (JPG, PNG, WebP)
- ✅ Tamaño máximo: 10MB
- ✅ Dimensiones mínimas: 512x512px
- ✅ Usuario autenticado (JWT token)

**Cloudinary optimiza:**
- Comprime automáticamente
- Convierte a WebP para web
- Genera múltiples resoluciones
- Sirve desde CDN global

### ⌛ Tiempos Estimados

| Operación | Tiempo |
|-----------|--------|
| Captura de foto | Instantáneo |
| Subida al backend | 0.5-2 segundos |
| Procesamiento y Cloudinary | 1-3 segundos |
| **Total** | **2-5 segundos** |

---

### 💻 Ejemplos de Código Frontend

#### Opción 1: React Native (App Móvil)

```javascript
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const uploadPhoto = async () => {
  // 1. Solicitar permisos
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    alert('Necesitamos permiso para acceder a la cámara');
    return;
  }

  // 2. Abrir cámara
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 4],  // Relación de aspecto para fotos de cuerpo
    quality: 0.8,    // Calidad (0.8 = 80%)
  });

  if (result.canceled) return;

  // 3. Crear FormData
  const formData = new FormData();
  formData.append('file', {
    uri: result.assets[0].uri,        // file:///path/to/photo.jpg
    type: 'image/jpeg',
    name: 'foto_usuario.jpg',
  });
  formData.append('id_user', userId);
  formData.append('es_principal', 'true');

  // 4. Enviar al backend
  try {
    const response = await axios.post(
      'http://localhost:10105/images/photo',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log('Foto subida:', response.data.foto_url);
    // Guardar la URL para usarla en try-on después
    setFotoUrl(response.data.foto_url);
  } catch (error) {
    console.error('Error subiendo foto:', error);
  }
};
```

#### Opción 2: React Web (Navegador)

```jsx
import { useState } from 'react';
import axios from 'axios';

function UploadPhoto() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fotoUrl, setFotoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    } else {
      alert('Por favor selecciona una imagen');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Crear FormData
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('id_user', userId);
    formData.append('es_principal', 'true');

    setUploading(true);

    try {
      const response = await axios.post(
        'http://localhost:10105/images/photo',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Subiendo: ${percentCompleted}%`);
          },
        }
      );

      setFotoUrl(response.data.foto_url);
      alert('Foto subida exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al subir la foto');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
      />
      <button onClick={handleUpload} disabled={!selectedFile || uploading}>
        {uploading ? 'Subiendo...' : 'Subir Foto'}
      </button>
      {fotoUrl && (
        <img src={fotoUrl} alt="Foto subida" style={{ width: 200 }} />
      )}
    </div>
  );
}
```

#### Opción 3: Seleccionar de Galería (React Native)

```javascript
const selectFromGallery = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.8,
  });

  if (!result.canceled) {
    // Mismo código de upload que arriba
    uploadPhotoToBackend(result.assets[0].uri);
  }
};
```

### 🔄 Flujo Completo en la App

```
[Botón "Tomar Foto" o "Seleccionar Foto"]
         |
         v
[Cámara/Galería del dispositivo]
         |
         v
[Usuario toma/selecciona foto]
         |
         v
[FormData se crea con la foto]
         |
         v
[POST a /images/photo]
         |
         v
[Loading indicator: "Subiendo..."]
         |
         v
[Backend procesa y responde]
         |
         v
[Mostrar preview de la foto subida]
         |
         v
[Ahora puede usarse en Virtual Try-On]
```

---

## 🎨 Escenario 1: Personalización Asistida por IA

### Paso 1: Cliente Inicia Conversación

**Cliente:**
> "Hola, quiero personalizar una camiseta"

**Agente IA:**
> "¡Hola! Encantado de ayudarte a crear tu camiseta perfecta. ¿Qué tipo de diseño tienes en mente? Puedes:
> 
> - Subir tu propio logo o imagen
> - Describir un diseño que quieras
> - Agregar texto personalizado
> 
> ¿Qué te gustaría hacer?"

**Endpoint usado:**
```http
POST /chat/session
Body: { "id_user": 1 }
```

---

### Paso 2: Cliente Sube una Imagen

**Cliente:**
> [Sube imagen de un logo de león]
> "Quiero este logo en el pecho"

**Agente IA:**
> [Analiza la imagen con Gemini Vision]
> 
> "¡Genial! Veo que es un logo de león en estilo minimalista, con líneas negras sobre fondo blanco. Muy profesional.
> 
> Para el pecho de la camiseta, te recomiendo:
> - **Tamaño:** Mediano (15cm aprox)
> - **Posición:** Centro superior
> - **Colores sugeridos:** Blanco, Negro, o Azul marino
> 
> ¿Qué color de camiseta prefieres?"

**Endpoints usados:**
```http
POST /images/design
FormData: { file: logo.jpg, id_user: 1 }

POST /chat/session/1/message
Body: {
  "mensaje": "Quiero este logo en el pecho",
  "imagenes": ["https://cloudinary.com/logo.jpg"]
}
```

**Proceso interno:**
1. Imagen se sube a Cloudinary
2. Gemini Vision analiza la imagen
3. Agente sugiere opciones basadas en el análisis

---

### Paso 3: Cliente Elige Opciones

**Cliente:**
> "Azul marino me gusta"

**Agente IA:**
> "¡Excelente elección! El azul marino resalta muy bien con el negro del logo.
> 
> He creado una personalización con:
> ✓ Camiseta azul marino
> ✓ Logo de león en el pecho (centro)
> ✓ Tamaño mediano
> 
> ¿Te gustaría ver cómo quedaría puesta en ti? (Virtual Try-On disponible)"

**Proceso interno:**
1. Se crea registro de personalización en BD
2. Se asocia imagen, color, posición y tamaño
3. Agente ofrece Virtual Try-On

---

## 🤳 Escenario 2: Virtual Try-On

### Paso 4: Cliente Solicita Virtual Try-On

**Cliente:**
> "Sí, quiero ver cómo me queda"

**Agente IA:**
> "Perfecto! Para mostrarte cómo te quedará la camiseta, necesito una foto tuya.
> 
> 📸 **Tips para mejor resultado:**
> - Foto de cuerpo completo o de cintura para arriba
> - Buena iluminación
> - Fondo simple
> - Postura frontal y recta
> - Ropa ajustada o neutra
> 
> ¿Ya tienes una foto guardada o quieres subir una nueva?"

---

### Paso 5A: Cliente Sube Nueva Foto

**Cliente:**
> [Sube foto suya]

**Agente IA:**
> "¡Foto recibida! Procesando...
> 
> Estoy generando tu prueba virtual con:
> - Tu foto
> - Camiseta azul marino
> - Logo de león en el pecho
> 
> ⏳ Esto tomará unos 10-15 segundos..."

> [Sistema genera imagen con IA]

> "¡Listo! 🎉
> 
> [Muestra imagen con el cliente usando la camiseta]
> 
> ¿Qué te parece cómo te queda?
> 
> **Puedes:**
> - 💾 Guardar como favorito
> - 🔄 Probar otro color
> - ✏️ Modificar el diseño
> - 🛒 Agregar al carrito"

**Endpoints usados:**
```http
POST /images/photo
FormData: {
  file: mi_foto.jpg,
  id_user: 1,
  es_principal: true
}

POST /tryon/generate
Body: {
  "id_user": 1,
  "foto_usuario_id": 5,
  "personalizacion_id": 3,
  "variant_id": 10
}
```

**Proceso interno:**
1. Foto se sube a Cloudinary
2. Se guarda en base de datos
3. Se llama al modelo de Virtual Try-On (Banana)
4. Modelo combina foto del usuario + prenda personalizada
5. Imagen resultado se guarda y muestra al usuario

---

### Paso 5B: Cliente Usa Foto Guardada

**Cliente:**
> "Usar mi foto guardada"

**Agente IA:**
> "Genial! Veo que tienes 2 fotos guardadas:
> 
> 1. Foto del 05/02/2026 (Principal) ⭐
> 2. Foto del 28/01/2026
> 
> ¿Cuál quieres usar?"

**Cliente:**
> "La primera"

**Agente IA:**
> [Genera try-on con foto principal]
> "¡Procesando con tu foto principal! ⏳"

**Endpoint usado:**
```http
GET /images/photos/1
Response: [
  { "id": 5, "es_principal": true, "fecha": "2026-02-05" },
  { "id": 3, "es_principal": false, "fecha": "2026-01-28" }
]
```

---

## 🎨 Escenario 3: Iteración y Refinamiento

### Paso 6: Cliente Solicita Cambios

**Cliente:**
> "Me gusta pero quiero el logo más grande"

**Agente IA:**
> "¡Claro! Te muestro opciones de tamaño:
> 
> - **Pequeño:** 10cm
> - **Mediano:** 15cm (actual)
> - **Grande:** 20cm
> - **Extra grande:** 25cm
> 
> ¿Cuál prefieres?"

**Cliente:**
> "Grande"

**Agente IA:**
> "Perfecto! Actualizando diseño...
> 
> ✓ Logo aumentado a 20cm
> 
> ¿Quieres ver el nuevo try-on con este tamaño?"

**Proceso interno:**
1. Se actualiza la personalización en BD
2. Se marca la anterior como versión antigua
3. Se ofrece regenerar try-on con nuevo diseño

---

## 👔 Escenario 4: Recomendaciones de Outfit Completo

### Paso 7: Cliente Pide Sugerencias

**Cliente:**
> "¿Con qué puedo combinar esta camiseta?"

**Agente IA:**
> "¡Excelente pregunta! Para tu camiseta azul marino con logo de león, te recomiendo estos outfits:
> 
> ### 📦 Outfit Casual Profesional
> - Tu camiseta azul marino con logo
> - Jeans oscuros
> - Zapatillas blancas
> 
> ### 📦 Outfit Deportivo
> - Tu camiseta azul marino con logo
> - Pants deportivo negro
> - Tenis deportivos
> 
> ### 📦 Outfit Smart Casual
> - Tu camiseta azul marino con logo
> - Chaqueta gris
> - Pantalón chino beige
> 
> ¿Te gustaría ver cómo te quedaría alguno de estos outfits completos?"

**Cliente:**
> "Sí, el casual profesional"

**Agente IA:**
> "Generando outfit completo con virtual try-on... ⏳
> 
> [Genera imagen con camiseta + jeans + zapatillas]
> 
> ¿Qué te parece?
> 
> **Puedes:**
> - 🛒 Agregar outfit completo al carrito
> - 🔄 Cambiar alguna prenda
> - 💾 Guardar en favoritos"

**Proceso interno:**
1. Agente identifica el diseño actual
2. Consulta catálogo de productos complementarios
3. Aplica reglas de moda (colores que combinan, estilos)
4. Sugiere outfits completos
5. Opcionalmente genera try-on con múltiples prendas

---

## 🔄 Diagrama de Flujo Técnico

```
┌─────────────────────────────────────────────────────────┐
│  INICIO: Cliente entra al chat                         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  PASO 1: Crear Sesión                                  │
│  POST /chat/session                                     │
│  Body: { "id_user": 1 }                                 │
│  Response: { "id": 1, "estado": "activa" }             │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  PASO 2: Cliente envía mensaje inicial                 │
│  POST /chat/session/1/message                           │
│  Body: {                                                │
│    "mensaje": "Quiero personalizar una camiseta"        │
│  }                                                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  PASO 3: Gemini procesa y responde                     │
│  - AgentService.process_user_message()                 │
│  - fashion_agent() → Google Gemini                     │
│  Response: {                                            │
│    "sesion_id": 1,                                      │
│    "mensaje": "¡Hola! Encantado de ayudarte..."        │
│  }                                                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  PASO 4: Cliente sube imagen de diseño                 │
│  POST /images/design                                    │
│  FormData: {                                            │
│    file: logo.jpg,                                      │
│    id_user: 1,                                          │
│    variant_id: 10                                       │
│  }                                                      │
│  Response: {                                            │
│    "id": 15,                                            │
│    "url": "https://cloudinary.com/logo.jpg"            │
│  }                                                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  PASO 5: Cliente menciona imagen en chat               │
│  POST /chat/session/1/message                           │
│  Body: {                                                │
│    "mensaje": "Quiero este logo en el pecho",          │
│    "imagenes": ["https://cloudinary.com/logo.jpg"]     │
│  }                                                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  PASO 6: Gemini Vision analiza imagen                  │
│  - analyze_user_image() → Gemini Vision                │
│  - Identifica: "Logo de león minimalista"              │
│  - Sugiere: Colores, tamaños, posiciones               │
│  Response: {                                            │
│    "mensaje": "Veo un logo de león minimalista..."     │
│  }                                                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  PASO 7: Cliente elige y pide try-on                   │
│  POST /chat/session/1/message                           │
│  Body: {                                                │
│    "mensaje": "Azul, quiero ver cómo me queda"         │
│  }                                                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  PASO 8: Cliente sube foto personal                    │
│  POST /images/photo                                     │
│  FormData: {                                            │
│    file: mi_foto.jpg,                                   │
│    id_user: 1,                                          │
│    es_principal: true                                   │
│  }                                                      │
│  Response: {                                            │
│    "id": 5,                                             │
│    "foto_url": "https://cloudinary.com/user1.jpg"      │
│  }                                                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  PASO 9: Generar Virtual Try-On                        │
│  POST /tryon/generate                                   │
│  Body: {                                                │
│    "id_user": 1,                                        │
│    "foto_usuario_id": 5,                                │
│    "personalizacion_id": 3,                             │
│    "variant_id": 10                                     │
│  }                                                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  PASO 10: Banana procesa (10-15 segundos)              │
│  - TryOnService._call_banana_tryon()                   │
│  - Modelo IDM-VTON combina:                            │
│    * Foto del usuario                                   │
│    * Imagen de la prenda personalizada                 │
│  - Genera imagen realista con prenda puesta            │
│  Response: {                                            │
│    "id": 8,                                             │
│    "imagen_resultado_url": "https://..."               │
│  }                                                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  PASO 11: Cliente ve y decide                          │
│  Opciones disponibles:                                  │
│  - PATCH /tryon/8/favorite → Marcar favorito           │
│  - POST /chat/session/1/message → Modificar            │
│  - [Otro microservicio] → Agregar al carrito           │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 Ejemplo de Interfaz (Frontend)

### Vista de Chat

```
┌──────────────────────────────────────────┐
│  🤖 CraftYourStyle - Asistente IA        │
├──────────────────────────────────────────┤
│                                          │
│  👤 Tú:                                  │
│  Quiero personalizar una camiseta        │
│                                   10:15  │
│                                          │
│  🤖 IA:                                  │
│  ¡Hola! Encantado de ayudarte a crear   │
│  tu camiseta perfecta. ¿Qué tipo de     │
│  diseño tienes en mente?                 │
│                                          │
│  [📤 Subir logo] [✍️ Agregar texto]     │
│  [🎨 Describir diseño]                   │
│                                   10:15  │
│                                          │
│  👤 Tú:                                  │
│  📎 logo_leon.jpg                        │
│  Quiero este en el pecho                 │
│                                   10:16  │
│                                          │
│  🤖 IA:                                  │
│  ¡Genial! Veo que es un logo de león    │
│  en estilo minimalista...                │
│                                          │
│  💡 Recomendaciones:                     │
│  • Tamaño: Mediano (15cm)                │
│  • Posición: Centro superior             │
│  • Colores: Blanco, Negro, Azul         │
│                                          │
│  ¿Qué color prefieres?                   │
│                                   10:16  │
│                                          │
│  👤 Tú:                                  │
│  Azul marino                             │
│                                   10:17  │
│                                          │
│  🤖 IA:                                  │
│  ¡Excelente! El azul resalta bien...    │
│                                          │
│  ✓ Personalización creada                │
│                                          │
│  [🤳 Ver Virtual Try-On]                 │
│  [🎨 Modificar diseño]                   │
│                                   10:17  │
│                                          │
├──────────────────────────────────────────┤
│  Escribe tu mensaje...            [📷]  │
└──────────────────────────────────────────┘
```

### Vista de Virtual Try-On

```
┌──────────────────────────────────────────┐
│  📸 Virtual Try-On                       │
├──────────────────────────────────────────┤
│                                          │
│           [Imagen del usuario            │
│            con la camiseta puesta]       │
│                                          │
│                                          │
│  Camiseta Azul Marino                    │
│  Logo de León - Pecho                    │
│                                          │
│  [💾 Guardar] [🔄 Otro color]           │
│  [✏️ Editar] [🛒 Comprar]               │
│                                          │
├──────────────────────────────────────────┤
│  Tus try-ons guardados: 3                │
│  [👕] [👕] [👕] [+]                     │
└──────────────────────────────────────────┘
```

---

## 🎯 Casos de Uso Principales

### Caso 1: Personalización Simple

**Flujo:**
Cliente describe → IA sugiere → Cliente confirma → Listo

**Duración:** 2-3 minutos

**Endpoints usados:**
- POST /chat/session
- POST /chat/session/{id}/message (x2-3)

---

### Caso 2: Personalización con Imagen

**Flujo:**
Cliente sube logo → IA analiza → Sugiere colores/posiciones → Cliente elige

**Duración:** 3-5 minutos

**Endpoints usados:**
- POST /chat/session
- POST /images/design
- POST /chat/session/{id}/message (x3-4)

---

### Caso 3: Virtual Try-On Simple

**Flujo:**
Cliente crea diseño → Sube foto → IA genera try-on → Cliente ve resultado

**Duración:** 5-7 minutos (incluye 10-15 seg de procesamiento)

**Endpoints usados:**
- POST /chat/session
- POST /images/design
- POST /images/photo
- POST /tryon/generate
- POST /chat/session/{id}/message (x4-5)

---

### Caso 4: Outfit Completo

**Flujo:**
Cliente tiene prenda → IA sugiere combinaciones → Try-on de outfit completo

**Duración:** 7-10 minutos

**Endpoints usados:**
- POST /chat/session
- POST /chat/session/{id}/message (x5-7)
- POST /tryon/generate (x2-3 para diferentes outfits)

---

### Caso 5: Iteración y Refinamiento

**Flujo:**
Cliente no está satisfecho → IA ajusta → Nuevo try-on → Hasta que le guste

**Duración:** Variable (5-15 minutos)

**Endpoints usados:**
- POST /chat/session
- POST /chat/session/{id}/message (x6-10)
- POST /tryon/generate (x2-4)
- PATCH /tryon/{id}/favorite

---

## 📡 Endpoints del API

### Gestión de Sesiones

#### Crear Sesión
```http
POST /chat/session
Content-Type: application/json

{
  "id_user": 1
}

Response: 200 OK
{
  "id": 1,
  "id_user": 1,
  "fecha_inicio": "2026-02-12T00:00:00Z",
  "estado": "activa"
}
```

#### Enviar Mensaje
```http
POST /chat/session/{sesion_id}/message
Content-Type: application/json

{
  "mensaje": "Quiero una camiseta azul",
  "imagenes": ["https://cloudinary.com/logo.jpg"]
}

Response: 200 OK
{
  "sesion_id": 1,
  "mensaje": "¡Perfecto! El azul es un color muy versátil...",
  "imagenes_generadas": null
}
```

---

### Gestión de Imágenes

#### Subir Imagen de Diseño
```http
POST /images/design
Content-Type: multipart/form-data

file: [binary]
id_user: 1
variant_id: 10

Response: 200 OK
{
  "id": 15,
  "url": "https://res.cloudinary.com/craftyourstyle/logo.jpg",
  "tipo": "logo",
  "mensaje": "Imagen subida exitosamente"
}
```

#### Subir Foto de Usuario
```http
POST /images/photo
Content-Type: multipart/form-data

file: [binary]
id_user: 1
es_principal: true

Response: 200 OK
{
  "id": 5,
  "id_user": 1,
  "foto_url": "https://res.cloudinary.com/craftyourstyle/user1.jpg",
  "es_principal": true,
  "fecha_subida": "2026-02-12T00:00:00Z"
}
```

#### Listar Fotos del Usuario
```http
GET /images/photos/{id_user}

Response: 200 OK
[
  {
    "id": 5,
    "foto_url": "https://...",
    "es_principal": true,
    "fecha_subida": "2026-02-12T00:00:00Z"
  },
  {
    "id": 3,
    "foto_url": "https://...",
    "es_principal": false,
    "fecha_subida": "2026-02-05T00:00:00Z"
  }
]
```

---

### Virtual Try-On

#### Generar Try-On
```http
POST /tryon/generate
Content-Type: application/json

{
  "id_user": 1,
  "foto_usuario_id": 5,
  "personalizacion_id": 3,
  "variant_id": 10
}

Response: 200 OK
{
  "id": 8,
  "id_user": 1,
  "foto_usuario_id": 5,
  "personalizacion_id": 3,
  "variant_id": 10,
  "imagen_resultado_url": "https://res.cloudinary.com/result.jpg",
  "fecha_generacion": "2026-02-12T00:00:00Z",
  "favorito": false
}
```

#### Marcar como Favorito
```http
PATCH /tryon/{prueba_id}/favorite
Content-Type: application/json

{
  "favorito": true
}

Response: 200 OK
{
  "message": "Actualizado exitosamente",
  "favorito": true
}
```

#### Listar Try-Ons del Usuario
```http
GET /tryon/user/{id_user}

Response: 200 OK
[
  {
    "id": 8,
    "imagen_resultado_url": "https://...",
    "favorito": true,
    "fecha_generacion": "2026-02-12T00:00:00Z"
  },
  {
    "id": 6,
    "imagen_resultado_url": "https://...",
    "favorito": false,
    "fecha_generacion": "2026-02-10T00:00:00Z"
  }
]
```

---

## 📊 Métricas y Tiempos

### Tiempos de Respuesta Esperados

| Operación | Tiempo |
|-----------|--------|
| Respuesta del chat (Gemini) | 1-3 segundos |
| Análisis de imagen (Gemini Vision) | 2-4 segundos |
| Subida de imagen a Cloudinary | 0.5-2 segundos |
| Generación de Virtual Try-On (Banana) | 10-15 segundos |
| Consultas a base de datos | < 100ms |

### Experiencia del Usuario

| Interacción Completa | Duración Total |
|---------------------|----------------|
| Personalización simple | 2-3 minutos |
| Con análisis de imagen | 3-5 minutos |
| Con Virtual Try-On | 5-7 minutos |
| Outfit completo | 7-10 minutos |

---

## 🔒 Consideraciones de Seguridad

1. **Validación de imágenes**: Solo se aceptan formatos JPG, PNG, WebP
2. **Tamaño máximo**: 10MB por imagen
3. **Rate limiting**: Máximo 5 try-ons por minuto por usuario
4. **Autenticación**: JWT token requerido en todos los endpoints
5. **Privacidad**: Las imágenes del usuario son privadas y solo accesibles por el propio usuario

---

## 📝 Notas Técnicas

### Procesamiento de Imágenes

1. **Subida a Cloudinary**: Las imágenes se optimizan automáticamente
2. **Formato de almacenamiento**: WebP para web, original para procesamiento
3. **CDN**: Cloudinary sirve las imágenes desde CDN global

### Virtual Try-On

1. **Modelo**: IDM-VTON o similar vía Banana
2. **Resolución**: 512x512 mínimo, 1024x1024 recomendado
3. **Procesamiento**: GPU en la nube (Banana)
4. **Caché**: Resultados se cachean para evitar regeneración

### Chat con IA

1. **Contexto**: Se mantienen últimos 5 mensajes
2. **Memoria**: Sesión persiste en BD
3. **Análisis de imágenes**: Gemini Vision integrado
4. **Sugerencias**: Basadas en reglas de moda + IA

---

## 🚀 Próximas Mejoras

- [ ] Try-on de outfits completos (múltiples prendas)
- [ ] Generación de diseños con IA (Stable Diffusion)
- [ ] Recomendaciones personalizadas por historial
- [ ] Compartir try-ons en redes sociales
- [ ] Realidad aumentada (AR) en tiempo real

---

**Documento creado el:** 12 de febrero de 2026  
**Versión:** 1.0  
**Proyecto:** CraftYourStyle - SENA

---

Para más información técnica, consulta:
- `README.md` - Guía de instalación
- `EXPLICACION_ARCHIVOS.md` - Estructura del proyecto
- `COMENTARIOS_CODIGO.md` - Explicación del código
