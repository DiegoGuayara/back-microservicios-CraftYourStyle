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

  static async getAccountsByUserId(id_user: number) {
    const [rows]: any = await pool.query(
      `SELECT 
        u.id,
        u.nombre,
        u.email,
        t.numero_de_cuenta,
        t.tipo_de_cuenta,
        t.banco
      FROM usuarios u
      INNER JOIN transacciones t ON u.id = t.id_user
      WHERE u.id = ?`,
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
}
