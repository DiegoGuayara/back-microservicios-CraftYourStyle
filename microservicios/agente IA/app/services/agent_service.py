from sqlalchemy.orm import Session
from app.models import SesionIA, MensajeIA, TipoMensaje, EstadoSesion
from app.agents import fashion_agent, analyze_user_image
from typing import List, Optional, Dict
from datetime import datetime
import json


class AgentService:
    """Servicio para manejar la lógica del agente de IA"""
    
    @staticmethod
    async def create_session(db: Session, id_user: int) -> SesionIA:
        """Crea una nueva sesión de chat"""
        sesion = SesionIA(id_user=id_user)
        db.add(sesion)
        db.commit()
        db.refresh(sesion)
        return sesion
    
    @staticmethod
    async def get_session(db: Session, sesion_id: int) -> Optional[SesionIA]:
        """Obtiene una sesión por ID"""
        return db.query(SesionIA).filter(SesionIA.id == sesion_id).first()
    
    @staticmethod
    async def get_active_session(db: Session, id_user: int) -> Optional[SesionIA]:
        """Obtiene la sesión activa del usuario"""
        return db.query(SesionIA).filter(
            SesionIA.id_user == id_user,
            SesionIA.estado == EstadoSesion.activa
        ).first()
    
    @staticmethod
    async def close_session(db: Session, sesion_id: int) -> bool:
        """Cierra una sesión"""
        sesion = db.query(SesionIA).filter(SesionIA.id == sesion_id).first()
        if sesion:
            sesion.estado = EstadoSesion.finalizada
            sesion.fecha_fin = datetime.utcnow()
            db.commit()
            return True
        return False
    
    @staticmethod
    async def get_conversation_history(db: Session, sesion_id: int, limit: int = 10) -> List[MensajeIA]:
        """Obtiene el historial de conversación"""
        return db.query(MensajeIA).filter(
            MensajeIA.sesion_id == sesion_id
        ).order_by(MensajeIA.timestamp.desc()).limit(limit).all()
    
    @staticmethod
    async def save_message(
        db: Session,
        sesion_id: int,
        tipo: TipoMensaje,
        contenido: str,
        metadata: Optional[Dict] = None
    ) -> MensajeIA:
        """Guarda un mensaje en la base de datos"""
        mensaje = MensajeIA(
            sesion_id=sesion_id,
            tipo=tipo,
            contenido=contenido,
            metadata=metadata
        )
        db.add(mensaje)
        db.commit()
        db.refresh(mensaje)
        return mensaje
    
    @staticmethod
    async def process_user_message(
        db: Session,
        sesion_id: int,
        user_message: str,
        imagenes: Optional[List[str]] = None
    ) -> str:
        """
        Procesa un mensaje del usuario y genera respuesta del agente
        
        Args:
            db: Sesión de base de datos
            sesion_id: ID de la sesión
            user_message: Mensaje del usuario
            imagenes: URLs de imágenes adjuntas
            
        Returns:
            Respuesta del agente
        """
        # Guardar mensaje del usuario
        metadata = {"imagenes": imagenes} if imagenes else None
        await AgentService.save_message(
            db, sesion_id, TipoMensaje.usuario, user_message, metadata
        )
        
        # Obtener historial para contexto
        historial = await AgentService.get_conversation_history(db, sesion_id, limit=5)
        historial.reverse()  # Ordenar cronológicamente
        
        # Construir contexto
        context = "\n".join([
            f"{'Usuario' if msg.tipo == TipoMensaje.usuario else 'Asistente'}: {msg.contenido}"
            for msg in historial[:-1]  # Excluir el mensaje actual
        ]) if len(historial) > 1 else "Primera interacción"
        
        # Analizar imágenes si las hay
        if imagenes:
            image_analyses = []
            for img_url in imagenes:
                try:
                    analysis = await analyze_user_image(img_url)
                    image_analyses.append(analysis.content)
                except Exception as e:
                    image_analyses.append(f"No se pudo analizar la imagen: {str(e)}")
            
            context += "\n\nImágenes adjuntas:\n" + "\n".join(image_analyses)
        
        # Llamar al agente
        try:
            response = await fashion_agent(user_message, context)
            respuesta_texto = response.content
        except Exception as e:
            respuesta_texto = f"Lo siento, hubo un error al procesar tu mensaje: {str(e)}"
        
        # Guardar respuesta del agente
        await AgentService.save_message(
            db, sesion_id, TipoMensaje.ia, respuesta_texto
        )
        
        return respuesta_texto
