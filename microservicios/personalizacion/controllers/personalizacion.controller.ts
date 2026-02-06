/**
 * Controller de Personalización
 * 
 * Maneja las peticiones HTTP relacionadas con personalizaciones de productos.
 * Valida los datos recibidos y llama a los métodos del repository correspondiente.
 * 
 * Rutas base: /personalizacion
 */

import type { Request, Response } from "express";
import { PersonalizacionRepository } from "../repository/personalizacion.repository.js";
import type { PersonalizacionDto } from "../DTO/personalizacionDto.js";
import { publishPersonalizacionConfirmada } from "../config/rabbitmq.js";

export class PersonalizacionController {
  /**
   * Obtiene todas las personalizaciones
   * 
   * Ruta: GET /personalizacion/obtenerPersonalizacion
   * 
   * Respuesta exitosa (200): Array con todas las personalizaciones
   */
  static async getPersonalization(req: Request, res: Response) {
    const personalization =
      await PersonalizacionRepository.getPersonalization();
    res.json(personalization);
  }

  /**
   * Crea una nueva personalización
   * 
   * Ruta: POST /personalizacion/crearPersonalizacion
   * 
   * Body esperado:
   * {
   *   "color": "#FF5733",
   *   "image_url": "https://ejemplo.com/imagen.jpg",
   *   "textos": "Mi texto personalizado",
   *   "tipo_letra": "Arial",
   *   "variant_id": 1
   * }
   * 
   * Respuesta exitosa (201): {message: "Personalización creada", id: insertId}
   * Errores: 400 (faltan datos), 500 (error del servidor)
   * 
   * Nota: variant_id es opcional, se puede crear personalización sin asociarla a una variante
   */
  static async crearPersonalizacion(req: Request, res: Response) {
    try {
      const { color, image_url, textos, tipo_letra, variant_id } = req.body;
      const newPersonalization: PersonalizacionDto = {
        color,
        image_url,
        textos,
        tipo_letra,
        variant_id,
      };

      // Validar que los campos obligatorios estén presentes
      if (!color || !image_url || !textos || !tipo_letra) {
        res.status(400).json({ message: "Faltan datos obligatorios" });
        return;
      }

      const result = await PersonalizacionRepository.create(newPersonalization) as { insertId: number };

      // Publicar evento a RabbitMQ para notificar a Transacciones
      await publishPersonalizacionConfirmada({
        personalizacion_id: result.insertId,
        variant_id,
        color,
        image_url,
        textos,
        tipo_letra,
      });

      res.status(201).json({ message: "Personalización creada", id: result });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al crear la personalización", error });
      console.error("Error al crear la personalización:", error);
    }
  }

  /**
   * Obtiene una personalización específica por su ID
   * 
   * Ruta: GET /personalizacion/obtenerPersonalizacion/:id
   * Parámetro: id (número)
   * 
   * Respuesta exitosa (200): {message: "...", data: personalizacion}
   * Errores: 404 (no encontrada), 500 (error del servidor)
   */
  static async getPersonalizationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const personalization =
        await PersonalizacionRepository.findBypersonalizationId(Number(id));
      if (!personalization) {
        res.status(404).json({ message: "Personalización no encontrada" });
        return;
      }
      return res.status(200).json({
        message: "Personalización obtenida correctamente",
        data: personalization,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener la personalización", error });
      console.error("Error al obtener la personalización:", error);
    }
  }

  /**
   * Actualiza una personalización existente
   * 
   * Ruta: PATCH /personalizacion/actualizarPersonalizacion/:id
   * Parámetro: id (número)
   * 
   * Body: Solo los campos que se quieren actualizar
   * Ejemplo: {"color": "#00FF00"} o {"textos": "Nuevo texto", "tipo_letra": "Verdana"}
   * 
   * Respuesta exitosa (200): {message: "Personalización actualizada correctamente"}
   * Errores: 404 (no encontrada o sin campos), 500 (error del servidor)
   */
  static async updatePersonalizationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const fieldsToUpdate: Partial<PersonalizacionDto> = req.body;
      const result = await PersonalizacionRepository.updatePersonalizationById(
        Number(id),
        fieldsToUpdate
      );
      if (!result) {
        res
          .status(404)
          .json({
            message:
              "Personalización no encontrada o no se proporcionaron campos para actualizar",
          });
        return;
      }
      res
        .status(200)
        .json({ message: "Personalización actualizada correctamente" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al actualizar la personalización", error });
      console.error("Error al actualizar la personalización:", error);
    }
  }

  /**
   * Elimina una personalización por su ID
   * 
   * Ruta: DELETE /personalizacion/eliminarPersonalizacion/:id
   * Parámetro: id (número)
   * 
   * Respuesta exitosa (200): {message: "Personalización eliminada correctamente"}
   * Errores: 404 (no encontrada), 500 (error del servidor)
   */
  static async deletePersonalizationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await PersonalizacionRepository.deletePersonalizationById(
        Number(id)
      );
      if (!result) {
        res.status(404).json({ message: "Personalización no encontrada" });
        return;
      }
      res
        .status(200)
        .json({ message: "Personalización eliminada correctamente" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al eliminar la personalización", error });
      console.error("Error al eliminar la personalización:", error);
    }
  }
}
