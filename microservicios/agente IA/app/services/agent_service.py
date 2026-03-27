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
    def _is_out_of_scope_request(user_message: str) -> bool:
        message = user_message.lower()
        forbidden_keywords = [
            "outfit completo",
            "outfit",
            "combina",
            "conjunto",
            "prenda nueva",
            "crea una prenda",
            "generar prenda",
            "diseña una camiseta desde cero",
            "desde cero",
            "nuevo modelo",
            "nueva sudadera",
            "nueva camisa",
            "nueva camiseta",
            "try on",
            "try-on",
            "probarme",
            "subir una foto",
            "foto mia",
            "foto mía",
        ]
        return any(keyword in message for keyword in forbidden_keywords)

    @staticmethod
    def _is_generation_request(user_message: str) -> bool:
        message = user_message.lower()
        generation_keywords = [
            "generala",
            "genérala",
            "generalo",
            "genéralo",
            "generar",
            "genera",
            "muestrame",
            "muéstrame",
            "muestrala",
            "muéstrala",
            "mostrar",
            "muestralo",
            "muéstralo",
            "como se veria",
            "cómo se vería",
            "como quedaria",
            "cómo quedaría",
            "hazla",
            "házla",
            "hazlo",
            "renderiza",
            "visualizala",
            "visualízala",
            "visualizar",
            "aplicalo",
            "aplícalo",
            "aplicala",
            "aplícalo",
        ]
        return any(keyword in message for keyword in generation_keywords)

    @staticmethod
    def _build_product_context(
        product_id: int,
        product_name: Optional[str],
        user_message: str,
        history_context: str,
    ) -> str:
        garment_type = AgentService._detect_garment_type(product_name or user_message)
        normalized_name = product_name or f"prenda #{product_id}"
        return (
            "Flujo cerrado de personalizacion de catalogo.\n"
            f"Producto seleccionado: {normalized_name}.\n"
            f"ID del producto: {product_id}.\n"
            f"Tipo de prenda detectado: {garment_type}.\n"
            "Acciones permitidas: cambiar color base, agregar logos, ubicar logos, ajustar tamano del logo, "
            "agregar patrones simples y geometricos como lineas, rayas, circulos, cuadrados o bloques de color "
            "sobre la prenda actual.\n"
            "Acciones NO permitidas: generar prendas nuevas, crear outfits completos, hacer try-on, pedir otra prenda distinta, editar fuera de la prenda actual.\n"
            f"Historial reciente:\n{history_context}"
        )

    @staticmethod
    def _build_generation_brief(
        product_id: int,
        product_name: Optional[str],
        user_message: str,
        history_context: str,
    ) -> str:
        garment_type = AgentService._detect_garment_type(product_name or user_message)
        normalized_name = product_name or f"prenda #{product_id}"
        return (
            f"Personaliza la prenda real del catalogo '{normalized_name}' (ID {product_id}). "
            f"Tipo de prenda: {garment_type}. "
            "Debes conservar la misma silueta, el mismo encuadre de foto de producto y el mismo fondo limpio. "
            "Solo modifica la superficie de la prenda actual. "
            "Se permiten cambios de color base, logos, escudos, texto corto y patrones geometricos simples "
            "como lineas, circulos, cuadrados, franjas o bloques. "
            "No cambies la prenda por otra distinta, no agregues modelos, personas ni accesorios. "
            "Si el usuario no pidio un estampado, manten la prenda limpia. "
            f"Conversacion previa:\n{history_context}\n"
            f"Ultimo mensaje del usuario: {user_message}"
        )

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
        imagenes: Optional[List[str]] = None,
        product_id: Optional[int] = None,
        product_name: Optional[str] = None,
        product_description: Optional[str] = None,
        product_image_url: Optional[str] = None,
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
        if not product_id:
            raise ValueError(
                "Debes seleccionar una prenda del catálogo antes de usar el agente."
            )

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

        imagenes_generadas: List[str] = []

        try:
            if AgentService._is_out_of_scope_request(user_message):
                respuesta_texto = (
                    "En esta fase solo puedo ayudarte con la prenda del catálogo que seleccionaste. "
                    "Ahora mismo personalizo esa misma prenda con cambios de color, logos y patrones simples. "
                    "Todavía no puedo crear prendas nuevas, armar outfits completos ni hacer try-on desde el chat."
                )
            elif AgentService._is_generation_request(user_message):
                if not product_image_url:
                    respuesta_texto = (
                        "Puedo generar la personalizacion, pero necesito la imagen base de la prenda seleccionada. "
                        "Vuelve a abrir la personalizacion desde el catalogo e intenta de nuevo."
                    )
                else:
                    garment_type = AgentService._detect_garment_type(
                        " ".join(filter(None, [product_name, product_description, user_message]))
                    )
                    design_prompt_response = await orchestrator.generate_design_prompt(
                        user_request=AgentService._build_generation_brief(
                            product_id=product_id,
                            product_name=product_name,
                            user_message=user_message,
                            history_context=context,
                        ),
                        garment_type=garment_type,
                    )
                    design_prompt = orchestrator._extract_text(design_prompt_response)
                    negative_prompt = (
                        DesignGenerationService.build_negative_prompt(context)
                        + ", different garment, extra garments, hoodie, jacket, pants, dress, skirt, "
                        "person, model, mannequin, change of camera angle, change of background, text overlay"
                    )
                    generated_image_url = await DesignGenerationService.generate_design_image(
                        prompt=design_prompt,
                        negative_prompt=negative_prompt,
                        image_input=product_image_url,
                        creativity=0.35,
                    )
                    imagenes_generadas = [generated_image_url]
                    respuesta_texto = (
                        "Listo, ya apliqué la personalización sobre la prenda seleccionada. "
                        "Si quieres, ahora puedo hacer ajustes finos de color, tamaño, posición o patrón."
                    )
            else:
                response = await orchestrator.orchestrate(
                    user_message=user_message,
                    context=AgentService._build_product_context(
                        product_id=product_id,
                        product_name=product_name,
                        user_message=user_message,
                        history_context=context,
                    ),
                    images=imagenes,
                    intent="catalog_customization"
                )
                respuesta_texto = response.content
                imagenes_generadas = [
                    match[0] if isinstance(match, tuple) else match
                    for match in AgentService.IMAGE_URL_PATTERN.findall(respuesta_texto)
                ]
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

