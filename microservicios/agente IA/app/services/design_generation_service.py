"""
Servicio para generar imagenes de disenos de prendas usando Replicate API.
"""
import asyncio
from typing import Any

import httpx

from app.config.settings import settings
from app.config.storage import upload_remote_image


class DesignGenerationService:
    """Servicio para generar imagenes de disenos usando Nano Banana en Replicate."""

    DEFAULT_NEGATIVE_PROMPT = (
        "low quality, blurry, distorted, deformed, "
        "person, model, mannequin, body, face, arms, hands, "
        "text, logo, watermark, collage, grid, multiple garments, multiple shirts"
    )

    @staticmethod
    def apply_plain_constraints(prompt: str, user_request: str | None) -> str:
        if not user_request:
            return prompt

        message_lower = user_request.lower()
        plain_markers = [
            "liso", "sin estampado", "sin diseno", "sin diseño", "sin patrones", "sin patron",
            "sin rayas", "plain", "solid", "no pattern", "no stripes", "minimalista"
        ]

        if any(marker in message_lower for marker in plain_markers):
            prompt_lower = prompt.lower()
            if "no pattern" not in prompt_lower and "solid color" not in prompt_lower:
                return f"{prompt}, solid color, no pattern, no stripes, no print"

        return prompt

    @staticmethod
    def build_negative_prompt(user_request: str | None) -> str:
        negative_parts = [DesignGenerationService.DEFAULT_NEGATIVE_PROMPT]
        if not user_request:
            return ", ".join(negative_parts)

        message_lower = user_request.lower()
        plain_markers = [
            "liso", "sin estampado", "sin diseno", "sin diseño", "sin patrones", "sin patron",
            "sin rayas", "plain", "solid", "no pattern", "no stripes", "minimalista"
        ]

        if any(marker in message_lower for marker in plain_markers):
            negative_parts.append("pattern, stripes, striped, print, texture, graphic, logo, text")

        return ", ".join(negative_parts)

    @staticmethod
    def _resolve_model_parts() -> tuple[str, str]:
        model = (settings.REPLICATE_IMAGE_MODEL or "google/nano-banana-pro").strip()
        parts = [part for part in model.split("/") if part]
        if len(parts) != 2:
            raise ValueError(
                "REPLICATE_IMAGE_MODEL debe tener el formato 'owner/model', por ejemplo "
                "'google/nano-banana-pro'"
            )
        return parts[0], parts[1]

    @staticmethod
    def _resolve_aspect_ratio(width: int, height: int) -> str:
        ratio_map = {
            (1024, 1024): "1:1",
            (1152, 864): "4:3",
            (864, 1152): "3:4",
            (1280, 720): "16:9",
            (720, 1280): "9:16",
        }
        return ratio_map.get((width, height), "1:1")

    @staticmethod
    def _build_creativity_instruction(creativity: float | None, image_input: str | None) -> str:
        if creativity is None:
            creativity = 0.7

        normalized = creativity
        if normalized > 1:
            normalized = normalized / 100

        if image_input:
            if normalized <= 0.35:
                return "Preserve the reference image closely and make only subtle design adjustments."
            if normalized >= 0.8:
                return "Use the reference image as inspiration, but explore bolder creative variations."
            return "Keep the main silhouette from the reference image while applying the requested design changes."

        if normalized <= 0.35:
            return "Keep the result clean, literal, and very close to the requested garment."
        if normalized >= 0.8:
            return "Push the design into a more original and visually distinctive direction."
        return "Balance creativity with commercial realism."

    @staticmethod
    def _build_prompt(
        prompt: str,
        negative_prompt: str | None,
        creativity: float | None,
        image_input: str | None
    ) -> str:
        creativity_instruction = DesignGenerationService._build_creativity_instruction(
            creativity, image_input
        )
        prompt_parts = [
            "Professional fashion product photography.",
            "Single garment only.",
            "No person, no model, no mannequin.",
            "Clean studio setup with centered composition.",
            "White or very clean neutral background.",
            "Commercial catalog quality.",
            prompt.strip(),
            creativity_instruction,
        ]

        if negative_prompt:
            prompt_parts.append(f"Avoid: {negative_prompt}.")

        return " ".join(part for part in prompt_parts if part)

    @staticmethod
    def _extract_generated_url(output: Any) -> str | None:
        if isinstance(output, str) and output.strip():
            return output.strip()

        if isinstance(output, list):
            for item in output:
                extracted = DesignGenerationService._extract_generated_url(item)
                if extracted:
                    return extracted

        if isinstance(output, dict):
            for key in ("url", "uri", "image", "image_url", "output"):
                value = output.get(key)
                extracted = DesignGenerationService._extract_generated_url(value)
                if extracted:
                    return extracted

        return None

    @staticmethod
    async def generate_design_image(
        prompt: str,
        negative_prompt: str | None = None,
        width: int = 1024,
        height: int = 1024,
        image_input: str | None = None,
        creativity: float | None = None
    ) -> str:
        """
        Genera una imagen de un diseno de prenda usando Nano Banana en Replicate.

        Args:
            prompt: Descripcion del diseno a generar
            negative_prompt: Cosas a evitar en la imagen
            width: Ancho solicitado
            height: Alto solicitado
            image_input: Imagen base opcional en URL o data URI
            creativity: Nivel de creatividad opcional

        Returns:
            URL de la imagen generada y estabilizada en Cloudinary
        """
        replicate_token = settings.REPLICATE_API_TOKEN

        if not negative_prompt:
            negative_prompt = DesignGenerationService.DEFAULT_NEGATIVE_PROMPT

        if not replicate_token:
            raise ValueError(
                "REPLICATE_API_TOKEN no esta configurado. "
                "Por favor anadelo al archivo .env desde https://replicate.com/account/api-tokens"
            )

        try:
            owner, model_name = DesignGenerationService._resolve_model_parts()
            final_prompt = DesignGenerationService._build_prompt(
                prompt=prompt,
                negative_prompt=negative_prompt,
                creativity=creativity,
                image_input=image_input,
            )
            aspect_ratio = DesignGenerationService._resolve_aspect_ratio(width, height)

            input_payload: dict[str, Any] = {
                "prompt": final_prompt,
                "aspect_ratio": aspect_ratio,
                "output_format": "png",
            }
            if image_input and image_input.strip():
                input_payload["image_input"] = [image_input.strip()]

            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"https://api.replicate.com/v1/models/{owner}/{model_name}/predictions",
                    headers={
                        "Authorization": f"Token {replicate_token}",
                        "Content-Type": "application/json",
                        "Prefer": "wait=60",
                    },
                    json={"input": input_payload},
                )

                if response.status_code not in (200, 201):
                    raise Exception(f"Error al crear prediccion en Replicate: {response.text}")

                prediction = response.json()
                prediction_id = prediction.get("id")
                result = prediction

                if result.get("status") not in {"succeeded", "failed", "canceled"}:
                    if not prediction_id:
                        raise Exception("Replicate no devolvio un id de prediccion valido")

                    for _ in range(60):
                        await asyncio.sleep(2)

                        status_response = await client.get(
                            f"https://api.replicate.com/v1/predictions/{prediction_id}",
                            headers={"Authorization": f"Token {replicate_token}"},
                        )

                        if status_response.status_code != 200:
                            raise Exception(f"Error al verificar estado: {status_response.text}")

                        result = status_response.json()
                        if result.get("status") in {"succeeded", "failed", "canceled"}:
                            break

                if result.get("status") == "failed":
                    error = result.get("error", "Unknown error")
                    raise Exception(f"La generacion fallo: {error}")

                if result.get("status") == "canceled":
                    raise Exception("La generacion fue cancelada por Replicate")

                if result.get("status") != "succeeded":
                    raise Exception("Timeout: La generacion tardo demasiado")

                generated_url = DesignGenerationService._extract_generated_url(result.get("output"))
                if not generated_url:
                    raise Exception("No se pudo obtener la URL de la imagen generada")

                uploaded_result = await upload_remote_image(
                    generated_url,
                    folder="generated/designs"
                )
                if uploaded_result.get("url"):
                    return uploaded_result["url"]

                raise Exception("No se pudo estabilizar la imagen generada")

        except httpx.TimeoutException:
            raise Exception("Timeout al conectar con Replicate API")
        except Exception as e:
            raise Exception(f"Error al generar imagen: {str(e)}")

    @staticmethod
    async def should_generate_image(user_message: str) -> bool:
        """
        Detecta si el usuario quiere ver una imagen generada.

        Args:
            user_message: Mensaje del usuario

        Returns:
            True si se debe generar una imagen
        """
        keywords = [
            "muestrame", "muéstrame", "ver", "visualizar", "imagen",
            "como se veria", "como se vería", "quiero ver", "ensename",
            "enséñame", "genera", "crea imagen", "mostrar", "crea", "disena",
            "diseña", "camisa", "camiseta", "blusa", "pantalon", "pantalones", "ropa"
        ]
        message_lower = user_message.lower()
        return any(keyword in message_lower for keyword in keywords)
