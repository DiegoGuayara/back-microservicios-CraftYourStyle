/**
 * Controller de Variantes de Productos
 * 
 * Gestiona las peticiones HTTP para operaciones CRUD de variantes.
 * Las variantes permiten definir diferentes opciones de un mismo producto
 * (ej: tallas, colores, con sus respectivos stocks y precios).
 * 
 * Rutas base: /variantProductos
 */

import { VariantProductosRepository } from "../repository/variant-productos.repository";
import type { VariantProductos } from "../DTO/variant-productos";
import type { Request, Response } from "express";

export class VariantProductosController {
  /** POST /variantProductos/crearVarianteProducto - Crea una nueva variante */
  static async crearVariantProducto(req: Request, res: Response) {
    try {
      const { producto_id, size, color, stock, price } = req.body;

      if (
        !producto_id ||
        !size ||
        !color ||
        stock === undefined ||
        price === undefined
      ) {
        res.status(400).json({ mensaje: "Faltan datos obligatorios" });
        return;
      }

      const nuevaVariant: VariantProductos = {
        producto_id,
        size,
        color,
        stock,
        price,
      };

      const result = await VariantProductosRepository.crearVariantProducto(
        nuevaVariant
      );

      res.status(201).json({ mensaje: "Variante creada", data: result });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al crear la variante", error });

      console.error("Error:", error);
    }
  }

  /** GET /variantProductos/obtenerVariantes - Obtiene todas las variantes */
  static async obtenerVariantProducto(req: Request, res: Response) {
    try {
      const result =
        await VariantProductosRepository.obtenerVariantesProductos();

      res.status(200).json({ mensaje: "Variantes obtenidas", data: result });
    } catch (error) {
      res
        .status(500)
        .json({ mensaje: "Error al obtener las variantes", error });
      console.error("Error:", error);
    }
  }

  /** GET /variantProductos/obtenerVariante/:id - Obtiene una variante por ID */
  static async obtenerVariantProductoPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result =
        await VariantProductosRepository.obtenerVariantProductoPorId(
          Number(id)
        );

      if (!result) {
        res.status(404).json({ mensaje: "Variante no encontrada" });
        return;
      }

      res.status(200).json({ mensaje: "Variante obtenida", data: result });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al obtener la variante", error });
      console.error("Error:", error);
    }
  }

  /** PATCH /variantProductos/actualizarVariante/:id - Actualiza una variante */
  static async actualizarVariantProductoPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { producto_id, size, color, stock, price } = req.body;

      const variantExistente =
        await VariantProductosRepository.obtenerVariantProductoPorId(
          Number(id)
        );

      if (!variantExistente) {
        res.status(404).json({ mensaje: "Variante no encontrada" });
        return;
      }

      const variantActualizada: Partial<VariantProductos> = {};
      if (producto_id !== undefined)
        variantActualizada.producto_id = producto_id;
      if (size !== undefined) variantActualizada.size = size;
      if (color !== undefined) variantActualizada.color = color;
      if (stock !== undefined) variantActualizada.stock = stock;
      if (price !== undefined) variantActualizada.price = price;

      if (Object.keys(variantActualizada).length === 0) {
        res
          .status(400)
          .json({ mensaje: "No se enviaron datos para actualizar" });
        return;
      }

      const result =
        await VariantProductosRepository.actualizarVariantProductoPorId(
          Number(id),
          variantActualizada
        );

      res.status(200).json({ mensaje: "Variante actualizada", data: result });
    } catch (error) {
      res
        .status(500)
        .json({ mensaje: "Error al actualizar la variante", error });
      console.error("Error:", error);
    }
  }

  /** DELETE /variantProductos/eliminarVariante/:id - Elimina una variante */
  static async eliminarVariantProductoPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const variant =
        await VariantProductosRepository.obtenerVariantProductoPorId(
          Number(id)
        );
      if (!variant) {
        res.status(404).json({ mensaje: "Variante no encontrada" });
        return;
      }

      const result =
        await VariantProductosRepository.eliminarVariantProductoPorId(
          Number(id)
        );
      res.status(200).json({ mensaje: "Variante eliminada", data: result });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al eliminar la variante", error });
      console.error("Error:", error);
    }
  }
}
