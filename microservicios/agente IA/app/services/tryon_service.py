import asyncio
from typing import Any, Optional

import httpx
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.config.storage import upload_remote_image
from app.models import FotoUsuario, Personalizacion, PruebaVirtual, TipoUsoAgente
from app.services.usage_limit_service import UsageLimitService


class TryOnService:
    """Servicio para Virtual Try-On usando Replicate."""

    VALID_CATEGORIES = {"upper_body", "lower_body", "dresses"}

    @staticmethod
    async def generate_tryon(
        db: Session,
        id_user: int,
        foto_usuario_id: int,
        personalizacion_id: Optional[int] = None,
        variant_id: Optional[int] = None,
        garment_image_url: Optional[str] = None,
        garment_description: Optional[str] = None,
        garment_category: Optional[str] = None,
    ) -> PruebaVirtual:
        """
        Genera un virtual try-on usando Replicate.

        Args:
            db: Sesion de base de datos
            id_user: ID del usuario
            foto_usuario_id: ID de la foto del usuario
            personalizacion_id: ID de la personalizacion
            variant_id: ID de la variante del producto

        Returns:
            PruebaVirtual con la imagen generada
        """
        UsageLimitService.ensure_usage_available(db, id_user)

        foto_usuario = (
            db.query(FotoUsuario)
            .filter(
                FotoUsuario.id == foto_usuario_id,
                FotoUsuario.id_user == id_user,
            )
            .first()
        )

        if not foto_usuario:
            raise ValueError("Foto de usuario no encontrada")

        resolved_garment_image_url = (garment_image_url or "").strip() or None
        resolved_garment_description = (garment_description or "").strip() or None

        if personalizacion_id:
            personalizacion = (
                db.query(Personalizacion)
                .filter(Personalizacion.id == personalizacion_id)
                .first()
            )
            if personalizacion:
                resolved_garment_image_url = (
                    resolved_garment_image_url
                    or (personalizacion.image_url or "").strip()
                    or None
                )
                resolved_garment_description = (
                    resolved_garment_description
                    or f"Personalizacion {personalizacion.id}"
                )

        if not resolved_garment_image_url:
            raise ValueError(
                "No se encontro una imagen valida de la prenda para generar el try-on."
            )

        result_url = await TryOnService._call_replicate_tryon(
            person_image=foto_usuario.foto_url,
            garment_image=resolved_garment_image_url,
            garment_description=resolved_garment_description,
            garment_category=garment_category,
        )

        prueba = PruebaVirtual(
            id_user=id_user,
            foto_usuario_id=foto_usuario_id,
            personalizacion_id=personalizacion_id,
            variant_id=variant_id,
            imagen_resultado_url=result_url,
        )
        db.add(prueba)
        db.commit()
        db.refresh(prueba)

        usage_status = UsageLimitService.register_usage(db, id_user, TipoUsoAgente.TRYON)
        prueba.limite_24h = usage_status["limit"]
        prueba.usos_restantes = usage_status["remaining"]
        prueba.reset_at = usage_status["reset_at"]

        return prueba

    @staticmethod
    def _normalize_category(category: Optional[str]) -> str:
        normalized = (category or "").strip().lower()
        if normalized in TryOnService.VALID_CATEGORIES:
            return normalized
        return settings.REPLICATE_TRYON_DEFAULT_CATEGORY

    @staticmethod
    def _normalize_description(description: Optional[str], category: str) -> str:
        normalized = (description or "").strip()
        if normalized:
            return normalized

        fallback_by_category = {
            "upper_body": "Upper-body garment",
            "lower_body": "Lower-body garment",
            "dresses": "Dress",
        }
        return fallback_by_category.get(category, "Garment")

    @staticmethod
    def _extract_generated_url(output: Any) -> Optional[str]:
        if isinstance(output, str) and output.strip():
            return output.strip()

        if isinstance(output, list):
            for item in output:
                extracted = TryOnService._extract_generated_url(item)
                if extracted:
                    return extracted

        if isinstance(output, dict):
            for key in ("url", "uri", "image", "image_url", "output"):
                value = output.get(key)
                extracted = TryOnService._extract_generated_url(value)
                if extracted:
                    return extracted

        return None

    @staticmethod
    async def _call_replicate_tryon(
        person_image: str,
        garment_image: str,
        garment_description: Optional[str] = None,
        garment_category: Optional[str] = None,
    ) -> str:
        """
        Llama a Replicate para generar el try-on.

        Referencia de inputs del modelo:
        - human_img
        - garm_img
        - garment_des
        - category
        - crop
        """
        replicate_token = settings.REPLICATE_API_TOKEN
        if not replicate_token:
            raise RuntimeError(
                "El servicio de virtual try-on no esta configurado en este entorno "
                "porque falta REPLICATE_API_TOKEN."
            )

        version = (settings.REPLICATE_TRYON_VERSION or "").strip()
        if not version:
            raise RuntimeError(
                "El servicio de virtual try-on no esta configurado porque falta "
                "REPLICATE_TRYON_VERSION."
            )

        category = TryOnService._normalize_category(garment_category)
        description = TryOnService._normalize_description(garment_description, category)

        payload: dict[str, Any] = {
            "version": version.split(":", 1)[1] if ":" in version else version,
            "input": {
                "human_img": person_image,
                "garm_img": garment_image,
                "garment_des": description,
                "category": category,
                "crop": False,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=180.0) as client:
                response = await client.post(
                    "https://api.replicate.com/v1/predictions",
                    headers={
                        "Authorization": f"Token {replicate_token}",
                        "Content-Type": "application/json",
                        "Prefer": "wait=60",
                    },
                    json=payload,
                )

                if response.status_code not in (200, 201):
                    raise RuntimeError(
                        f"Replicate no acepto la solicitud de try-on: {response.text}"
                    )

                prediction = response.json()
                prediction_id = prediction.get("id")
                result = prediction

                if result.get("status") not in {"succeeded", "failed", "canceled"}:
                    if not prediction_id:
                        raise RuntimeError(
                            "Replicate no devolvio un id de prediccion valido para el try-on."
                        )

                    for _ in range(90):
                        await asyncio.sleep(2)
                        status_response = await client.get(
                            f"https://api.replicate.com/v1/predictions/{prediction_id}",
                            headers={"Authorization": f"Token {replicate_token}"},
                        )

                        if status_response.status_code != 200:
                            raise RuntimeError(
                                "No se pudo consultar el estado del try-on en Replicate: "
                                f"{status_response.text}"
                            )

                        result = status_response.json()
                        if result.get("status") in {"succeeded", "failed", "canceled"}:
                            break

                status = result.get("status")
                if status == "failed":
                    error = result.get("error") or "Fallo desconocido"
                    raise RuntimeError(f"Replicate no pudo generar el try-on: {error}")

                if status == "canceled":
                    raise RuntimeError("Replicate cancelo la generacion del try-on.")

                if status != "succeeded":
                    raise RuntimeError(
                        "El try-on tardó demasiado y Replicate no devolvio un resultado a tiempo."
                    )

                generated_url = TryOnService._extract_generated_url(result.get("output"))
                if not generated_url:
                    raise RuntimeError(
                        "Replicate no devolvio una URL valida para el resultado del try-on."
                    )

                uploaded_result = await upload_remote_image(
                    generated_url,
                    folder="generated/tryon"
                )
                stable_url = uploaded_result.get("url")
                if not stable_url:
                    raise RuntimeError("No se pudo estabilizar la imagen de try-on generada.")

                return stable_url

        except httpx.TimeoutException as exc:
            raise RuntimeError("Timeout al conectar con Replicate para generar el try-on.") from exc

    @staticmethod
    async def get_user_tryons(db: Session, id_user: int):
        """Obtiene todas las pruebas virtuales de un usuario."""
        return (
            db.query(PruebaVirtual)
            .filter(PruebaVirtual.id_user == id_user)
            .order_by(PruebaVirtual.fecha_generacion.desc())
            .all()
        )

    @staticmethod
    async def toggle_favorite(
        db: Session, prueba_id: int, id_user: int, favorito: bool
    ) -> bool:
        """Marca/desmarca una prueba como favorita."""
        prueba = (
            db.query(PruebaVirtual)
            .filter(
                PruebaVirtual.id == prueba_id,
                PruebaVirtual.id_user == id_user,
            )
            .first()
        )

        if prueba:
            prueba.favorito = favorito
            db.commit()
            return True
        return False
