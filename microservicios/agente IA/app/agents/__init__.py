# Importar funciones compatibles del fashion_agent (ahora usa Mirascope 2.2.2)
from .fashion_agent import fashion_agent, generate_design_prompt, analyze_user_image

# Importar el orquestador de Mirascope 2.2.2
from .orchestrator import orchestrator, FashionOrchestrator, AgentResponse

# Importar prompts (mantenidos para referencia)
from .prompts import (
    FASHION_AGENT_SYSTEM_PROMPT,
    DESIGN_GENERATION_PROMPT,
    TRYON_GUIDANCE_PROMPT,
    IMAGE_ANALYSIS_PROMPT
)

__all__ = [
    # Funciones de compatibilidad
    "fashion_agent",
    "generate_design_prompt",
    "analyze_user_image",
    # Orquestador Mirascope 2.2.2
    "orchestrator",
    "FashionOrchestrator",
    "AgentResponse",
    # Prompts
    "FASHION_AGENT_SYSTEM_PROMPT",
    "DESIGN_GENERATION_PROMPT",
    "TRYON_GUIDANCE_PROMPT",
    "IMAGE_ANALYSIS_PROMPT"
]
