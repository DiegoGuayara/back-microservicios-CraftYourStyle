import type { VariantProductos } from "../DTO/variant-productos.js";
import pool from "../config/db-config.js";

export class VariantProductosRepository {
  static async crearVariantProducto(variant: VariantProductos) {
    const { producto_id, size, color, stock, price } = variant;
    const [result] = await pool.query(
      "INSERT INTO variantes_productos (producto_id, size, color, stock, price) VALUES (?, ?, ?, ?, ?)",
      [producto_id, size, color, stock, price]
    );
    return result;
  }

  static async obtenerVariantesProductos() {
    const [rows]: any = await pool.query("SELECT * FROM variantes_productos");
    return rows;
  }

  static async obtenerVariantProductoPorId(id: number) {
    const [rows]: any = await pool.query(
      "SELECT * FROM variantes_productos WHERE id = ?",
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

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

  static async eliminarVariantProductoPorId(id: number) {
    const [result]: any = await pool.query(
      "DELETE FROM variantes_productos WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0 ? result : null;
  }
}
