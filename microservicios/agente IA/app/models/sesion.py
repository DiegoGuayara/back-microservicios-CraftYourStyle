# ==================== IMPORTS ====================
# SQLAlchemy - Imports para definir columnas y tipos de datos
from sqlalchemy import Column, Integer, String, DateTime, Enum
# relationship - Para definir relaciones entre tablas (sesiones tienen mensajes)
from sqlalchemy.orm import relationship
# datetime - Para manejar fechas y horas
from datetime import datetime
# Base - Clase padre de todos los modelos
from app.config.database import Base
# enum - Para crear enumeraciones (valores fijos)
import enum


# ==================== ENUM DE ESTADOS ====================
class EstadoSesion(str, enum.Enum):
    """
    Enum que define los posibles estados de una sesión de chat
    
    Hereda de str para que los valores sean strings en la BD
    Hereda de enum.Enum para tener validación de tipo
    
    Estados:
    - ACTIVA: La sesión está en curso, el usuario está chateando
    - FINALIZADA: La sesión terminó, el usuario cerró el chat
    """
    ACTIVA = "activa"  # Sesión en curso
    FINALIZADA = "finalizada"  # Sesión terminada


# ==================== MODELO DE SESIÓN ====================
class SesionIA(Base):
    """
    Modelo que representa una sesión de conversación con el agente de IA
    
    Una sesión agrupa todos los mensajes de una conversación.
    Cada usuario puede tener múltiples sesiones (diferentes conversaciones).
    
    Tabla MySQL: sesiones_ia
    
    Relaciones:
    - Una sesión tiene muchos mensajes (one-to-many)
    
    Uso:
        # Crear nueva sesión
        sesion = SesionIA(id_user=1)
        db.add(sesion)
        db.commit()
        
        # Buscar sesiones activas
        sesiones = db.query(SesionIA).filter(
            SesionIA.estado == EstadoSesion.ACTIVA
        ).all()
    """
    # Nombre de la tabla en MySQL
    __tablename__ = "sesiones_ia"
    
    # ==================== COLUMNAS ====================
    
    # ID único de la sesión (clave primaria, auto-incremental)
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # ID del usuario que inició la sesión
    # nullable=False significa que es obligatorio
    id_user = Column(Integer, nullable=False)
    
    # Fecha y hora en que inició la sesión
    # default=datetime.utcnow se ejecuta automáticamente al crear el registro
    fecha_inicio = Column(DateTime, default=datetime.utcnow)
    
    # Fecha y hora en que terminó la sesión
    # nullable=True significa que puede ser NULL (cuando aún está activa)
    fecha_fin = Column(DateTime, nullable=True)
    
    # Estado actual de la sesión (activa o finalizada)
    # Usa el enum EstadoSesion definido arriba
    # Por defecto es ACTIVA cuando se crea
    estado = Column(Enum(EstadoSesion), default=EstadoSesion.ACTIVA)
    
    # ==================== RELACIONES ====================
    
    # Relación con la tabla mensajes_ia
    # - Una sesión tiene muchos mensajes
    # - back_populates="sesion" conecta con la relación inversa en MensajeIA
    # - cascade="all, delete-orphan" significa:
    #   * Si eliminas una sesión, se eliminan todos sus mensajes
    #   * Si un mensaje queda sin sesión, se elimina automáticamente
    mensajes = relationship(
        "MensajeIA",  # Nombre del modelo relacionado
        back_populates="sesion",  # Nombre del atributo en MensajeIA
        cascade="all, delete-orphan"  # Comportamiento en cascada
    )
