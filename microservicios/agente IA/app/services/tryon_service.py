from sqlalchemy.orm import Session
from app.models import PruebaVirtual, FotoUsuario, Personalizacion
from typing import Optional
import httpx
from app.config.settings import settings


class TryOnService:
    """Servicio para Virtual Try-On usando Banana"""
    
    @staticmethod
    async def generate_tryon(
        db: Session,
        id_user: int,
        foto_usuario_id: int,
        personalizacion_id: Optional[int] = None,
        variant_id: Optional[int] = None
    ) -> PruebaVirtual:
        """
        Genera un virtual try-on usando Banana
        
        Args:
            db: Sesión de base de datos
            id_user: ID del usuario
            foto_usuario_id: ID de la foto del usuario
            personalizacion_id: ID de la personalización
            variant_id: ID de la variante del producto
            
        Returns:
            PruebaVirtual con la imagen generada
        """
        # Obtener foto del usuario
        foto_usuario = db.query(FotoUsuario).filter(
            FotoUsuario.id == foto_usuario_id
        ).first()
        
        if not foto_usuario:
            raise ValueError("Foto de usuario no encontrada")
        
        # Obtener imagen de la prenda/personalización
        garment_image_url = None
        if personalizacion_id:
            personalizacion = db.query(Personalizacion).filter(
                Personalizacion.id == personalizacion_id
            ).first()
            if personalizacion:
                garment_image_url = personalizacion.image_url
        
        if not garment_image_url:
            # TODO: Obtener imagen del producto base desde catálogo
            garment_image_url = "https://placeholder.com/garment.jpg"
        
        # Llamar a Banana para generar try-on
        try:
            result_url = await TryOnService._call_banana_tryon(
                person_image=foto_usuario.foto_url,
                garment_image=garment_image_url
            )
        except Exception as e:
            raise Exception(f"Error al generar try-on: {str(e)}")
        
        # Guardar resultado en BD
        prueba = PruebaVirtual(
            id_user=id_user,
            foto_usuario_id=foto_usuario_id,
            personalizacion_id=personalizacion_id,
            variant_id=variant_id,
            imagen_resultado_url=result_url
        )
        db.add(prueba)
        db.commit()
        db.refresh(prueba)
        
        return prueba
    
    @staticmethod
    async def _call_banana_tryon(person_image: str, garment_image: str) -> str:
        """
        Llama al API de Banana para generar try-on
        
        Args:
            person_image: URL de la foto de la persona
            garment_image: URL de la imagen de la prenda
            
        Returns:
            URL de la imagen generada
        """
        if not settings.BANANA_API_KEY:
            # Modo de prueba: devolver imagen placeholder
            return f"https://placeholder.com/tryon_result_{person_image[-10:]}.jpg"
        
        # TODO: Implementar llamada real a Banana
        # Ejemplo de uso con IDM-VTON o modelo similar
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.banana.dev/start/v4",
                headers={
                    "Authorization": f"Bearer {settings.BANANA_API_KEY}"
                },
                json={
                    "apiKey": settings.BANANA_API_KEY,
                    "modelKey": "your_model_key_here",  # Configurar según el modelo
                    "modelInputs": {
                        "person_image": person_image,
                        "garment_image": garment_image
                    }
                },
                timeout=60.0
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("modelOutputs", {}).get("image_url", "")
            else:
                raise Exception(f"Error en Banana API: {response.text}")
    
    @staticmethod
    async def get_user_tryons(db: Session, id_user: int):
        """Obtiene todas las pruebas virtuales de un usuario"""
        return db.query(PruebaVirtual).filter(
            PruebaVirtual.id_user == id_user
        ).order_by(PruebaVirtual.fecha_generacion.desc()).all()
    
    @staticmethod
    async def toggle_favorite(db: Session, prueba_id: int, id_user: int, favorito: bool) -> bool:
        """Marca/desmarca una prueba como favorita"""
        prueba = db.query(PruebaVirtual).filter(
            PruebaVirtual.id == prueba_id,
            PruebaVirtual.id_user == id_user
        ).first()
        
        if prueba:
            prueba.favorito = favorito
            db.commit()
            return True
        return False
