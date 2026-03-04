import axios from "axios";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { randomUUID } from "crypto";
import pool from "../config/db-config.js";
import type { Factura, ProductoFactura } from "../models/factura.models.js";

interface CreateFacturaInput {
  id_usuario: string;
  nombre_usuario: string;
  correo_usuario: string;
  productos: Array<{
    nombre_producto: string;
    precio_unitario: number;
    cantidad: number;
    subtotal?: number;
  }>;
  estado?: "PENDIENTE" | "PAGADA" | "VENCIDA";
  dias_vencimiento?: number;
}

interface FacturaRow extends RowDataPacket {
  id: string;
  id_usuario: string;
  nombre_usuario: string;
  correo_usuario: string;
  total_productos: number;
  valor_total: number;
  fecha_emision: Date;
  fecha_vencimiento: Date;
  estado: "PENDIENTE" | "PAGADA" | "VENCIDA";
}

interface DetalleRow extends RowDataPacket {
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

export class FacturaServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "FacturaServiceError";
    this.status = status;
  }
}

export class FacturaService {
  private static getNotificacionesBaseUrl(): string {
    return process.env.NOTIFICACIONES_URL ?? "http://notificaciones:10104";
  }

  private static toMoney(value: number): number {
    return Number(value.toFixed(2));
  }

  private static mapFactura(factura: FacturaRow, productos: ProductoFactura[]): Factura {
    return {
      id: factura.id,
      id_usuario: factura.id_usuario,
      nombre_usuario: factura.nombre_usuario,
      correo_usuario: factura.correo_usuario,
      productos,
      total_productos: factura.total_productos,
      valor_total: Number(factura.valor_total),
      fecha_emision: new Date(factura.fecha_emision).toISOString(),
      fecha_vencimiento: new Date(factura.fecha_vencimiento).toISOString(),
      estado: factura.estado,
    };
  }

  private static async getDetallesByFacturaId(idFactura: string): Promise<ProductoFactura[]> {
    const [detalles] = await pool.query<DetalleRow[]>(
      `SELECT nombre_producto, precio_unitario, cantidad, subtotal
       FROM detalle_factura
       WHERE id_factura = ?`,
      [idFactura]
    );

    return detalles.map((item:any) => ({
      nombre_producto: item.nombre_producto,
      precio_unitario: Number(item.precio_unitario),
      cantidad: Number(item.cantidad),
      subtotal: Number(item.subtotal),
    }));
  }

