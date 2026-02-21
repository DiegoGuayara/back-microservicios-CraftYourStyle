"""
Orquestador principal del agente de IA usando Mirascope 2.2.2
"""
import os
from dataclasses import dataclass
from typing import List, Optional

from mirascope import llm

from app.config.settings import settings

# Mirascope 2.2.2 usa IDs de modelo con proveedor: "google/<modelo>"
MODEL = "google/gemini-2.5-flash"
os.environ.setdefault("GOOGLE_API_KEY", settings.GEMINI_API_KEY)


@llm.call(MODEL, temperature=0.7)
async def _fashion_agent_call(user_message: str, context: str = "No hay contexto previo"):
    return f"""
    SYSTEM:
    Eres un asistente de IA experto en moda y personalizacion de prendas para CraftYourStyle.

    Tus responsabilidades son:
    1. Ayudar a los usuarios a personalizar prendas (anadir disenos, logos, texto)
    2. Sugerir combinaciones de colores y estilos
    3. Recomendar outfits completos
    4. Procesar imagenes que el usuario envia para personalizacion
    5. Guiar en el proceso de virtual try-on

    Debes ser amigable, creativo y claro.

    Contexto del usuario:
    {context}

    USER:
    {user_message}
    """


@llm.call(MODEL, temperature=0.5)
async def _design_prompt_call(user_request: str, garment_type: str = "camiseta"):
    return f"""
    SYSTEM:
    Eres un experto en describir disenos para prendas de vestir.
    Genera descripciones detalladas en ingles para modelos de generacion de imagenes (Stable Diffusion).

    La descripcion debe incluir:
    - Tipo de prenda
    - Colores
    - Estilo del diseno
    - Posicion del diseno
    - Detalles adicionales

    USER:
    El usuario quiere: {user_request}
    Tipo de prenda: {garment_type}
    """


@llm.call(MODEL, temperature=0.3)
async def _analyze_image_call(image_url: str):
    return f"""
    SYSTEM:
    Analiza la siguiente imagen y describe que ves.
    Enfocate en elementos para personalizar prendas:
    - Logos
    - Patrones
    - Colores dominantes
    - Estilo visual
    - Elementos principales
    - Sugerencias de uso en una prenda

    USER:
    URL de la imagen: {image_url}
    """


@llm.call(MODEL, temperature=0.6)
async def _tryon_guidance_call(
    user_message: str, context: str = "Primera consulta de try-on"
):
    return f"""
    SYSTEM:
    Eres un experto en virtual try-on (probarse ropa virtualmente).

    Guia al usuario para:
    1. Subir una foto clara
    2. Confirmar prenda u outfit
    3. Explicar que se generara una visualizacion realista

    USER:
    {user_message}

    Contexto:
    {context}
    """


@dataclass
class AgentResponse:
    """Respuesta del agente de IA"""
    content: str
    metadata: Optional[dict] = None


class FashionOrchestrator:
    """
    Orquestador principal que coordina todos los agentes especializados
    usando Mirascope 2.2.2
    """
    
    def __init__(self, api_key: str = settings.GEMINI_API_KEY):
        """
        Inicializa el orquestador
        
        Args:
            api_key: API key de Google Gemini
        """
        self.api_key = api_key
        self._setup_agents()
    
    def _setup_agents(self):
        """Configura los agentes especializados"""
        # Los agentes se crean dinámicamente en cada llamada
        # para mantener el estado fresco
        pass
    
    @staticmethod
    def _extract_text(response) -> str:
        """Normaliza AsyncResponse/Response de Mirascope a texto plano."""
        texts = [getattr(part, "text", "").strip() for part in getattr(response, "texts", [])]
        texts = [t for t in texts if t]
        if texts:
            return "\n".join(texts)

        content = getattr(response, "content", None)
        if isinstance(content, str) and content.strip():
            return content.strip()

        if isinstance(content, list):
            fallback = []
            for part in content:
                text = getattr(part, "text", None)
                if isinstance(text, str) and text.strip():
                    fallback.append(text.strip())
            if fallback:
                return "\n".join(fallback)

        return "No se pudo generar una respuesta en este momento."

    async def fashion_agent(
        self, 
        user_message: str, 
        context: str = "No hay contexto previo"
    ):
        """
        Agente principal de moda y personalización
        
        Args:
            user_message: Mensaje del usuario
            context: Contexto adicional (historial, datos del usuario, etc.)
            
        Returns:
            Configuración dinámica de Gemini
        """
        return await _fashion_agent_call(user_message=user_message, context=context)

    async def generate_design_prompt(
        self,
        user_request: str,
        garment_type: str = "camiseta"
    ):
        """
        Genera un prompt optimizado para Stable Diffusion
        
        Args:
            user_request: Lo que el usuario quiere en la prenda
            garment_type: Tipo de prenda
            
        Returns:
            Configuración dinámica de Gemini
        """
        return await _design_prompt_call(
            user_request=user_request, garment_type=garment_type
        )

    async def analyze_image(
        self,
        image_url: str
    ):
        """
        Analiza una imagen subida por el usuario
        
        Args:
            image_url: URL de la imagen a analizar
            
        Returns:
            Configuración dinámica de Gemini
        """
        return await _analyze_image_call(image_url=image_url)

    async def tryon_guidance(
        self,
        user_message: str,
        context: str = "Primera consulta de try-on"
    ):
        """
        Proporciona guía para virtual try-on
        
        Args:
            user_message: Mensaje del usuario
            context: Contexto de la conversación
            
        Returns:
            Configuración dinámica de Gemini
        """
        return await _tryon_guidance_call(user_message=user_message, context=context)
    
    async def orchestrate(
        self,
        user_message: str,
        context: Optional[str] = None,
        images: Optional[List[str]] = None,
        intent: str = "general"
    ) -> AgentResponse:
        """
        Orquesta la respuesta del agente según el intent del usuario
        
        Args:
            user_message: Mensaje del usuario
            context: Contexto de la conversación
            images: Lista de URLs de imágenes
            intent: Intención detectada (general, design, tryon, image_analysis)
            
        Returns:
            Respuesta del agente
        """
        try:
            # Si hay imágenes, primero analizarlas
            image_analyses = []
            if images:
                for img_url in images:
                    response = await self.analyze_image(image_url=img_url)
                    image_analyses.append(self._extract_text(response))
                
                # Agregar análisis al contexto
                if context:
                    context += "\n\nImágenes adjuntas:\n" + "\n".join(image_analyses)
                else:
                    context = "Imágenes adjuntas:\n" + "\n".join(image_analyses)
            
            # Seleccionar agente según intent
            if intent == "design":
                response = await self.generate_design_prompt(
                    user_request=user_message,
                    garment_type="camiseta"  # Puede ser dinámico
                )
            elif intent == "tryon":
                response = await self.tryon_guidance(
                    user_message=user_message,
                    context=context or "Primera consulta"
                )
            else:
                # Agente general de moda
                response = await self.fashion_agent(
                    user_message=user_message,
                    context=context or "No hay contexto previo"
                )
            
            return AgentResponse(
                content=self._extract_text(response),
                metadata={
                    "intent": intent,
                    "images_analyzed": len(image_analyses) if images else 0
                }
            )
            
        except Exception as e:
            return AgentResponse(
                content=f"Lo siento, hubo un error al procesar tu solicitud: {str(e)}",
                metadata={"error": str(e)}
            )


# Instancia global del orquestador
orchestrator = FashionOrchestrator()
