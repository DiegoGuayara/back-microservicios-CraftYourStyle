export interface CrearAuditoriaAdminDto {
  id_admin: number;
  accion: string;
  entidad: string;
  id_entidad?: number | null;
  detalle?: unknown;
  ip?: string | null;
  navegador?: string | null;
}

export interface AuditoriaAdminDto {
  id: number;
  id_admin: number;
  accion: string;
  entidad: string;
  id_entidad: number | null;
  detalle: unknown;
  ip: string | null;
  navegador: string | null;
  fecha_creacion: Date;
}
