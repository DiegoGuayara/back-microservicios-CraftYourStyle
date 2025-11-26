import type { CategoriaDto } from "../DTO/categoriaDto";
import { CategoriaRepository } from "../repository/categoria.repository";
import type { Request, Response } from "express";

export class CatalogoController {
  static async crearCategoria(req: Request, res: Response) {
    try {
      const { name } = req.body;

      if (!name) {
        res.status(400).json({
          message: "Faltan datos obligatorios por ingresar",
        });
        return;
      }

      const nuevaCategoria: CategoriaDto = {
        name,
      };

      const resultado = await CategoriaRepository.crearCategoria(
        nuevaCategoria
      );

      res.status(201).json({
        message: "Categoria creada exitosamente",
        data: resultado,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error al crear la categoria",
        error: error,
      });

      console.error("Error: ", error);
    }
  }

  static async obtenerCategorias(req: Request, res: Response) {
    try {
      const categorias = await CategoriaRepository.obtenerCategorias();

      if (categorias.length === 0) {
        res.status(404).json({
          message: "No se encontraron categorias",
        });
        return;
      }

      res.status(200).json({
        message: "Categorias obtenidas exitosamente",
        data: categorias,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener las categorias",
        error: error,
      });

      console.error("Error", error);
    }
  }

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
      res.status(500).json({
        message: "Error al obtener la categoria",
        error: error,
      });

      console.error("Error", error);
    }
  }

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
      res.status(500).json({
        message: "Error al eliminar la categoria",
        error: error,
      });

      console.error("Error", error);
    }
  }

  static async actualizarCategoriaPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name || !id) {
        res.status(400).json({
          message: "Faltan datos obligatorios por ingresar",
        });
        return;
      }

      const resultado = await CategoriaRepository.actualizarCategoriaPorId(
        Number(id),
        name
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
      res.status(500).json({
        message: "Error al actualizar la categoria",
        error: error,
      });

      console.error("Error", error);
    }
  }
}
