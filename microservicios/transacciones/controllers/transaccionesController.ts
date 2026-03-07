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
  private static getUsuariosBaseUrl(): string {
    return process.env.USUARIOS_URL ?? "http://usuarios:8080";
  }

  private static markLegacyRoute(req: Request, res: Response) {
    if (!req.baseUrl || req.baseUrl === "/") {
      res.setHeader("Deprecation", "true");
      res.setHeader("Sunset", "Wed, 30 Sep 2026 23:59:59 GMT");
      res.setHeader("Link", "</api/transacciones/transacciones>; rel=\"successor-version\"");
    }
  }

  /**
   * Crea una nueva cuenta bancaria para un usuario
   * 
   * Ruta: POST /transacciones/crearCuenta
   * Valida que el número de cuenta no exista previamente
   */
  static async crearTransaccion(req: Request, res: Response) {
    try {
      this.markLegacyRoute(req, res);
      const {
        numero_de_cuenta,
        tipo_de_cuenta,
        banco,
        id_user,
        userId,
        accountNumber,
        accountType,
        bank,
      } = req.body;

      const accountNumberValue = numero_de_cuenta ?? accountNumber;
      const accountTypeValue = tipo_de_cuenta ?? accountType;
      const bankValue = banco ?? bank;
      const userIdValue = Number(id_user ?? userId);

      if (!accountNumberValue || !accountTypeValue || !bankValue || !Number.isFinite(userIdValue)) {
        res.status(400).json({ message: "Faltan datos obligatorios" });
        return;
      }

      const newTransaccion: TransaccionDto = {
        numero_de_cuenta: accountNumberValue,
        tipo_de_cuenta: accountTypeValue,
        banco: bankValue,
        id_user: userIdValue,
      };

      const existingNumber = await TransaccionesRepository.findByAccount(
        accountNumberValue
      );

      if (existingNumber) {
        res.status(400).json({ message: "Esta cuenta ya existe" });
        return;
      }

      const result: any = await TransaccionesRepository.create(newTransaccion);
      const createdId = result?.insertId ?? null;

      res.status(201).json({
        message: "Transacción creada",
        data: {
          id: createdId,
          id_user: userIdValue,
          numero_de_cuenta: accountNumberValue,
          tipo_de_cuenta: accountTypeValue,
          banco: bankValue,
        },
        // Compatibilidad con clientes existentes
        id: result,
      });
    } catch (error) {
      console.error("Error al crear la transacción:", error);
      res.status(500).json({ message: "Error al crear la transacción" });
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
      this.markLegacyRoute(req, res);
      const { id_user } = req.params;

      const cuenta = await TransaccionesRepository.findAccountsByUserId(
        Number(id_user)
      );

      // Intentar obtener datos del usuario desde el microservicio de usuarios
      let usuarioData = null;
      try {
        const { data } = await axios.get(
          `${this.getUsuariosBaseUrl()}/v1/usuarios/${id_user}`
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
        message: "Cuentas obtenidas correctamente",
        data: {
          usuario: usuarioData,
          cuentas: cuenta,
        },
        // Compatibilidad
        usuario: usuarioData,
        cuentas: cuenta,
      });
    } catch (error: any) {
      console.error("Error obteniendo transacciones:", error.message);
      return res.status(500).json({ message: "Error obteniendo información" });
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
      this.markLegacyRoute(req, res);
      const { id, id_user } = req.params;

      const camposAct = req.body;

      const columns: string[] = [];
      const values: unknown[] = [];
      const allowedFields: Record<string, string> = {
        numero_de_cuenta: "numero_de_cuenta",
        accountNumber: "numero_de_cuenta",
        tipo_de_cuenta: "tipo_de_cuenta",
        accountType: "tipo_de_cuenta",
        banco: "banco",
        bank: "banco",
      };

      for (let [key, value] of Object.entries(camposAct)) {
        const dbField = allowedFields[key];
        if (!dbField || value === undefined || value === null || value === "") {
          continue;
        }

        if (dbField === "tipo_de_cuenta") {
          const normalizedType = String(value).toLowerCase().trim();
          if (normalizedType !== "debito" && normalizedType !== "credito") {
            return res.status(400).json({
              message: "tipo_de_cuenta inválido. Valores permitidos: debito o credito",
            });
          }
          columns.push(`${dbField} = ?`);
          values.push(normalizedType);
          continue;
        }

        columns.push(`${dbField} = ?`);
        values.push(value);
      }

      if (columns.length === 0) {
        res.status(400).json({
          message: "No hay campos válidos para actualizar",
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

      if (!resultDb) {
        return res.status(404).json({ message: "Cuenta no encontrada" });
      }

      res.status(200).json({
        message: "Cuenta actualizada correctamente",
        data: {
          result: resultDb,
          ...camposAct,
        },
        // Compatibilidad
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
      this.markLegacyRoute(req, res);
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
      res.status(500).json({ message: "Error al eliminar la cuenta" });
    }
  }
}
