from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ImagenUploadResponse(BaseModel):
    """Response al subir una imagen"""
    id: int
    url: str
    tipo: str
    mensaje: str = "Imagen subida exitosamente"


class FotoUsuarioCreate(BaseModel):
    """Request para registrar foto de usuario"""
    id_user: int
    es_principal: Optional[bool] = False


class FotoUsuarioResponse(BaseModel):
    """Response de foto de usuario"""
    id: int
    id_user: int
    foto_url: str
    es_principal: bool
    fecha_subida: datetime
    
    class Config:
        from_attributes = True
