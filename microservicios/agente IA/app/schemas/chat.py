from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class MensajeRequest(BaseModel):
    """Request para enviar un mensaje al agente"""
    mensaje: str = Field(..., description="Contenido del mensaje")
    imagenes: Optional[List[str]] = Field(None, description="URLs de imágenes adjuntas")
    

class MensajeResponse(BaseModel):
    """Response de un mensaje"""
    id: int
    tipo: str
    contenido: str
    metadata: Optional[dict] = None
    timestamp: datetime
    
    class Config:
        from_attributes = True


class SesionCreate(BaseModel):
    """Request para crear una sesión"""
    id_user: int


class SesionResponse(BaseModel):
    """Response de una sesión"""
    id: int
    id_user: int
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
