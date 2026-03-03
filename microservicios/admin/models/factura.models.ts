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
}