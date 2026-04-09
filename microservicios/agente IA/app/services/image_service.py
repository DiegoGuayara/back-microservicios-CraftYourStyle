from sqlalchemy import text
from sqlalchemy.orm import Session
from app.models import Imagen, FotoUsuario, PruebaVirtual, TipoImagen, EstadoImagen
from app.config.storage import upload_image, upload_remote_image, delete_image
from fastapi import UploadFile
from typing import Optional
import os
import uuid
import re


class ImageService:
    """Servicio para manejo de imágenes"""
    SESSION_MARKER_PATTERN = re.compile(r"^\[session:(\d+)\]\s*", re.IGNORECASE)

    @staticmethod
    def _with_session_marker(prompt: Optional[str], session_id: Optional[int]) -> Optional[str]:
        normalized_prompt = (prompt or "").strip()
        if not session_id:
            return normalized_prompt or None
        if normalized_prompt:
            return f"[session:{session_id}] {normalized_prompt}"
        return f"[session:{session_id}]"

    @staticmethod
    def _extract_session_id(prompt: Optional[str]) -> Optional[int]:
        normalized_prompt = (prompt or "").strip()
        if not normalized_prompt:
            return None
        match = ImageService.SESSION_MARKER_PATTERN.match(normalized_prompt)
        if not match:
            return None
        try:
            return int(match.group(1))
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _clean_prompt(prompt: Optional[str]) -> Optional[str]:
        normalized_prompt = (prompt or "").strip()
        if not normalized_prompt:
            return None
        return ImageService.SESSION_MARKER_PATTERN.sub("", normalized_prompt).strip() or None

    @staticmethod
    async def _persist_remote_image_if_needed(image_url: str, folder: str) -> str:
        normalized_url = (image_url or "").strip()
        if not normalized_url:
            raise ValueError("La URL de la imagen es obligatoria")

        is_remote_url = normalized_url.startswith("http://") or normalized_url.startswith("https://")
        already_stable = "res.cloudinary.com" in normalized_url

        if not is_remote_url or already_stable:
            return normalized_url

        uploaded_result = await upload_remote_image(normalized_url, folder=folder)
        stable_url = uploaded_result.get("url")

        if not stable_url:
            raise Exception("No se pudo almacenar la imagen remota en Cloudinary")

        return stable_url

    @staticmethod
    def _serialize_image_row(row):
        return {
            "id": row.id,
            "id_user": row.id_user,
            "image_url": row.image_url,
            "session_id": ImageService._extract_session_id(getattr(row, "prompt", None)),
            "variant_id": getattr(row, "variant_id", None),
            "tipo": "usuario_diseño",
            "prompt": ImageService._clean_prompt(getattr(row, "prompt", None)),
            "garment_type": getattr(row, "garment_type", None),
            "estado": getattr(row, "estado", None),
            "precio": float(row.precio) if getattr(row, "precio", None) is not None else None,
            "created_at": getattr(row, "created_at", None),
            "updated_at": getattr(row, "updated_at", None),
        }

    @staticmethod
    async def upload_reference_image(
        file: UploadFile,
        id_user: int,
    ) -> str:
        """
        Sube una imagen de referencia temporal para el agente sin guardarla en BD.
        """
        temp_path = f"uploads/{uuid.uuid4()}_{file.filename}"
        os.makedirs("uploads", exist_ok=True)

        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)

        try:
            result = await upload_image(temp_path, folder=f"users/{id_user}/references")
            if not result.get("url"):
                raise Exception("No se pudo subir la referencia a Cloudinary")
            return result["url"]
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
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
                tipo=TipoImagen.USUARIO_DISEÑO
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
            db.execute(
                text(
                    """
                    DELETE FROM pruebas_virtuales
                    WHERE foto_usuario_id = :foto_id AND id_user = :id_user
                    """
                ),
                {"foto_id": foto.id, "id_user": id_user},
            )

            db.execute(
                text(
                    """
                    DELETE FROM fotos_usuario
                    WHERE id = :foto_id AND id_user = :id_user
                    """
                ),
                {"foto_id": foto.id, "id_user": id_user},
            )

            if foto.es_principal:
                siguiente_foto = db.execute(
                    text(
                        """
                        SELECT id
                        FROM fotos_usuario
                        WHERE id_user = :id_user
                        ORDER BY fecha_subida DESC
                        LIMIT 1
                        """
                    ),
                    {"id_user": id_user},
                ).fetchone()

                if siguiente_foto:
                    db.execute(
                        text(
                            """
                            UPDATE fotos_usuario
                            SET es_principal = TRUE
                            WHERE id = :foto_id
                            """
                        ),
                        {"foto_id": siguiente_foto.id},
                    )

            db.commit()
            return True
        return False

    @staticmethod
    async def save_generated_image_url(
        db: Session,
        id_user: int,
        image_url: str,
        session_id: Optional[int] = None,
        variant_id: Optional[int] = None,
        tipo: TipoImagen = TipoImagen.USUARIO_DISEÑO,
        prompt: Optional[str] = None,
        garment_type: Optional[str] = None
    ) -> Imagen:
        """Guarda una URL de imagen generada (sin subir archivo)."""
        stable_image_url = await ImageService._persist_remote_image_if_needed(
            image_url,
            folder=f"users/{id_user}/generated"
        )

        imagen = Imagen(
            id_user=id_user,
            image_url=stable_image_url,
            variant_id=variant_id,
            tipo=getattr(tipo, "value", tipo) or "usuario_diseño",
            prompt=ImageService._with_session_marker(prompt, session_id),
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
