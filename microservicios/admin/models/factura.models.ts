export interface ProductoFactura {
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

export interface Factura {
  id: string;
  id_usuario: string;
  nombre_usuario: string;
  correo_usuario: string;
  productos: ProductoFactura[];
  total_productos: number;
  valor_total: number;
  fecha_emision: string;
  fecha_vencimiento: string;
  estado: 'PENDIENTE' | 'PAGADA' | 'VENCIDA';
  // Campos de compatibilidad para UI de pedidos en frontend
  customerName?: string;
  customerEmail?: string;
  date?: string;
  items?: number;
  total?: number;
  status?: "confirmado" | "enviado" | "pendiente";
}
