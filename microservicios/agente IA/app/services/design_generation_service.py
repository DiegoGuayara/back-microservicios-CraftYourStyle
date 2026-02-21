"""
Servicio para generar imágenes de diseños de prendas usando Google Imagen
"""
import base64
import os
import tempfile

import httpx

from app.config.settings import settings


class DesignGenerationService:
    """Servicio para generar imágenes de diseños usando Google Imagen"""

    @staticmethod
    def _get_candidate_models() -> list[str]:
        """Construye lista de modelos candidatos (principal + fallbacks sin duplicados)."""
        models = [settings.IMAGEN_MODEL]
        fallback_raw = settings.IMAGEN_FALLBACK_MODELS or ""
        fallbacks = [m.strip() for m in fallback_raw.split(",") if m.strip()]

        for model in fallbacks:
            if model not in models:
                models.append(model)

        return models

    @staticmethod
    async def _call_imagen_api(
        client: httpx.AsyncClient,
        model: str,
        api_key: str,
        enhanced_prompt: str,
        negative_prompt: str,
        number_of_images: int,
    ) -> dict:
        """Llama a Google Imagen para un modelo específico."""
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:predict",
            headers={"Content-Type": "application/json"},
            params={"key": api_key},
            json={
                "instances": [{"prompt": enhanced_prompt}],
                "parameters": {
                    "sampleCount": number_of_images,
                    "aspectRatio": "1:1",
                    "safetyFilterLevel": "block_some",
                    "personGeneration": "allow_adult",
                },
            },
        )

        if response.status_code != 200:
            raise Exception(
                f"Imagen API error ({response.status_code}) con modelo '{model}': {response.text}"
            )

        return response.json()

    @staticmethod
    async def generate_design_image(
        prompt: str,
        negative_prompt: str = "low quality, blurry, distorted",
        number_of_images: int = 1,
    ) -> str:
        """
        Genera una imagen de un diseño de prenda usando Google Imagen

        Args:
            prompt: Descripción del diseño a generar
            negative_prompt: Cosas a evitar en la imagen
            number_of_images: Número de imágenes a generar

        Returns:
            URL de la imagen generada (Cloudinary después de subirla)
        """
        google_api_key = settings.GEMINI_API_KEY
        if not google_api_key:
            raise ValueError(
                "GEMINI_API_KEY no está configurado. "
                "Por favor añádelo al archivo .env"
            )

        enhanced_prompt = (
            "professional product photography, fashion design, "
            f"{prompt}, "
            "high quality, detailed, clean background, studio lighting, "
            "commercial photography style"
        )

        candidate_models = DesignGenerationService._get_candidate_models()
        last_error = None

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                result = None
                for model in candidate_models:
                    try:
                        result = await DesignGenerationService._call_imagen_api(
                            client=client,
                            model=model,
                            api_key=google_api_key,
                            enhanced_prompt=enhanced_prompt,
                            negative_prompt=negative_prompt,
                            number_of_images=number_of_images,
                        )
                        break
                    except Exception as model_error:
                        last_error = model_error
                        continue

                if not result:
                    raise Exception(
                        "No se pudo generar imagen con ningún modelo disponible. "
                        f"Último error: {str(last_error)}"
                    )

                predictions = result.get("predictions") or []
                if not predictions:
                    raise Exception("No se generó ninguna imagen")

                image_data = predictions[0].get("bytesBase64Encoded")
                if not image_data:
                    raise Exception("No se pudo obtener los datos de la imagen")

                from app.config.storage import upload_image

                with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_file:
                    tmp_file.write(base64.b64decode(image_data))
                    tmp_path = tmp_file.name

                try:
                    upload_result = await upload_image(tmp_path, folder="generated_designs")
                    return upload_result["url"]
                finally:
                    if os.path.exists(tmp_path):
                        os.remove(tmp_path)

        except httpx.TimeoutException:
            raise Exception("Timeout al conectar con Google Imagen API")
        except Exception as e:
            raise Exception(f"Error al generar imagen: {str(e)}")

    @staticmethod
    async def should_generate_image(user_message: str) -> bool:
        """
        Detecta si el usuario quiere ver una imagen generada

        Args:
            user_message: Mensaje del usuario

        Returns:
            True si se debe generar una imagen
        """
        keywords = [
            "muéstrame", "muestrame", "ver", "visualizar", "imagen",
            "como se vería", "como se veria", "quiero ver", "enséñame",
            "enseñame", "genera", "crea imagen", "mostrar",
        ]
        message_lower = user_message.lower()
        return any(keyword in message_lower for keyword in keywords)

