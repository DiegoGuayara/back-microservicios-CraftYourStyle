"""
Schemas de Validación (Pydantic)

Define los schemas para validar datos de entrada y salida en las APIs.
Utiliza Pydantic para validación automática de tipos y datos.
"""

from pydantic import BaseModel
from enum import Enum

class TipoNotificacion(str, Enum):
    """
    Enum con los tipos de notificación válidos
    
    Usado para validar que el tipo de notificación enviado es válido.
    """
    mensaje_texto = "mensaje_texto"
    correo_electronico = "correo_electronico"
    push = "push"

class NotificacionCreate(BaseModel):
    """
    Schema para crear una notificación
    
    Usado en el endpoint POST para validar los datos de entrada.
    
    Atributos:
        tipo_de_notificacion: Tipo de notificación (debe ser uno de los valores del Enum)
        mensaje: Texto del mensaje (obligatorio)
    """
    tipo_de_notificacion: TipoNotificacion
    mensaje: str

class NotificacionResponse(NotificacionCreate):
    """
    Schema para respuesta de notificación
    
    Usado para serializar notificaciones al enviarlas como respuesta.
    Hereda de NotificacionCreate y añade el campo id.
    
    Atributos:
        id: ID de la notificación (generado automáticamente por la BD)
        tipo_de_notificacion: Heredado de NotificacionCreate
        mensaje: Heredado de NotificacionCreate
    """
    id: int

    class Config:
        # Permite convertir modelos SQLAlchemy a Pydantic
        from_attributes = True
