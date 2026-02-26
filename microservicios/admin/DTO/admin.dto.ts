export type NivelAdmin = "admin" | "superadmin";

export interface CrearAdminDto {
  id_usuario: number;
  nivel?: NivelAdmin;
  activo?: boolean;
}

export interface ActualizarAdminDto {
  nivel?: NivelAdmin;
  activo?: boolean;
}

export interface AdminResponseDto {
  id: number;
  id_usuario: number;
  nivel: NivelAdmin;
  activo: boolean;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}
