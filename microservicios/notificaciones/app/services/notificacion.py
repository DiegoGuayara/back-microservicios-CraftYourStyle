"""
Servicio de Notificaciones

Contiene la lógica de negocio para gestionar notificaciones.
Interactúa directamente con la base de datos usando SQLAlchemy ORM.
"""

from sqlalchemy.orm import Session
from app.models.notification import Notificacion
from app.schemas.esquema import NotificacionCreate

def crear_notificacion(db: Session, data: NotificacionCreate):
    """
    Crea una nueva notificación en la base de datos
    
    Args:
        db: Sesión de SQLAlchemy para interactuar con la BD
        data: Datos de la notificación (tipo_de_notificacion y mensaje)
    
    Returns:
        Notificacion: Objeto de notificación creado con su ID asignado
    
    Proceso:
        1. Convierte el schema Pydantic a un modelo SQLAlchemy
        2. Añade el registro a la sesión
        3. Hace commit para guardar en la BD
        4. Refresca el objeto para obtener el ID auto-generado
        5. Retorna la notificación creada
    """
    nueva = Notificacion(**data.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

def obtener_notificaciones(db: Session):
    """
    Obtiene todas las notificaciones de la base de datos
    
    Args:
        db: Sesión de SQLAlchemy para interactuar con la BD
    
    Returns:
        list[Notificacion]: Lista con todas las notificaciones registradas
        
    Nota:
        Retorna una lista vacía si no hay notificaciones en la BD
    """
    return db.query(Notificacion).all()
