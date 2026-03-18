/**
 * Controller de Categorías (Catálogo)
 * 
 * Gestiona las peticiones HTTP para operaciones CRUD de categorías.
 * Rutas base: /catalogo
 */

import type { CategoriaDto } from "../DTO/categoriaDto";
import { CategoriaRepository } from "../repository/categoria.repository";
import type { Request, Response } from "express";

export class CatalogoController {
  /** POST /catalogo/crearCategoria - Crea una nueva categoría */
  static async crearCategoria(req: Request, res: Response) {
    try {
      const nombre = req.body?.nombre ?? req.body?.name ?? req.body?.title;

      if (!nombre) {
        res.status(400).json({
          message: "Faltan datos obligatorios (nombre es requerido)",
        });
        return;
      }

      const nuevaCategoria: CategoriaDto = {
        nombre,
      };

      const resultado = await CategoriaRepository.crearCategoria(
        nuevaCategoria
      );

      res.status(201).json({
        message: "Categoria creada exitosamente",
        data: resultado,
      });
    } catch (error) {
      console.error("Error al crear la categoria:", error);
      res.status(500).json({
        message: "Error al crear la categoria",
      });
    }
  }

  /** GET /catalogo/obtenerCategorias - Obtiene todas las categorías */
  static async obtenerCategorias(req: Request, res: Response) {
    try {
      const categorias = await CategoriaRepository.obtenerCategorias();

      res.status(200).json({
        message: categorias.length > 0
          ? "Categorias obtenidas exitosamente"
          : "No se encontraron categorias",
        data: categorias,
      });
    } catch (error) {
      console.error("Error al obtener las categorias:", error);
      res.status(500).json({
        message: "Error al obtener las categorias",
      });
    }
  }

  /** GET /catalogo/obtenerCategoria/:id - Obtiene una categoría por ID */
  static async obtenerCategoriaPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const categoria = await CategoriaRepository.obtenerCategoriaPorId(
        Number(id)
      );

      if (!categoria) {
        res.status(404).json({
          message: "Categoria no encontrada",
        });
        return;
      }

      res.status(200).json({
        message: "Categoria obtenida exitosamente",
        data: categoria,
      });
    } catch (error) {
      console.error("Error al obtener la categoria:", error);
      res.status(500).json({
        message: "Error al obtener la categoria",
      });
    }
  }

  /** DELETE /catalogo/eliminarCategoria/:id - Elimina una categoría */
  static async eliminarCategoriaPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const resultado = await CategoriaRepository.eliminarCategoriaPorId(
        Number(id)
      );

      if (!resultado) {
        res.status(404).json({
          message: "Categoria no encontrada",
        });
        return;
      }

      res.status(200).json({
        message: "Categoria eliminada exitosamente",
        data: resultado,
      });
    } catch (error) {
      console.error("Error al eliminar la categoria:", error);
      res.status(500).json({
        message: "Error al eliminar la categoria",
      });
    }
  }

  /** PATCH /catalogo/actualizarCategoria/:id - Actualiza una categoría */
  static async actualizarCategoriaPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const nombre = req.body?.nombre ?? req.body?.name ?? req.body?.title;

      if (!nombre || !id) {
        res.status(400).json({
          message: "Faltan datos obligatorios por ingresar",
        });
        return;
      }

      const resultado = await CategoriaRepository.actualizarCategoriaPorId(
        Number(id),
        nombre
      );

      if (!resultado) {
        res.status(404).json({
          message: "Categoria no encontrada",
        });
        return;
      }

      res.status(200).json({
        message: "Categoria actualizada exitosamente",
        data: resultado,
      });
    } catch (error) {
      console.error("Error al actualizar la categoria:", error);
      res.status(500).json({
        message: "Error al actualizar la categoria",
      });
    }
  }
}
