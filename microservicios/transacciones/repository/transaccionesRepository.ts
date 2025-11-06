import type { TransaccionDto } from "../DTO/transaccionesDto.js";
import pool from "../config/db-config.js";

export class TransaccionesRepository {
  static async create(transaccion: TransaccionDto) {
    const { numero_de_cuenta, tipo_de_cuenta, banco, id_user } = transaccion;
    const [result] = await pool.query(
      "INSERT INTO transacciones (numero_de_cuenta, tipo_de_cuenta, banco, id_user) VALUES (?, ?, ?, ?)",
      [numero_de_cuenta, tipo_de_cuenta, banco, id_user]
    );
    return result;
  }

  static async findByAccount(numero_de_cuenta: string) {
    const [rows]: any = await pool.query(
      "SELECT * FROM transacciones WHERE numero_de_cuenta = ?",
      [numero_de_cuenta]
    );
    return rows[0];
  }

  static async findAccountsByUserId(id_user: number) {
    const [rows]: any = await pool.query(
      "SELECT * FROM transacciones WHERE id_user = ?",
      [id_user]
    );
    return rows;
  }

  static async updateAccountsByUserId(sql: string, values: any[]) {
    const [resultDb]: any = await pool.query(sql, values);

    if (resultDb.affectedRows === 0) {
      return null;
    }

    return resultDb;
  }

  static async deleteAccountsByUserId(id: number, id_user: number) {
    const [resultDb]: any = await pool.query(
      "DELETE FROM transacciones WHERE id = ? AND id_user = ?",
      [id, id_user]
    );

    if (resultDb.affectedRows === 0) {
      return;
    }

    return resultDb;
  }
}
