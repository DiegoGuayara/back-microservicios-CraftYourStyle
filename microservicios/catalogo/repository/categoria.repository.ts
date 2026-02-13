/**
 * Repository de Categorías
 * 
 * Maneja operaciones CRUD de categorías en la base de datos.
 * Las categorías se usan para clasificar productos dentro de cada tienda.
 */

import type { CategoriaDto } from "../DTO/categoriaDto.js";
import pool from "../config/db-config.js";

export class CategoriaRepository {
  /** Crea una nueva categoría */
  static async crearCategoria(categoria: CategoriaDto) {
    const { name, tienda_id } = categoria;
    const [result] = await pool.query(
      "INSERT INTO categoria (name, tienda_id) VALUES (?, ?)",
      [name, tienda_id]
    );
    return result;
  }

  /** Obtiene todas las categorías */
  static async obtenerCategorias() {
    const [rows]: any = await pool.query("SELECT * FROM categoria");
    return rows;
  }

  /** Obtiene una categoría por ID */
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

  /** Elimina una categoría por ID */
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

  /** Actualiza el nombre de una categoría */
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
