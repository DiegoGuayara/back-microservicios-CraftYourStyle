# Migración a Mirascope 2.2.2

## 📋 Resumen de Cambios

Se ha migrado completamente el microservicio del agente de IA desde `google-generativeai` directo a **Mirascope 2.2.2** con arquitectura de orquestador.

### ✅ Cambios Realizados

1. **requirements.txt**
   - ❌ Eliminado: `google-generativeai==0.8.3`
   - ✅ Agregado: `mirascope[gemini]==2.2.2`

2. **Nuevo archivo: `app/agents/orchestrator.py`**
   - Orquestador principal usando Mirascope 2.2.2
   - Clase `FashionOrchestrator` que coordina todos los agentes
   - Métodos especializados usando decoradores `@gemini.call` y `@prompt_template`
   - Método `orchestrate()` que gestiona el flujo completo

3. **Actualizado: `app/agents/fashion_agent.py`**
   - Ahora es una capa de compatibilidad
   - Las funciones mantienen la misma interfaz
   - Internamente llaman al orquestador de Mirascope

4. **Actualizado: `app/services/agent_service.py`**
   - Importa y usa el orquestador directamente
   - Simplificado el proceso de análisis de imágenes
   - El orquestador maneja automáticamente las imágenes

5. **Actualizado: `app/agents/__init__.py`**
   - Exporta el orquestador y sus componentes
   - Mantiene exports de compatibilidad

---

## 🏗️ Arquitectura del Orquestador

### Clase: `FashionOrchestrator`

```python
class FashionOrchestrator:
    """
    Orquestador principal usando Mirascope 2.2.2
    """
    
    # Agentes especializados (todos usan @gemini.call + @prompt_template)
    async def fashion_agent(...)          # Agente general de moda
    async def generate_design_prompt(...) # Generación de prompts para Stable Diffusion
    async def analyze_image(...)          # Análisis de imágenes con Gemini Vision
    async def tryon_guidance(...)         # Guía para virtual try-on
    
    # Método principal de orquestación
    async def orchestrate(...)            # Coordina todo el flujo
```

### Decoradores de Mirascope 2.2.2

Todos los agentes usan esta estructura:

```python
@gemini.call(model="gemini-1.5-flash", api_key=settings.GEMINI_API_KEY)
@prompt_template(
    """
    SYSTEM:
    [Instrucciones del sistema]
    
    USER:
    {user_message}
    """
)
async def nombre_agente(self, user_message: str) -> gemini.GeminiDynamicConfig:
    return {"temperature": 0.7}
```

**Ventajas:**
- ✅ Código más limpio y estructurado
- ✅ Configuración centralizada del modelo
- ✅ Prompts definidos de forma declarativa
- ✅ Control fino de parámetros (temperature, etc.)
- ✅ Tipo de retorno tipado

---

## 🔄 Flujo de Ejecución

### Antes (google-generativeai directo)

```
Usuario → agent_service → fashion_agent (función) → genai.GenerativeModel → Gemini API
```

### Después (Mirascope 2.2.2 con Orquestador)

```
Usuario → agent_service → orchestrator.orchestrate() → Agentes especializados → Mirascope → Gemini API
                                                       ↓
                                         [fashion_agent, analyze_image, etc.]
```

### Ejemplo de Uso

```python
# En agent_service.py
response = await orchestrator.orchestrate(
    user_message="Quiero personalizar una camiseta",
    context="Usuario está explorando diseños",
    images=["https://cloudinary.com/logo.jpg"],
    intent="general"  # o "design", "tryon", "image_analysis"
)

print(response.content)  # Respuesta del agente
print(response.metadata)  # Metadata (intent, imágenes analizadas, etc.)
```

---

## 📦 Instalación de Dependencias

```bash
# Activar entorno virtual
.\venv\Scripts\Activate.ps1

# Instalar Mirascope 2.2.2
pip install mirascope[gemini]==2.2.2

# O instalar todo
pip install -r requirements.txt
```

---

## 🎯 Características de Mirascope 2.2.2

### 1. **@prompt_template**
Define prompts de forma declarativa con placeholders:

