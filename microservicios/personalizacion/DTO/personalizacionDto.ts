/**
 * DTO (Data Transfer Object) de Personalización
 * 
 * Define la estructura de datos para personalizaciones de productos.
 * Los usuarios pueden personalizar productos con colores, imágenes, textos y fuentes.
 * 
 * @property id - Identificador único (opcional, generado por la BD)
 * @property color - Código hexadecimal del color (ej: "#FF5733")
 * @property image_url - URL de la imagen personalizada
 * @property textos - Texto que se agregará al producto
 * @property tipo_letra - Fuente tipográfica (ej: "Arial", "Times New Roman", "Verdana")
 * @property variant_id - ID de la variante de producto a personalizar (puede ser null)
 */
export interface PersonalizacionDto {
  id?: number;
  color: string;
  image_url: string;
  textos: string;
  tipo_letra: string;
  variant_id: number;
}
