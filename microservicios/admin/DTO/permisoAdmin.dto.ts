export interface AsignarPermisoDto {
  id_admin: number;
  permiso: string;
}

export interface PermisoAdminDto {
  id: number;
  id_admin: number;
  permiso: string;
  fecha_creacion: Date;
}
