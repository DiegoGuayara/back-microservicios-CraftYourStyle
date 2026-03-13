/**
 * Repository de Transacciones
 * 
 * Maneja todas las operaciones de base de datos relacionadas con cuentas bancarias.
 * Permite a los usuarios registrar sus métodos de pago para realizar compras.
 */

import type { BancoDto, TransaccionDto } from "../DTO/transaccionesDto.js";
import pool from "../config/db-config.js";

export class TransaccionesRepository {
  static async getBanks() {
    const [rows]: any = await pool.query(
      "SELECT id, nombre FROM bancos ORDER BY nombre ASC"
    );
    return rows;
  }

  static async findBankById(id: number) {
    const [rows]: any = await pool.query(
      "SELECT id, nombre FROM bancos WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async findBankByName(nombre: string) {
    const [rows]: any = await pool.query(
      "SELECT id, nombre FROM bancos WHERE LOWER(nombre) = LOWER(?)",
      [nombre]
    );
    return rows[0];
  }

  static async createBank(banco: BancoDto) {
    const [result] = await pool.query(
      "INSERT INTO bancos (nombre) VALUES (?)",
      [banco.nombre]
    );
    return result;
  }

  static async updateBank(id: number, nombre: string) {
    const [resultDb]: any = await pool.query(
      "UPDATE bancos SET nombre = ? WHERE id = ?",
      [nombre, id]
    );

    if (resultDb.affectedRows === 0) {
      return null;
    }

    return resultDb;
  }

  static async deleteBank(id: number) {
    const [resultDb]: any = await pool.query(
      "DELETE FROM bancos WHERE id = ?",
      [id]
    );

    if (resultDb.affectedRows === 0) {
      return null;
    }

    return resultDb;
  }

  /**
   * Crea una nueva cuenta bancaria para un usuario
   * 
   * @param transaccion - Objeto con los datos de la cuenta:
   *   - numero_de_cuenta: Número de la cuenta bancaria
   *   - tipo_de_cuenta: Tipo de cuenta ("debito" o "credito")
   *   - banco: Nombre del banco
   *   - id_user: ID del usuario dueño de la cuenta
   * 
   * @returns Resultado de la inserción con el ID de la cuenta creada
   */
  static async create(transaccion: TransaccionDto) {
    const { numero_de_cuenta, tipo_de_cuenta, banco, id_user } = transaccion;
    const [result] = await pool.query(
      "INSERT INTO transacciones (numero_de_cuenta, tipo_de_cuenta, banco, id_user) VALUES (?, ?, ?, ?)",
      [numero_de_cuenta, tipo_de_cuenta, banco, id_user]
    );
    return result;
  }

  /**
   * Busca una cuenta por su número de cuenta
   * 
   * @param numero_de_cuenta - Número de cuenta a buscar
   * @returns Cuenta encontrada o undefined si no existe
   * 
   * Nota: Se usa para verificar que no existan cuentas duplicadas
   */
  static async findByAccount(numero_de_cuenta: string) {
    const [rows]: any = await pool.query(
      "SELECT * FROM transacciones WHERE numero_de_cuenta = ?",
      [numero_de_cuenta]
    );
    return rows[0];
  }

  /**
   * Obtiene todas las cuentas bancarias de un usuario específico
   * 
   * @param id_user - ID del usuario
   * @returns Array con todas las cuentas del usuario
   */
  static async findAccountsByUserId(id_user: number) {
    const [rows]: any = await pool.query(
      "SELECT * FROM transacciones WHERE id_user = ?",
      [id_user]
    );
    return rows;
  }

  /**
   * Actualiza una cuenta bancaria de un usuario
   * 
   * @param sql - Query SQL dinámica construida en el controller
   * @param values - Valores a actualizar
   * @returns Resultado de la actualización o null si no se encontró la cuenta
   * 
   * Nota: Este método es flexible y permite actualizar solo los campos enviados
   */
  static async updateAccountsByUserId(sql: string, values: any[]) {
    const [resultDb]: any = await pool.query(sql, values);

    if (resultDb.affectedRows === 0) {
      return null;
    }

    return resultDb;
  }

  /**
   * Elimina una cuenta bancaria específica de un usuario
   * 
   * @param id - ID de la cuenta a eliminar
   * @param id_user - ID del usuario dueño de la cuenta
   * @returns Resultado de la eliminación o undefined si no se encontró
   * 
   * Nota: Requiere tanto el ID de la cuenta como el ID del usuario para seguridad
   */
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
