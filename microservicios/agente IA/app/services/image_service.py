from sqlalchemy.orm import Session
from app.models import Imagen, FotoUsuario, TipoImagen, EstadoImagen
from app.config.storage import upload_image, delete_image
from fastapi import UploadFile
from typing import Optional
import os
import uuid


class ImageService:
    """Servicio para manejo de imágenes"""

    @staticmethod
    def _serialize_image_row(row):
        return {
            "id": row.id,
            "id_user": row.id_user,
            "image_url": row.image_url,
            "variant_id": getattr(row, "variant_id", None),
            "tipo": "usuario_diseño",
            "prompt": getattr(row, "prompt", None),
            "garment_type": getattr(row, "garment_type", None),
            "estado": getattr(row, "estado", None),
            "precio": float(row.precio) if getattr(row, "precio", None) is not None else None,
            "created_at": getattr(row, "created_at", None),
            "updated_at": getattr(row, "updated_at", None),
        }
    
    @staticmethod
    async def save_user_design_image(
        db: Session,
        file: UploadFile,
        id_user: int,
        variant_id: Optional[int] = None
    ) -> Imagen:
        """
        Guarda una imagen de diseño del usuario
        
        Args:
            db: Sesión de base de datos
            file: Archivo subido
            id_user: ID del usuario
            variant_id: ID de la variante de producto
            
        Returns:
            Imagen guardada
        """
        # Guardar temporalmente
        temp_path = f"uploads/{uuid.uuid4()}_{file.filename}"
        os.makedirs("uploads", exist_ok=True)
        
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        try:
            # Subir a Cloudinary
            result = await upload_image(temp_path, folder=f"users/{id_user}/designs")
            
            # Guardar en BD
            imagen = Imagen(
                id_user=id_user,
                image_url=result["url"],
                variant_id=variant_id,
                tipo="usuario_diseño"
            )
            db.add(imagen)
            db.commit()
            db.refresh(imagen)
            
            return imagen
        finally:
            # Eliminar archivo temporal
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    @staticmethod
    async def save_user_photo(
        db: Session,
        file: UploadFile,
        id_user: int,
        es_principal: bool = False
    ) -> FotoUsuario:
        """
        Guarda una foto del usuario para virtual try-on
        
        Args:
            db: Sesión de base de datos
            file: Archivo subido
            id_user: ID del usuario
            es_principal: Si es la foto principal
            
        Returns:
            FotoUsuario guardada
        """
        # Si es principal, quitar la marca de otras fotos
        if es_principal:
            db.query(FotoUsuario).filter(
                FotoUsuario.id_user == id_user
            ).update({"es_principal": False})
        
        # Guardar temporalmente
        temp_path = f"uploads/{uuid.uuid4()}_{file.filename}"
        os.makedirs("uploads", exist_ok=True)
        
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        try:
            # Subir a Cloudinary
            result = await upload_image(temp_path, folder=f"users/{id_user}/photos")
            
            # Guardar en BD
            foto = FotoUsuario(
                id_user=id_user,
                foto_url=result["url"],
                es_principal=es_principal
            )
            db.add(foto)
            db.commit()
            db.refresh(foto)
            
            return foto
        finally:
            # Eliminar archivo temporal
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    @staticmethod
    async def get_user_photos(db: Session, id_user: int):
        """Obtiene todas las fotos de un usuario"""
        return db.query(FotoUsuario).filter(
            FotoUsuario.id_user == id_user
        ).order_by(FotoUsuario.es_principal.desc()).all()
    
    @staticmethod
    async def delete_user_photo(db: Session, foto_id: int, id_user: int) -> bool:
        """Elimina una foto del usuario"""
        foto = db.query(FotoUsuario).filter(
            FotoUsuario.id == foto_id,
            FotoUsuario.id_user == id_user
        ).first()
        
        if foto:
            db.delete(foto)
            db.commit()
            return True
        return False

    @staticmethod
    async def save_generated_image_url(
        db: Session,
        id_user: int,
        image_url: str,
        variant_id: Optional[int] = None,
        tipo: TipoImagen = TipoImagen.USUARIO_DISEÑO,
        prompt: Optional[str] = None,
        garment_type: Optional[str] = None
    ) -> Imagen:
        """Guarda una URL de imagen generada (sin subir archivo)."""
        imagen = Imagen(
            id_user=id_user,
            image_url=image_url,
            variant_id=variant_id,
            tipo=getattr(tipo, "value", tipo) or "usuario_diseño",
            prompt=prompt,
            garment_type=garment_type,
            estado="pendiente"
        )
        db.add(imagen)
        db.commit()
        db.refresh(imagen)
        return imagen

    @staticmethod
    async def get_user_designs(db: Session, id_user: int, estado: Optional[str] = None):
        """Obtiene diseños guardados por usuario."""
        query = db.query(
            Imagen.id,
            Imagen.id_user,
            Imagen.image_url,
            Imagen.variant_id,
            Imagen.prompt,
            Imagen.garment_type,
            Imagen.estado,
            Imagen.precio,
            Imagen.created_at,
            Imagen.updated_at,
        ).filter(Imagen.id_user == id_user)
        if estado:
            query = query.filter(Imagen.estado == estado)
        rows = query.order_by(Imagen.id.desc()).all()
        return [ImageService._serialize_image_row(row) for row in rows]

    @staticmethod
    async def delete_user_design(db: Session, image_id: int, id_user: int) -> bool:
        """Elimina un diseño guardado del usuario."""
        imagen = db.query(Imagen).filter(
            Imagen.id == image_id,
            Imagen.id_user == id_user
        ).first()
        if imagen:
            db.delete(imagen)
            db.commit()
            return True
        return False

    @staticmethod
    async def get_pending_designs(db: Session):
        """Obtiene diseños pendientes de aprobación."""
        rows = db.query(
            Imagen.id,
            Imagen.id_user,
            Imagen.image_url,
            Imagen.prompt,
            Imagen.garment_type,
            Imagen.estado,
            Imagen.precio,
            Imagen.created_at,
        ).filter(
            Imagen.id_user.isnot(None),
            Imagen.estado == "pendiente"
        ).order_by(Imagen.created_at.desc()).all()
        return [ImageService._serialize_image_row(row) for row in rows]

    @staticmethod
    async def approve_design(db: Session, image_id: int, precio: float) -> Optional[Imagen]:
        """Aprueba un diseño y asigna precio."""
        updated = db.query(Imagen).filter(Imagen.id == image_id).update(
            {
                Imagen.estado: "aprobada",
                Imagen.precio: precio,
            },
            synchronize_session=False,
        )
        if not updated:
            return None
        db.commit()
        row = db.query(
            Imagen.id,
            Imagen.id_user,
            Imagen.image_url,
            Imagen.variant_id,
            Imagen.prompt,
            Imagen.garment_type,
            Imagen.estado,
            Imagen.precio,
            Imagen.created_at,
            Imagen.updated_at,
        ).filter(Imagen.id == image_id).first()
        return ImageService._serialize_image_row(row) if row else None

    @staticmethod
    async def reject_design(db: Session, image_id: int) -> Optional[Imagen]:
        """Rechaza un diseño."""
        updated = db.query(Imagen).filter(Imagen.id == image_id).update(
            {
                Imagen.estado: "rechazada",
            },
            synchronize_session=False,
        )
        if not updated:
            return None
        db.commit()
        row = db.query(
            Imagen.id,
            Imagen.id_user,
            Imagen.image_url,
            Imagen.variant_id,
            Imagen.prompt,
            Imagen.garment_type,
            Imagen.estado,
            Imagen.precio,
            Imagen.created_at,
            Imagen.updated_at,
        ).filter(Imagen.id == image_id).first()
        return ImageService._serialize_image_row(row) if row else None
