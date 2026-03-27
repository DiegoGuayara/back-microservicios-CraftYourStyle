from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class MensajeRequest(BaseModel):
    """Request para enviar un mensaje al agente"""
    mensaje: str = Field(..., description="Contenido del mensaje")
    imagenes: Optional[List[str]] = Field(None, description="URLs de imágenes adjuntas")
    product_id: Optional[int] = Field(None, description="ID de la prenda del catálogo")
    product_name: Optional[str] = Field(None, description="Nombre de la prenda seleccionada")
    product_description: Optional[str] = Field(None, description="Descripción de la prenda seleccionada")
    product_image_url: Optional[str] = Field(None, description="URL de la imagen base de la prenda seleccionada")
    terms_accepted: bool = Field(False, description="Aceptación explícita de términos")
    

class MensajeResponse(BaseModel):
    """Response de un mensaje"""
    id: int
    tipo: str
    contenido: str
    metadata: Optional[dict] = Field(default=None, alias="datos_extra")
    timestamp: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True
        allow_population_by_field_name = True


class SesionCreate(BaseModel):
    """Request para crear una sesión"""
    id_user: int
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    product_description: Optional[str] = None
    product_image_url: Optional[str] = None
    terms_accepted: bool = False


class SesionResponse(BaseModel):
    """Response de una sesión"""
    id: int
    id_user: int
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    fecha_inicio: datetime
    fecha_fin: Optional[datetime] = None
    estado: str
    
    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    """Response del chat con el agente"""
    sesion_id: int
    mensaje: str
    imagenes_generadas: Optional[List[str]] = None
