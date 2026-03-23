/**
 * Controller de Transacciones
 * 
 * Maneja las peticiones HTTP relacionadas con cuentas bancarias para transacciones.
 * Valida los datos recibidos, verifica duplicados y se integra con el microservicio de usuarios.
 * 
 * Rutas base: /transacciones
 */

import type { Request, Response } from "express";
import type {
  BancoDto,
  EpaycoWebhookPayload,
  PagoCheckoutDto,
  TransaccionDto,
} from "../DTO/transaccionesDto.js";
import { TransaccionesRepository } from "../repository/transaccionesRepository.js";
import axios from "axios";
import { PaymentProviderService } from "../services/paymentProviderService.js";

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
   * Obtiene el catalogo de bancos disponibles
   *
   * Ruta: GET /transacciones/obtenerBancos
   */
  static async obtenerBancos(req: Request, res: Response) {
    try {
      this.markLegacyRoute(req, res);
      const bancos = await TransaccionesRepository.getBanks();

      res.status(200).json({
        message: "Bancos obtenidos correctamente",
        data: bancos,
        bancos,
      });
    } catch (error) {
      console.error("Error obteniendo bancos:", error);
      res.status(500).json({ message: "Error obteniendo bancos" });
    }
  }

  /**
   * Crea un banco en el catalogo
   *
   * Ruta: POST /transacciones/crearBanco
   */
  static async crearBanco(req: Request, res: Response) {
    try {
      this.markLegacyRoute(req, res);
      const nombre = String(req.body.nombre ?? req.body.bankName ?? "").trim();

      if (!nombre) {
        res.status(400).json({ message: "El nombre del banco es obligatorio" });
        return;
      }

      const existingBank = await TransaccionesRepository.findBankByName(nombre);

      if (existingBank) {
        res.status(400).json({ message: "Ese banco ya existe" });
        return;
      }

      const newBank: BancoDto = { nombre };
      const result: any = await TransaccionesRepository.createBank(newBank);
      const createdBank = await TransaccionesRepository.findBankById(
        Number(result?.insertId)
      );

      res.status(201).json({
        message: "Banco creado correctamente",
        data: createdBank ?? { id: result?.insertId ?? null, nombre },
      });
    } catch (error) {
      console.error("Error creando banco:", error);
      res.status(500).json({ message: "Error creando banco" });
    }
  }

  /**
   * Actualiza un banco del catalogo
   *
   * Ruta: PATCH /transacciones/actualizarBanco/:id
   */
  static async actualizarBanco(req: Request, res: Response) {
    try {
      this.markLegacyRoute(req, res);
      const bankId = Number(req.params.id);
      const nombre = String(req.body.nombre ?? req.body.bankName ?? "").trim();

      if (!Number.isFinite(bankId)) {
        res.status(400).json({ message: "Id de banco invalido" });
        return;
      }

      if (!nombre) {
        res.status(400).json({ message: "El nombre del banco es obligatorio" });
        return;
      }

      const existingBank = await TransaccionesRepository.findBankByName(nombre);

      if (existingBank && Number(existingBank.id) !== bankId) {
        res.status(400).json({ message: "Ese banco ya existe" });
        return;
      }

      const result = await TransaccionesRepository.updateBank(bankId, nombre);

      if (!result) {
        res.status(404).json({ message: "Banco no encontrado" });
        return;
      }

      const updatedBank = await TransaccionesRepository.findBankById(bankId);

      res.status(200).json({
        message: "Banco actualizado correctamente",
        data: updatedBank ?? { id: bankId, nombre },
      });
    } catch (error) {
      console.error("Error actualizando banco:", error);
      res.status(500).json({ message: "Error actualizando banco" });
    }
  }

  /**
   * Elimina un banco del catalogo
   *
   * Ruta: DELETE /transacciones/eliminarBanco/:id
   */
  static async eliminarBanco(req: Request, res: Response) {
    try {
      this.markLegacyRoute(req, res);
      const bankId = Number(req.params.id);

      if (!Number.isFinite(bankId)) {
        res.status(400).json({ message: "Id de banco invalido" });
        return;
      }

      const result = await TransaccionesRepository.deleteBank(bankId);

      if (!result) {
        res.status(404).json({ message: "Banco no encontrado" });
        return;
      }

      res.status(200).json({ message: "Banco eliminado correctamente" });
    } catch (error) {
      console.error("Error eliminando banco:", error);
      res.status(500).json({ message: "Error eliminando banco" });
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

  /**
   * Crea un checkout de pago usando el proveedor configurado.
   *
   * Ruta: POST /transacciones/checkout
   */
  static async crearCheckout(req: Request, res: Response) {
    try {
      this.markLegacyRoute(req, res);
      const amount = Number(req.body.amount);
      const userId = Number(req.body.userId ?? req.body.id_user);
      const orderId = String(req.body.orderId ?? req.body.order_id ?? "").trim();
      const description = String(req.body.description ?? "").trim();

      if (!orderId || !description || !Number.isFinite(userId) || !Number.isFinite(amount) || amount <= 0) {
        res.status(400).json({
          message: "Debes enviar orderId, userId, amount y description",
        });
        return;
      }

      const checkoutData: PagoCheckoutDto = {
        orderId,
        userId,
        amount,
        currency: req.body.currency,
        description,
        tax: Number(req.body.tax ?? 0),
        taxBase: Number(req.body.taxBase ?? req.body.tax_base ?? Math.max(amount, 0)),
        customer: req.body.customer,
      };

      const { payment, checkoutConfig } = PaymentProviderService.createCheckout(checkoutData);
      const result: any = await TransaccionesRepository.createEpaycoPayment(payment);
      const savedPayment = await TransaccionesRepository.findPaymentByProviderReference(
        payment.provider_reference
      );

      res.status(201).json({
        message: "Checkout creado correctamente",
        data: {
          id: result?.insertId ?? null,
          payment: savedPayment ?? payment,
          checkoutConfig,
        },
      });
    } catch (error: any) {
      console.error("Error creando checkout:", error);
      res.status(500).json({
        message: error?.message ?? "Error creando checkout",
      });
    }
  }

  /**
   * Consulta pagos de una orden.
   *
   * Ruta: GET /transacciones/pagos/orden/:orderId
   */
  static async obtenerPagosPorOrden(req: Request, res: Response) {
    try {
      this.markLegacyRoute(req, res);
      const { orderId } = req.params;
      const payments = await TransaccionesRepository.findPaymentsByOrderId(orderId);

      res.status(200).json({
        message: "Pagos obtenidos correctamente",
        data: payments,
      });
    } catch (error) {
      console.error("Error obteniendo pagos por orden:", error);
      res.status(500).json({ message: "Error obteniendo pagos por orden" });
    }
  }

  /**
   * Consulta un pago por referencia interna.
   *
   * Ruta: GET /transacciones/pagos/:reference
   */
  static async obtenerPago(req: Request, res: Response) {
    try {
      this.markLegacyRoute(req, res);
      const payment = await TransaccionesRepository.findPaymentByProviderReference(
        req.params.reference
      );

      if (!payment) {
        res.status(404).json({ message: "Pago no encontrado" });
        return;
      }

      res.status(200).json({
        message: "Pago obtenido correctamente",
        data: payment,
      });
    } catch (error) {
      console.error("Error obteniendo pago:", error);
      res.status(500).json({ message: "Error obteniendo pago" });
    }
  }

  /**
   * Recibe confirmacion server-to-server desde ePayco.
   *
   * Ruta: POST /transacciones/webhook/epayco
   */
  static async webhookEpayco(req: Request, res: Response) {
    try {
      const payload = req.body as EpaycoWebhookPayload;
      const providerReference = String(payload.x_extra3 ?? "");

      if (!providerReference) {
        res.status(400).json({ message: "x_extra3 es obligatorio para ubicar el pago" });
        return;
      }

      const payment = await TransaccionesRepository.findPaymentByProviderReference(
        providerReference
      );

      if (!payment) {
        res.status(404).json({ message: "Pago no encontrado para la referencia enviada" });
        return;
      }

      const signatureValidation = PaymentProviderService.validateWebhookSignature(payload);
      if (!signatureValidation.skipped && !signatureValidation.valid) {
        res.status(400).json({ message: signatureValidation.reason });
        return;
      }

      const status = PaymentProviderService.mapWebhookStatus(payload);
      await TransaccionesRepository.updateEpaycoPaymentStatus({
        providerReference,
        status,
        epaycoRef: String(payload.x_ref_payco ?? ""),
        transactionId: String(payload.x_transaction_id ?? ""),
        rawResponse: JSON.stringify(payload),
      });

      const updatedPayment = await TransaccionesRepository.findPaymentByProviderReference(
        providerReference
      );

      res.status(200).json({
        message: signatureValidation.skipped
          ? "Webhook procesado sin validacion de firma por configuracion incompleta"
          : "Webhook procesado correctamente",
        data: updatedPayment,
      });
    } catch (error) {
      console.error("Error procesando webhook de ePayco:", error);
      res.status(500).json({ message: "Error procesando webhook de ePayco" });
    }
  }

  /**
   * Endpoint de apoyo para la redireccion del checkout.
   *
   * Ruta: GET /transacciones/respuesta/epayco
   */
  static async respuestaEpayco(req: Request, res: Response) {
    try {
      const providerReference = String(req.query.x_extra3 ?? req.query.reference ?? "");
      const refPayco = String(req.query.x_ref_payco ?? req.query.ref_payco ?? "");

      if (providerReference) {
        const payment = await TransaccionesRepository.findPaymentByProviderReference(
          providerReference
        );

        if (payment) {
          res.status(200).json({
            message: "Respuesta ePayco recibida",
            data: payment,
            epayco: {
              ref_payco: refPayco,
            },
          });
          return;
        }
      }

      if (refPayco) {
        const payment = await TransaccionesRepository.findPaymentByEpaycoRef(refPayco);
        if (payment) {
          res.status(200).json({
            message: "Respuesta ePayco recibida",
            data: payment,
          });
          return;
        }
      }

      res.status(404).json({ message: "No se encontro un pago asociado a la respuesta" });
    } catch (error) {
      console.error("Error procesando respuesta de ePayco:", error);
      res.status(500).json({ message: "Error procesando respuesta de ePayco" });
    }
  }
}
