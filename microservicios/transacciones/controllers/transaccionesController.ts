/**
 * Controller de Transacciones
 * 
 * Maneja las peticiones HTTP relacionadas con cuentas bancarias para transacciones.
 * Valida los datos recibidos, verifica duplicados y se integra con el microservicio de usuarios.
 * 
 * Rutas base: /transacciones
 */

import type { Request, Response } from "express";
import type { TransaccionDto } from "../DTO/transaccionesDto.js";
import { TransaccionesRepository } from "../repository/transaccionesRepository.js";
import axios from "axios";

export class TransaccionesController {
  /**
   * Crea una nueva cuenta bancaria para un usuario
   * 
   * Ruta: POST /transacciones/crearCuenta
   * Valida que el número de cuenta no exista previamente
   */
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

  /**
   * Obtiene todas las cuentas bancarias de un usuario
   * 
   * Ruta: GET /transacciones/obtenerCuentas/:id_user
   * Se integra con el microservicio de usuarios para obtener info completa
   */
  static async obtenerCuentas(req: Request, res: Response) {
    try {
      const { id_user } = req.params;

      const cuenta = await TransaccionesRepository.findAccountsByUserId(
        Number(id_user)
      );

      // Intentar obtener datos del usuario desde el microservicio de usuarios
      let usuarioData = null;
      try {
        const { data } = await axios.get(
          `http://localhost:1010/api/usuarios/v1/usuarios/${id_user}`
        );
        
        if (data && data.usuario) {
          const { contraseña, ...usuarioSinContraseña } = data.usuario;
          usuarioData = usuarioSinContraseña;
        }
      } catch (axiosError: any) {
        console.error("Error al obtener usuario:", axiosError.message);
        // Continuar sin datos del usuario si falla
      }
      
      res.status(200).json({
        usuario: usuarioData,
        cuentas: cuenta,
      });
    } catch (error: any) {
      console.error("Error obteniendo transacciones:", error.message);
      return res.status(500).json({ mensaje: "Error obteniendo información" });
    }
  }

  /**
   * Actualiza información de una cuenta bancaria
   * 
   * Ruta: PATCH /transacciones/actualizarCuenta/:id_user/:id
   * Actualización dinámica: solo actualiza campos enviados
   */
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

      const sql = `UPDATE transacciones SET ${columns.join(
        ", "
      )} WHERE id_user = ? AND id = ?`;
      values.push(Number(id_user));
      values.push(Number(id));

      const resultDb = await TransaccionesRepository.updateAccountsByUserId(
        sql,
        values
      );

      res.status(200).json({
        message: "User updated successfully",
        user: {
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

  /**
   * Elimina una cuenta bancaria de un usuario
   * 
   * Ruta: DELETE /transacciones/eliminarCuenta/:id/:id_user
   * Requiere ID de cuenta y usuario para seguridad
   */
  static async eliminarCuenta(req: Request, res: Response) {
    try {
      const { id, id_user } = req.params;

      const resultDb = await TransaccionesRepository.deleteAccountsByUserId(
        Number(id),
        Number(id_user)
      );

      if (!resultDb) {
        res.status(404).json({ message: "Cuenta no encontrada" });
        return;
      }

      res.status(200).json({ message: "Cuenta eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar la cuenta:", error);
      res.status(500).json({ message: "Error al eliminar la cuenta", error });
    }
  }
}
