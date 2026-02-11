from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TryOnRequest(BaseModel):
    """Request para generar virtual try-on"""
    id_user: int
    foto_usuario_id: int
    personalizacion_id: Optional[int] = None
    variant_id: Optional[int] = None


class TryOnResponse(BaseModel):
    """Response de virtual try-on"""
    id: int
    id_user: int
    foto_usuario_id: int
    personalizacion_id: Optional[int] = None
    variant_id: Optional[int] = None
    imagen_resultado_url: str
    fecha_generacion: datetime
    favorito: bool
    
    class Config:
        from_attributes = True


class TryOnFavoritoRequest(BaseModel):
    """Request para marcar/desmarcar favorito"""
    favorito: bool
