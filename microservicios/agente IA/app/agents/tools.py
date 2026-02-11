"""
Herramientas que el agente puede usar
"""
from typing import Dict, List, Optional


def get_product_info(product_id: int) -> Dict:
    """
    Obtiene información de un producto del catálogo
    
    Args:
        product_id: ID del producto
        
    Returns:
        Información del producto
    """
    # TODO: Implementar consulta al microservicio de catálogo
    return {
        "id": product_id,
        "name": "Camiseta Básica",
        "description": "Camiseta de algodón 100%",
        "category": "Camisetas"
    }


def get_user_customizations(user_id: int) -> List[Dict]:
    """
    Obtiene las personalizaciones previas del usuario
    
    Args:
        user_id: ID del usuario
        
    Returns:
        Lista de personalizaciones
    """
    # TODO: Implementar consulta a la base de datos
    return []


def get_color_recommendations(base_color: str) -> List[str]:
    """
    Recomienda colores que combinan bien
    
    Args:
        base_color: Color base en hexadecimal
        
    Returns:
        Lista de colores recomendados
    """
    # Paletas complementarias básicas
    color_palettes = {
        "#000000": ["#FFFFFF", "#FF0000", "#FFD700"],  # Negro
        "#FFFFFF": ["#000000", "#0000FF", "#FF1493"],  # Blanco
        "#FF0000": ["#FFFFFF", "#000000", "#FFD700"],  # Rojo
        "#0000FF": ["#FFFFFF", "#FFD700", "#00FF00"],  # Azul
    }
    
    return color_palettes.get(base_color.upper(), ["#FFFFFF", "#000000"])


def validate_design_position(garment_type: str, position: str) -> bool:
    """
    Valida si una posición es válida para un tipo de prenda
    
    Args:
        garment_type: Tipo de prenda
        position: Posición deseada (pecho, espalda, manga, etc.)
        
    Returns:
        True si es válida
    """
    valid_positions = {
        "camiseta": ["pecho", "espalda", "manga", "completo"],
        "sudadera": ["pecho", "espalda", "manga", "capucha", "completo"],
        "pantalon": ["pierna", "bolsillo", "cintura"],
        "gorra": ["frontal", "lateral", "trasera"]
    }
    
    return position.lower() in valid_positions.get(garment_type.lower(), [])
