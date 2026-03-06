from .chat import router as chat_router
from .images import router as images_router
from .tryon import router as tryon_router
from .legacy_generate import router as legacy_generate_router

__all__ = ["chat_router", "images_router", "tryon_router", "legacy_generate_router"]
