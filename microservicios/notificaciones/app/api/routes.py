"""
Routes (Rutas) de Notificaciones

Define los endpoints HTTP para el microservicio de notificaciones.
Utiliza FastAPI para manejar las peticiones y SQLAlchemy para la base de datos.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.config import SessionLocal
from app.schemas.esquema import NotificacionCreate, NotificacionResponse
from app.services.notificacion import crear_notificacion, obtener_notificaciones

# Router con tag para agrupar endpoints en la documentación automática
router = APIRouter(tags=["Notificaciones"])

# Dependencia para obtener una sesión de base de datos en cada request
def get_db():
    """
    Generador de sesión de base de datos
    
    Crea una nueva sesión para cada petición HTTP y la cierra automáticamente
    cuando termina la petición (usando yield).
    
    Yields:
        Session: Sesión de SQLAlchemy para interactuar con la BD
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=NotificacionResponse)
def add_notification(notification: NotificacionCreate, db: Session = Depends(get_db)):
    """
    Crea una nueva notificación
    
    Endpoint: POST /
    
    Body esperado:
    {
        "tipo_de_notificacion": "mensaje_texto" | "correo_electronico" | "push",
        "mensaje": "Texto de la notificación"
    }
    
    Args:
        notification: Datos de la notificación a crear
        db: Sesión de base de datos (inyectada automáticamente)
    
    Returns:
        NotificacionResponse: Notificación creada con su ID
    
    Status Codes:
        200: Notificación creada exitosamente
        422: Datos inválidos (tipo de notificación no válido o mensaje vacío)
    """
    return crear_notificacion(db, notification)

@router.get("/", response_model=list[NotificacionResponse])
def get_all(db: Session = Depends(get_db)):
    """
    Obtiene todas las notificaciones
    
    Endpoint: GET /
    
    Args:
        db: Sesión de base de datos (inyectada automáticamente)
    
    Returns:
        list[NotificacionResponse]: Lista de todas las notificaciones
    
    Status Codes:
        200: Lista obtenida exitosamente (puede estar vacía)
    """
    return obtener_notificaciones(db)
