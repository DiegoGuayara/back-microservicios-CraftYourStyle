from sqlalchemy.orm import Session
from app.models import SesionIA, MensajeIA, TipoMensaje, EstadoSesion
from app.agents.orchestrator import orchestrator
from app.services.design_generation_service import DesignGenerationService
from typing import List, Optional, Dict, Any
from datetime import datetime
import re


class AgentService:
    """Servicio para manejar la lógica del agente de IA"""
    IMAGE_URL_PATTERN = re.compile(
        r"https?://[^\s]+(?:cloudinary\.com[^\s]*|(?:\.png|\.jpg|\.jpeg|\.webp|\.gif)(?:\?[^\s]*)?)",
        re.IGNORECASE,
    )


    @staticmethod
    def _detect_garment_type(user_message: str) -> str:
        message = user_message.lower()
        if any(word in message for word in [
            "pantalon", "pantalones", "jean", "jeans", "denim",
            "jogger", "sudadera", "leggings", "short", "shorts",
            "bermuda", "falda", "falta"
        ]):
            return "pantalon"
        if any(word in message for word in [
            "chaqueta", "abrigo", "buzo", "saco", "hoodie",
            "sueter", "sweater", "blazer"
        ]):
            return "chaqueta"
        if any(word in message for word in [
            "camisa", "camiseta", "blusa", "polo", "top"
        ]):
            return "camiseta"
        return "camiseta"

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
    ) -> Dict[str, Any]:
        """
        Procesa un mensaje del usuario y genera respuesta del agente

        Args:
            db: Sesión de base de datos
            sesion_id: ID de la sesión
            user_message: Mensaje del usuario
            imagenes: URLs de imágenes adjuntas

        Returns:
            Dict con respuesta de texto y URLs de imágenes detectadas/generadas
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

        # Detectar si el usuario quiere ver una imagen generada
        should_generate = await DesignGenerationService.should_generate_image(user_message)
        imagenes_generadas: List[str] = []

        try:
            if should_generate:
                # Generar prompt optimizado y la imagen directamente (sin preguntas).
                design_prompt_response = await orchestrator.generate_design_prompt(
                    user_request=user_message,
                    garment_type=AgentService._detect_garment_type(user_message)
                )
                design_prompt = orchestrator._extract_text(design_prompt_response)
                design_prompt = DesignGenerationService.apply_plain_constraints(
                    design_prompt, user_message
                )
                negative_prompt = DesignGenerationService.build_negative_prompt(user_message)

                image_url = await DesignGenerationService.generate_design_image(
                    prompt=design_prompt,
                    negative_prompt=negative_prompt
                )

                respuesta_texto = (
                    "Listo, generé tu diseño. Aquí está la imagen:\n"
                    f"{image_url}"
                )
                imagenes_generadas = [image_url]
            else:
                # Flujo normal sin generación de imagen
                response = await orchestrator.orchestrate(
                    user_message=user_message,
                    context=context,
                    images=imagenes,
                    intent="general"
                )
                respuesta_texto = response.content
                imagenes_generadas = AgentService.IMAGE_URL_PATTERN.findall(respuesta_texto)
        except Exception as e:
            respuesta_texto = f"Lo siento, hubo un error al procesar tu mensaje: {str(e)}"

        # Guardar respuesta del agente
        ia_metadata = {"imagenes_generadas": imagenes_generadas} if imagenes_generadas else None
        await AgentService.save_message(
            db, sesion_id, TipoMensaje.ia, respuesta_texto, ia_metadata
        )

        return {
            "mensaje": respuesta_texto,
            "imagenes_generadas": imagenes_generadas or None
        }

