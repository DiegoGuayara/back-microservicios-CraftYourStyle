import type { Request, Response } from "express";
import { FacturaService, FacturaServiceError } from "../services/factura.services.js";

export class FacturaController {
  private static getParamAsString(value: string | string[] | undefined, name: string): string {
    if (typeof value !== "string" || !value.trim()) {
      throw new FacturaServiceError(`Parámetro inválido: ${name}`, 400);
    }

    return value;
  }

  private static handleError(error: unknown, res: Response) {
    if (error instanceof FacturaServiceError) {
      return res.status(error.status).json({ message: error.message });
    }

    return res.status(500).json({ message: "Error interno en módulo de facturas" });
  }

  static async crearFactura(req: Request, res: Response) {
    try {
      const factura = await FacturaService.crearFactura(req.body);
      return res.status(201).json({
        message: "Factura creada correctamente",
        data: factura,
      });
    } catch (error: unknown) {
      return this.handleError(error, res);
    }
  }

  static async obtenerFacturaPorId(req: Request, res: Response) {
    try {
      const id = this.getParamAsString(req.params.id, "id");
      const factura = await FacturaService.obtenerFacturaPorId(id);
      return res.status(200).json({
        message: "Factura obtenida correctamente",
        data: factura,
      });
    } catch (error: unknown) {
      return this.handleError(error, res);
    }
  }

  static async obtenerFacturasPorUsuario(req: Request, res: Response) {
    try {
      const id_usuario = this.getParamAsString(req.params.id_usuario, "id_usuario");
      const facturas = await FacturaService.obtenerFacturasPorUsuario(id_usuario);
      return res.status(200).json({
        message: "Facturas del usuario obtenidas correctamente",
        data: facturas,
      });
    } catch (error: unknown) {
      return this.handleError(error, res);
    }
  }

  static async enviarFacturaPorCorreo(req: Request, res: Response) {
    try {
      const id = this.getParamAsString(req.params.id, "id");
      const resultado = await FacturaService.enviarFacturaPorCorreo(id);
      return res.status(200).json({
        message: "Factura enviada por correo correctamente",
        data: resultado,
      });
    } catch (error: unknown) {
      return this.handleError(error, res);
    }
  }
}
