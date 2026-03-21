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
  private static parsePositiveNumber(value: unknown) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  /** POST /variantProductos/crearVarianteProducto - Crea una nueva variante */
  static async crearVariantProducto(req: Request, res: Response) {
    try {
      const { producto_id, talla, color } = req.body;
      const existencias = req.body.existencias ?? req.body.stock;
      const precio = req.body.precio ?? req.body.price;

      if (
        !producto_id ||
        !talla ||
        !color ||
        existencias === undefined ||
        precio === undefined
      ) {
        res.status(400).json({ mensaje: "Faltan datos obligatorios" });
        return;
      }

      const productoIdValue = this.parsePositiveNumber(producto_id);
      const existenciasValue = this.parsePositiveNumber(existencias);
      const precioValue = Number(precio);

      if (!Number.isInteger(productoIdValue) || productoIdValue <= 0) {
        res.status(400).json({ mensaje: "producto_id invalido" });
        return;
      }

      if (!Number.isInteger(existenciasValue) || existenciasValue < 0) {
        res.status(400).json({ mensaje: "existencias debe ser un entero mayor o igual a 0" });
        return;
      }

      if (!Number.isFinite(precioValue) || precioValue < 0) {
        res.status(400).json({ mensaje: "precio invalido" });
        return;
      }

      const nuevaVariant: VariantProductos = {
        producto_id: productoIdValue,
        talla,
        color,
        existencias: existenciasValue,
        precio: precioValue,
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

  /** GET /variantProductos/obtenerVariantesPorProducto/:producto_id - Obtiene variantes por producto */
  static async obtenerVariantesPorProducto(req: Request, res: Response) {
    try {
      const productoId = Number(req.params.producto_id);

      if (!Number.isInteger(productoId) || productoId <= 0) {
        res.status(400).json({ mensaje: "producto_id invalido" });
        return;
      }

      const result =
        await VariantProductosRepository.obtenerVariantesPorProductoId(productoId);

      res.status(200).json({
        mensaje: "Variantes obtenidas",
        data: result,
      });
    } catch (error) {
      res
        .status(500)
        .json({ mensaje: "Error al obtener las variantes del producto", error });
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
      const { producto_id, talla, color } = req.body;
      const existencias = req.body.existencias ?? req.body.stock;
      const precio = req.body.precio ?? req.body.price;

      const variantExistente =
        await VariantProductosRepository.obtenerVariantProductoPorId(
          Number(id)
        );

      if (!variantExistente) {
        res.status(404).json({ mensaje: "Variante no encontrada" });
        return;
      }

      const variantActualizada: Partial<VariantProductos> = {};
      if (producto_id !== undefined) {
        const productoIdValue = this.parsePositiveNumber(producto_id);
        if (!Number.isInteger(productoIdValue) || productoIdValue <= 0) {
          res.status(400).json({ mensaje: "producto_id invalido" });
          return;
        }
        variantActualizada.producto_id = productoIdValue;
      }
      if (talla !== undefined) variantActualizada.talla = talla;
      if (color !== undefined) variantActualizada.color = color;
      if (existencias !== undefined) {
        const existenciasValue = this.parsePositiveNumber(existencias);
        if (!Number.isInteger(existenciasValue) || existenciasValue < 0) {
          res.status(400).json({ mensaje: "existencias debe ser un entero mayor o igual a 0" });
          return;
        }
        variantActualizada.existencias = existenciasValue;
      }
      if (precio !== undefined) {
        const precioValue = Number(precio);
        if (!Number.isFinite(precioValue) || precioValue < 0) {
          res.status(400).json({ mensaje: "precio invalido" });
          return;
        }
        variantActualizada.precio = precioValue;
      }

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

  /** PATCH /variantProductos/descontarStock/:id - Descuenta stock de una variante */
  static async descontarStockPorId(req: Request, res: Response) {
    try {
      const variantId = Number(req.params.id);
      const cantidad = Number(req.body.cantidad ?? req.body.quantity);

      if (!Number.isInteger(variantId) || variantId <= 0) {
        res.status(400).json({ mensaje: "id de variante invalido" });
        return;
      }

      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        res.status(400).json({ mensaje: "cantidad debe ser un entero mayor a 0" });
        return;
      }

      const variantExistente =
        await VariantProductosRepository.obtenerVariantProductoPorId(variantId);

      if (!variantExistente) {
        res.status(404).json({ mensaje: "Variante no encontrada" });
        return;
      }

      const variantActualizada =
        await VariantProductosRepository.descontarStockPorId(variantId, cantidad);

      if (!variantActualizada) {
        res.status(400).json({ mensaje: "Stock insuficiente para realizar el descuento" });
        return;
      }

      res.status(200).json({
        mensaje: "Stock descontado correctamente",
        data: variantActualizada,
      });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al descontar stock", error });
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
