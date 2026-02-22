"""
Servicio para generar imágenes de diseños de prendas usando Replicate API
"""
import httpx
import asyncio
from app.config.settings import settings


class DesignGenerationService:
    """Servicio para generar imágenes de diseños usando Replicate (Stable Diffusion XL)"""
    
    @staticmethod
    async def generate_design_image(
        prompt: str,
        negative_prompt: str = "low quality, blurry, distorted, deformed",
        width: int = 1024,
        height: int = 1024
    ) -> str:
        """
        Genera una imagen de un diseño de prenda usando Replicate (SDXL)
        
        Args:
            prompt: Descripción del diseño a generar
            negative_prompt: Cosas a evitar en la imagen
            width: Ancho de la imagen
            height: Alto de la imagen
            
        Returns:
            URL de la imagen generada
        """
        # Verificar si hay API token configurado
        replicate_token = settings.REPLICATE_API_TOKEN
        
        if not replicate_token:
            raise ValueError(
                "REPLICATE_API_TOKEN no está configurado. "
                "Por favor añádelo al archivo .env desde https://replicate.com/account/api-tokens"
            )
        
        try:
            # Mejorar el prompt para diseños de moda
            enhanced_prompt = (
                f"professional product photography, fashion design, "
                f"{prompt}, "
                f"high quality, detailed, clean white background, studio lighting, "
                f"commercial photography style, centered composition, 8k"
            )
            
            # Usar Stable Diffusion XL en Replicate
            async with httpx.AsyncClient(timeout=120.0) as client:
                # Crear la predicción
                response = await client.post(
                    "https://api.replicate.com/v1/predictions",
                    headers={
                        "Authorization": f"Token {replicate_token}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "version": "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",  # SDXL
                        "input": {
                            "prompt": enhanced_prompt,
                            "negative_prompt": negative_prompt,
                            "width": width,
                            "height": height,
                            "num_outputs": 1,
                            "guidance_scale": 7.5,
                            "num_inference_steps": 50,
                            "scheduler": "K_EULER"
                        }
                    }
                )
                
                if response.status_code != 201:
                    raise Exception(f"Error al crear predicción en Replicate: {response.text}")
                
                prediction = response.json()
                prediction_id = prediction["id"]
                
                # Esperar a que se complete la generación (polling)
                for _ in range(60):  # Máximo 2 minutos
                    await asyncio.sleep(2)
                    
                    status_response = await client.get(
                        f"https://api.replicate.com/v1/predictions/{prediction_id}",
                        headers={"Authorization": f"Token {replicate_token}"}
                    )
                    
                    if status_response.status_code != 200:
                        raise Exception(f"Error al verificar estado: {status_response.text}")
                    
                    result = status_response.json()
                    
                    if result["status"] == "succeeded":
                        # Retornar la URL de la primera imagen
                        output = result.get("output", [])
                        if isinstance(output, list) and len(output) > 0:
                            return output[0]
                        elif isinstance(output, str):
                            return output
                        else:
                            raise Exception("No se pudo obtener la URL de la imagen")
                    
                    elif result["status"] == "failed":
                        error = result.get("error", "Unknown error")
                        raise Exception(f"La generación falló: {error}")
                
                raise Exception("Timeout: La generación tardó demasiado (más de 2 minutos)")
                
        except httpx.TimeoutException:
            raise Exception("Timeout al conectar con Replicate API")
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
            "enseñame", "genera", "crea imagen", "mostrar", "crea", "diseña"
        ]
        message_lower = user_message.lower()
        return any(keyword in message_lower for keyword in keywords)