```python
@prompt_template(
    """
    SYSTEM: Eres un experto en {domain}
    USER: {user_input}
    """
)
```

### 2. **@gemini.call**
Decorador que maneja la llamada a Gemini:

```python
@gemini.call(model="gemini-1.5-flash", api_key=settings.GEMINI_API_KEY)
async def mi_agente(self, mensaje: str) -> gemini.GeminiDynamicConfig:
    return {"temperature": 0.7}
```

### 3. **Configuración Dinámica**
Control fino de parámetros del modelo:

```python
return {
    "temperature": 0.7,      # Creatividad (0-1)
    "top_p": 0.95,           # Nucleus sampling
    "top_k": 40,             # Top-k sampling
    "max_tokens": 1024       # Longitud máxima
}
```

### 4. **Orquestación Inteligente**
El método `orchestrate()` decide qué agente usar según el intent:

```python
if intent == "design":
    response = await self.generate_design_prompt(...)
elif intent == "tryon":
    response = await self.tryon_guidance(...)
else:
    response = await self.fashion_agent(...)
```

---

## 🧪 Testing

### Probar el Orquestador

```python
from app.agents.orchestrator import orchestrator

# Test básico
response = await orchestrator.fashion_agent(
    user_message="Quiero una camiseta con un logo de león",
    context="Primera interacción"
)
print(response.content)

# Test con imágenes
response = await orchestrator.orchestrate(
    user_message="Analiza este diseño",
    images=["https://res.cloudinary.com/ejemplo.jpg"],
    intent="general"
)
print(response.content)
print(response.metadata)
```

---

## 📊 Comparación: Antes vs Después

| Aspecto | Antes (google-generativeai) | Después (Mirascope 2.2.2) |
|---------|----------------------------|---------------------------|
| **Estructura** | Funciones independientes | Orquestador con agentes especializados |
| **Prompts** | F-strings con formato manual | `@prompt_template` declarativo |
| **Llamadas al modelo** | `_model.generate_content(prompt)` | `@gemini.call` automático |
| **Configuración** | Hardcoded en código | Configuración dinámica por método |
| **Análisis de imágenes** | Loop manual en service | Automático en orquestador |
| **Mantenibilidad** | Media | Alta |
| **Testabilidad** | Media | Alta |
| **Escalabilidad** | Limitada | Excelente |

---

## 🔧 Configuración

### Variables de Entorno (.env)

```env
# API de Gemini (REQUERIDO)
GEMINI_API_KEY=tu_clave_aqui

# Otras configuraciones...
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=CraftYourStyle_Personalizacion
```

---

## 🐛 Troubleshooting

### Error: "No module named 'mirascope'"

```bash
pip install mirascope[gemini]==2.2.2
```

### Error: "Invalid API key"

Verifica que `GEMINI_API_KEY` esté correctamente configurado en `.env`:

```env
GEMINI_API_KEY=AIza...
```

### Error: "temperature must be between 0 and 1"

Ajusta los valores en el método del orquestador:

```python
return {"temperature": 0.7}  # Debe estar entre 0 y 1
```

---

## 📚 Recursos

- **Documentación Mirascope**: https://mirascope.com/docs
- **Gemini API**: https://ai.google.dev/docs
- **Código del Orquestador**: `app/agents/orchestrator.py`

---

## ✨ Próximos Pasos

1. **Agregar más agentes especializados**
   - Agente de recomendación de colores
   - Agente de análisis de tendencias
   - Agente de composición de outfits

2. **Implementar caché de respuestas**
   - Cachear análisis de imágenes repetidas
   - Cachear recomendaciones frecuentes

3. **Métricas y logging**
   - Tracking de latencia por agente
   - Logging de prompts y respuestas
   - Análisis de uso de tokens

4. **Testing automatizado**
   - Unit tests para cada agente
   - Integration tests del orquestador
   - Tests de regresión

---

## 👥 Soporte

Para preguntas sobre la migración, consulta:
- `app/agents/orchestrator.py` - Implementación del orquestador
- `EXPLICACION_ARCHIVOS.md` - Documentación de todos los archivos
- `README.md` - Guía de instalación y uso
