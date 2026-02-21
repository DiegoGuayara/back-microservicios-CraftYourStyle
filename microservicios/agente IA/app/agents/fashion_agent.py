"""
Fashion Agent - Migrado a Mirascope 2.2.2

Este módulo ahora exporta funciones que utilizan el orquestador de Mirascope.
Mantiene la misma interfaz para compatibilidad con el código existente.
"""
from dataclasses import dataclass
from typing import Optional
from app.agents.orchestrator import orchestrator, AgentResponse


# Re-exportar AgentResponse para compatibilidad
__all__ = ['AgentResponse', 'fashion_agent', 'generate_design_prompt', 'analyze_user_image']


async def fashion_agent(
    user_message: str, 
    context: Optional[str] = None
) -> AgentResponse:
    """
    Agente principal de moda y personalización
    Ahora usa el orquestador de Mirascope 2.2.2
    
    Args:
        user_message: Mensaje del usuario
        context: Contexto adicional (historial, datos del usuario, etc.)
        
    Returns:
        Respuesta del modelo
    """
    return await orchestrator.orchestrate(
        user_message=user_message,
        context=context,
        intent="general"
    )


async def generate_design_prompt(
    user_request: str,
    garment_type: str = "camiseta"
) -> AgentResponse:
    """
    Genera un prompt optimizado para Stable Diffusion
    Ahora usa el orquestador de Mirascope 2.2.2
    
    Args:
        user_request: Lo que el usuario quiere en la prenda
        garment_type: Tipo de prenda
        
    Returns:
        Prompt optimizado para generación de imágenes
    """
    response = await orchestrator.generate_design_prompt(
        user_request=user_request,
        garment_type=garment_type
    )
    return AgentResponse(content=response.content)


async def analyze_user_image(image_url: str) -> AgentResponse:
    """
    Analiza una imagen subida por el usuario
    Ahora usa el orquestador de Mirascope 2.2.2
    
    Args:
        image_url: URL de la imagen a analizar
        
    Returns:
        Descripción detallada de la imagen
    """
    response = await orchestrator.analyze_image(image_url=image_url)
    return AgentResponse(content=response.content)
