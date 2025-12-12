/**
 * Repository de Variantes de Productos
 * 
 * Maneja operaciones CRUD de variantes de productos.
 * Cada variante representa una combinación específica de talla, color, stock y precio
 * para un producto determinado.
 */

import type { VariantProductos } from "../DTO/variant-productos.js";
import pool from "../config/db-config.js";

export class VariantProductosRepository {
  /** Crea una nueva variante de producto (talla, color, stock, precio) */
  static async crearVariantProducto(variant: VariantProductos) {
    const { producto_id, size, color, stock, price } = variant;
    const [result] = await pool.query(
      "INSERT INTO variantes_productos (producto_id, size, color, stock, price) VALUES (?, ?, ?, ?, ?)",
      [producto_id, size, color, stock, price]
    );
    return result;
  }

  /** Obtiene todas las variantes de todos los productos */
  static async obtenerVariantesProductos() {
    const [rows]: any = await pool.query("SELECT * FROM variantes_productos");
    return rows;
  }

  /** Obtiene una variante específica por su ID */
  static async obtenerVariantProductoPorId(id: number) {
    const [rows]: any = await pool.query(
      "SELECT * FROM variantes_productos WHERE id = ?",
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /** Actualiza una variante existente (puede actualizar solo algunos campos) */
  static async actualizarVariantProductoPorId(
    id: number,
    variant: Partial<VariantProductos>
  ) {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(variant)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    const sql = `UPDATE variantes_productos SET ${fields.join(
      ", "
    )} WHERE id = ?`;
    values.push(id);
    const [result] = await pool.query(sql, values);
    return result;
  }

  /** Elimina una variante por su ID */
  static async eliminarVariantProductoPorId(id: number) {
    const [result]: any = await pool.query(
      "DELETE FROM variantes_productos WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0 ? result : null;
  }
}
