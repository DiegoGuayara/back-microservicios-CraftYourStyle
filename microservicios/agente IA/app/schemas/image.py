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


class ImagenSaveRequest(BaseModel):
    """Request para guardar URL de imagen generada"""
    id_user: int
    image_url: str
    variant_id: Optional[int] = None
    tipo: Optional[str] = "usuario_diseño"
    prompt: Optional[str] = None
    garment_type: Optional[str] = None


class ImagenSavedResponse(BaseModel):
    """Response de imagen guardada"""
    id: int
    id_user: Optional[int] = None
    image_url: str
    variant_id: Optional[int] = None
    tipo: str
    prompt: Optional[str] = None
    garment_type: Optional[str] = None
    estado: Optional[str] = None
    precio: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ImagenAprobacionRequest(BaseModel):
    """Request para aprobar imagen y asignar precio"""
    precio: float = Field(..., gt=0)


class ImagenAdminResponse(BaseModel):
    """Response para admin con datos de usuario y estado"""
    id: int
    id_user: Optional[int] = None
    image_url: str
    prompt: Optional[str] = None
    garment_type: Optional[str] = None
    estado: Optional[str] = None
    precio: Optional[float] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
