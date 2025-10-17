import type { Request, Response } from "express";
import type { TransaccionDto } from "../DTO/transaccionesDto.js";
import { TransaccionesRepository } from "../repository/transaccionesRepository.js";

export class TransaccionesController {
  static async crearTransaccion(req: Request, res: Response) {
    try {
      const { numero_de_cuenta, tipo_de_cuenta, banco, id_user } = req.body;

      const newTransaccion: TransaccionDto = {
        numero_de_cuenta,
        tipo_de_cuenta,
        banco,
        id_user,
      };

      const existingNumber = await TransaccionesRepository.findByAccount(
        numero_de_cuenta
      );

      if (existingNumber) {
        res.status(400).json({ message: "Esta cuenta ya existe" });
        return;
      }

      const result = await TransaccionesRepository.create(newTransaccion);

      res.status(201).json({ message: "Transacción creada", id: result });
    } catch (error) {
      res.status(500).json({ message: "Error al crear la transacción", error });
      console.error("Error al crear la transacción:", error);
    }
  }

  static async obtenerCuentas(req: Request, res: Response) {
    try {
      const { id_user } = req.params;

      const result = await TransaccionesRepository.getAccountsByUserId(
        Number(id_user)
      );

      if (result.length === 0) {
        res
          .status(404)
          .json({ message: "No se encontraron cuentas para este usuario" });
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Error al obtener las cuentas:", error);
      res.status(500).json({ message: "Error al obtener las cuentas", error });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { id, id_user } = req.params;

      const camposAct = req.body;

      const columns = [];
      const values = [];

      for (let [key, value] of Object.entries(camposAct)) {
        if (value !== undefined && value !== null && value !== "") {
          columns.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (columns.length === 0) {
        res.status(400).json({
          message: "No fields to update",
        });
        return;
      }

      const sql = `UPDATE transacciones 
      SET ${columns.join(", ")}
      WHERE id = ? 
      AND id_user = ?`;
      values.push(id);
      values.push(id_user);
      
      console.log("SQL:", sql);
      console.log("Values:", values);
      console.log("ID:", id, "ID_USER:", id_user);
      
      const resultDb = await TransaccionesRepository.updateAccountsByUserId(
        sql,
        values
      );

      res.status(200).json({
        message: "User updated successfully",
        user: {
          id: id,
          result: resultDb,
          ...camposAct,
        },
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}
