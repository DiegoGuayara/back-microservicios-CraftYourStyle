"""
Modelos de Base de Datos (SQLAlchemy ORM)

Define la estructura de las tablas en la base de datos.
Utiliza SQLAlchemy ORM para mapear clases Python a tablas SQL.
"""

from sqlalchemy import Column, Integer, String, Enum
from app.core.config import Base
import enum

class TipoNotificacion(str, enum.Enum):
    """
    Enum con los tipos de notificación disponibles
    
    Valores:
        - mensaje_texto: Notificación por SMS o mensaje de texto
        - correo_electronico: Notificación por email
        - push: Notificación push en aplicación móvil
    """
    mensaje_texto = "mensaje_texto"
    correo_electronico = "correo_electronico"
    push = "push"

class Notificacion(Base):
    """
    Modelo de Notificación (Tabla: notificaciones)
    
    Representa una notificación en el sistema.
    
    Atributos:
        id: Identificador único auto-incremental
        tipo_de_notificacion: Tipo de notificación (mensaje_texto, correo_electronico, push)
        mensaje: Contenido de la notificación (máximo 250 caracteres)
    """
    __tablename__ = "notificaciones"

    id = Column(Integer, primary_key=True, index=True)
    tipo_de_notificacion = Column(Enum(TipoNotificacion), nullable=False)
    mensaje = Column(String(250), nullable=False)