  static async crearFactura(input: CreateFacturaInput): Promise<Factura> {
    const {
      id_usuario,
      nombre_usuario,
      correo_usuario,
      productos,
      estado = "PAGADA",
      dias_vencimiento = 7,
    } = input;

    if (!id_usuario || !nombre_usuario || !correo_usuario) {
      throw new FacturaServiceError(
        "Faltan datos obligatorios de usuario (id_usuario, nombre_usuario, correo_usuario)"
      );
    }

    if (!Array.isArray(productos) || productos.length === 0) {
      throw new FacturaServiceError("La factura debe incluir al menos un producto");
    }

    const productosNormalizados = productos.map((item) => {
      const precio = Number(item.precio_unitario);
      const cantidad = Number(item.cantidad);

      if (!item.nombre_producto || !Number.isFinite(precio) || !Number.isFinite(cantidad) || cantidad <= 0) {
        throw new FacturaServiceError("Cada producto debe incluir nombre_producto, precio_unitario y cantidad válidos");
      }

      const subtotalCalculado = Number.isFinite(Number(item.subtotal))
        ? Number(item.subtotal)
        : precio * cantidad;

      return {
        nombre_producto: item.nombre_producto,
        precio_unitario: this.toMoney(precio),
        cantidad: Math.trunc(cantidad),
        subtotal: this.toMoney(subtotalCalculado),
      };
    });

    const total_productos = productosNormalizados.reduce((acc, p) => acc + p.cantidad, 0);
    const valor_total = this.toMoney(productosNormalizados.reduce((acc, p) => acc + p.subtotal, 0));

    const id = randomUUID();
    const fechaEmision = new Date();
    const fechaVencimiento = new Date(fechaEmision);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + dias_vencimiento);

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.query<ResultSetHeader>(
        `INSERT INTO facturas (
            id, id_usuario, nombre_usuario, correo_usuario, total_productos,
            valor_total, fecha_emision, fecha_vencimiento, estado
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          id_usuario,
          nombre_usuario,
          correo_usuario,
          total_productos,
          valor_total,
          fechaEmision,
          fechaVencimiento,
          estado,
        ]
      );

      for (const producto of productosNormalizados) {
        await connection.query<ResultSetHeader>(
          `INSERT INTO detalle_factura (
            id_factura, nombre_producto, precio_unitario, cantidad, subtotal
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            producto.nombre_producto,
            producto.precio_unitario,
            producto.cantidad,
            producto.subtotal,
          ]
        );
      }

      await connection.commit();

      return {
        id,
        id_usuario,
        nombre_usuario,
        correo_usuario,
        productos: productosNormalizados,
        total_productos,
        valor_total,
        fecha_emision: fechaEmision.toISOString(),
        fecha_vencimiento: fechaVencimiento.toISOString(),
        estado,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async obtenerFacturaPorId(id: string): Promise<Factura> {
    const [facturas] = await pool.query<FacturaRow[]>(
      `SELECT id, id_usuario, nombre_usuario, correo_usuario, total_productos,
              valor_total, fecha_emision, fecha_vencimiento, estado
       FROM facturas
       WHERE id = ?`,
      [id]
    );

    const factura = facturas[0];
    if (!factura) {
      throw new FacturaServiceError("Factura no encontrada", 404);
    }

    const productos = await this.getDetallesByFacturaId(id);
    return this.mapFactura(factura, productos);
  }

  static async obtenerFacturasPorUsuario(idUsuario: string): Promise<Factura[]> {
    const [facturas] = await pool.query<FacturaRow[]>(
      `SELECT id, id_usuario, nombre_usuario, correo_usuario, total_productos,
              valor_total, fecha_emision, fecha_vencimiento, estado
       FROM facturas
       WHERE id_usuario = ?
       ORDER BY fecha_emision DESC`,
      [idUsuario]
    );

    const resultado: Factura[] = [];
    for (const factura of facturas) {
      const productos = await this.getDetallesByFacturaId(factura.id);
      resultado.push(this.mapFactura(factura, productos));
    }

    return resultado;
  }

  static async enviarFacturaPorCorreo(id: string): Promise<{ factura: Factura; notificacion: unknown }> {
    const factura = await this.obtenerFacturaPorId(id);
    const notificacionesUrl = `${this.getNotificacionesBaseUrl()}/`;

    const mensaje = [
      `Factura ${factura.id}`,
      `Cliente: ${factura.nombre_usuario} (${factura.correo_usuario})`,
      `Total: ${factura.valor_total}`,
      `Estado: ${factura.estado}`,
      `Productos: ${factura.productos.map((p) => `${p.nombre_producto} x${p.cantidad}`).join(", ")}`,
    ].join(" | ");

    try {
      const { data } = await axios.post(
        notificacionesUrl,
        {
          tipo_de_notificacion: "correo_electronico",
          mensaje,
        },
        { timeout: 10000 }
      );

      return { factura, notificacion: data };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status ?? 502;
        const detail =
          typeof error.response?.data === "string"
            ? error.response.data
            : JSON.stringify(error.response?.data ?? { message: "Error al conectar con notificaciones" });
        throw new FacturaServiceError(`No se pudo enviar la notificación de correo: ${detail}`, status);
      }

      throw new FacturaServiceError("No se pudo enviar la notificación de correo", 500);
    }
  }
}
