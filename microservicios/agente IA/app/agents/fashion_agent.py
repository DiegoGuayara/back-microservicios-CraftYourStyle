from mirascope.google import gemini_call
from typing import List, Optional
from app.config.settings import settings
import os

# Configurar la API key de Gemini
os.environ["GOOGLE_API_KEY"] = settings.GEMINI_API_KEY


@gemini_call("gemini-1.5-flash")
async def fashion_agent(
    user_message: str,
    context: Optional[str] = None
) -> str:
    """
    Agente principal de moda y personalización
    
    Args:
        user_message: Mensaje del usuario
        context: Contexto adicional (historial, datos del usuario, etc.)
        
    Returns:
        Respuesta del modelo
    """
    return f"""
    SYSTEM:
    Eres un asistente de IA experto en moda y personalización de prendas para CraftYourStyle.
    
    Tus responsabilidades son:
    1. Ayudar a los usuarios a personalizar prendas (añadir diseños, logos, texto)
    2. Sugerir combinaciones de colores y estilos
    3. Recomendar outfits completos
    4. Procesar imágenes que el usuario envía para personalización
    5. Guiar en el proceso de virtual try-on
    
    Debes ser:
    - Amigable y creativo
    - Claro en tus explicaciones
    - Proactivo sugiriendo ideas
    - Experto en tendencias de moda
    
    Contexto del usuario:
    {context or 'No hay contexto previo'}
    
    USER:
    {user_message}
    """


@gemini_call("gemini-1.5-flash")
async def generate_design_prompt(
    user_request: str,
    garment_type: str = "camiseta"
) -> str:
    """
    Genera un prompt optimizado para Stable Diffusion
    
    Args:
        user_request: Lo que el usuario quiere en la prenda
        garment_type: Tipo de prenda
        
    Returns:
        Prompt optimizado para generación de imágenes
    """
    return f"""
    SYSTEM:
    Eres un experto en describir diseños para prendas de vestir.
    Genera descripciones detalladas en inglés para modelos de generación de imágenes (Stable Diffusion).
    
    La descripción debe ser técnica y específica, incluyendo:
    - Tipo de prenda
    - Colores
    - Estilo del diseño
    - Posición del diseño
    - Detalles adicionales
    
    USER:
    El usuario quiere: {user_request}
    Tipo de prenda: {garment_type}
    """


@gemini_call("gemini-1.5-flash")
async def analyze_user_image(image_url: str) -> str:
    """
    Analiza una imagen subida por el usuario
    
    Args:
        image_url: URL de la imagen a analizar
        
    Returns:
        Descripción detallada de la imagen
    """
    return f"""
    SYSTEM:
    Analiza la siguiente imagen y describe qué ves.
    Enfócate en elementos que puedan ser utilizados para personalizar prendas:
    - Logos
    - Patrones
    - Colores dominantes
    - Estilo visual
    
    USER:
    {image_url}
    
    Describe esta imagen en detalle para que pueda ser usada en personalización de prendas.
    """
