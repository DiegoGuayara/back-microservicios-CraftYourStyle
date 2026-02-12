# ==================== IMPORTS ====================
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config.database import Base
import enum


# ==================== ENUM DE TIPO DE MENSAJE ====================
class TipoMensaje(str, enum.Enum):
    """
    Enum que define quién envió el mensaje
    
    Valores:
    - USUARIO: Mensaje enviado por el usuario humano
    - IA: Mensaje enviado por el agente de inteligencia artificial
    """
    USUARIO = "usuario"  # Mensaje del usuario
    IA = "ia"  # Respuesta del agente IA


# ==================== MODELO DE MENSAJE ====================
class MensajeIA(Base):
    """
    Modelo que representa un mensaje individual en la conversación
    
    Cada mensaje pertenece a una sesión y puede ser del usuario o de la IA.
    Los mensajes se ordenan por timestamp para mantener el orden cronológico.
    
    Tabla MySQL: mensajes_ia
    
    Relaciones:
    - Cada mensaje pertenece a una sesión (many-to-one)
    
    Uso:
        # Guardar mensaje del usuario
        mensaje = MensajeIA(
            sesion_id=1,
            tipo=TipoMensaje.USUARIO,
            contenido="Quiero una camiseta azul",
            metadata={"imagenes": ["https://..."]}
        )
        db.add(mensaje)
        db.commit()
        
        # Obtener historial de mensajes
        mensajes = db.query(MensajeIA).filter(
            MensajeIA.sesion_id == 1
        ).order_by(MensajeIA.timestamp).all()
    """
    # Nombre de la tabla en MySQL
    __tablename__ = "mensajes_ia"
    
    # ==================== COLUMNAS ====================
    
    # ID único del mensaje (clave primaria)
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # ID de la sesión a la que pertenece este mensaje
    # ForeignKey conecta con la tabla sesiones_ia
    # nullable=False: todo mensaje debe pertenecer a una sesión
    sesion_id = Column(Integer, ForeignKey("sesiones_ia.id"), nullable=False)
    
    # Tipo de mensaje: "usuario" o "ia"
    # Usa el enum TipoMensaje para validar valores
    tipo = Column(Enum(TipoMensaje), nullable=False)
    
    # Contenido del mensaje (el texto)
    # Text permite mensajes largos (más que VARCHAR)
    contenido = Column(Text, nullable=False)
    
    # Metadata adicional en formato JSON
    # Puede contener:
    # - URLs de imágenes adjuntas
    # - Información de productos mencionados
    # - Configuraciones de personalización
    # Ejemplo: {"imagenes": ["url1", "url2"], "producto_id": 5}
    metadata = Column(JSON, nullable=True)
    
    # Timestamp: cuándo se envió el mensaje
    # Se guarda automáticamente al crear el mensaje
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # ==================== RELACIONES ====================
    
    # Relación inversa con SesionIA
    # - Un mensaje pertenece a una sesión
    # - back_populates="mensajes" conecta con la relación en SesionIA
    sesion = relationship(
        "SesionIA",
        back_populates="mensajes"
    )
