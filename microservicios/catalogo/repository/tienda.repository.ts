import type { TiendaDto } from "../DTO/tiendaDto";
import pool from "../config/db-config.js";

export class TiendaRepository {
  static async crearTienda(tienda: TiendaDto) {
    const { nombre } = tienda;
    const [result] = await pool.query("INSERT INTO tienda (nombre) VALUES (?)", [
      nombre,
    ]);
    return result;
  }

  static async obtenerTiendas() {
    const [rows]: any = await pool.query("SELECT * FROM tienda");
    return rows;
  }

  static async obtenerTiendaPorId(id: number) {
    const [rows]: any = await pool.query("SELECT * FROM tienda WHERE id = ?", [
      id,
    ]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async actualizarTiendaPorId(id: number, tienda: Partial<TiendaDto>) {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(tienda)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    const sql = `UPDATE tienda SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);
    const [result] = await pool.query(sql, values);
    return result;
  }

  static async eliminarTiendaPorId(id: number) {
    const [result]: any = await pool.query("DELETE FROM tienda WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0 ? result : null;
  }
}
