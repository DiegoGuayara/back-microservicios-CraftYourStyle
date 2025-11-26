import type { CategoriaDto } from "../DTO/categoriaDto.js";
import pool from "../config/db-config.js";

export class CategoriaRepository {
  static async crearCategoria(categoria: CategoriaDto) {
    const { name } = categoria;
    const [result] = await pool.query(
      "INSERT INTO categoria (name) VALUES (?)",
      [name]
    );
    return result;
  }

  static async obtenerCategorias() {
    const [rows]: any = await pool.query("SELECT * FROM categoria");
    return rows;
  }

  static async obtenerCategoriaPorId(id: number) {
    const [rows]: any = await pool.query(
      "select * from categoria where id = ?",
      [id]
    );
    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  }

  static async eliminarCategoriaPorId(id: number) {
    const [resultDb]: any = await pool.query(
      "delete from categoria where id = ?",
      [id]
    );
    if (resultDb.affectedRows === 0) {
      return null;
    }
    return resultDb;
  }

  static async actualizarCategoriaPorId(id: number, name: string) {
    const [resultDb]: any = await pool.query(
      "update categoria set name = ? where id = ?",
      [name, id]
    );
    if (resultDb.affectedRows === 0) {
      return null;
    }
    return resultDb;
  }
}
