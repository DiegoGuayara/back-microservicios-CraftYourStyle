import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type {
  ActualizarAdminDto,
  AdminResponseDto,
  CrearAdminDto,
} from "../DTO/admin.dto.js";
import type { CrearAuditoriaAdminDto } from "../DTO/auditoriaAdmin.dto.js";
import { pool } from "../config/db-config.js";

type AdminRow = RowDataPacket & AdminResponseDto;
type PermisoRow = RowDataPacket & {
  id: number;
  id_admin: number;
  permiso: string;
  fecha_creacion: Date;
};
type AuditoriaRow = RowDataPacket & {
  id: number;
  id_admin: number;
  accion: string;
  entidad: string;
  id_entidad: number | null;
  detalle: unknown;
  ip: string | null;
  navegador: string | null;
  fecha_creacion: Date;
};

export class AdminRepository {
  static async crearAdmin(dto: CrearAdminDto) {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO administradores (id_usuario, nivel, activo)
       VALUES (?, ?, ?)`,
      [dto.id_usuario, dto.nivel ?? "admin", dto.activo ?? true]
    );

    return result.insertId;
  }

  static async obtenerAdmins() {
    const [rows] = await pool.query<AdminRow[]>(
      `SELECT id, id_usuario, nivel, activo, fecha_creacion, fecha_actualizacion
       FROM administradores
       ORDER BY id DESC`
    );
    return rows;
  }

  static async obtenerAdminPorId(id: number) {
    const [rows] = await pool.query<AdminRow[]>(
      `SELECT id, id_usuario, nivel, activo, fecha_creacion, fecha_actualizacion
       FROM administradores
       WHERE id = ?`,
      [id]
    );
    return rows[0] ?? null;
  }

  static async actualizarAdminPorId(id: number, dto: ActualizarAdminDto) {
    const updates: string[] = [];
    const values: Array<string | boolean | number> = [];

    if (dto.nivel !== undefined) {
      updates.push("nivel = ?");
      values.push(dto.nivel);
    }

    if (dto.activo !== undefined) {
      updates.push("activo = ?");
      values.push(dto.activo);
    }

    if (updates.length === 0) return null;

    values.push(id);
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE administradores
       SET ${updates.join(", ")}
       WHERE id = ?`,
      values
    );
    return result;
  }

  static async eliminarAdminPorId(id: number) {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM administradores WHERE id = ?",
      [id]
    );
    return result;
  }

  static async asignarPermiso(id_admin: number, permiso: string) {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT IGNORE INTO permisos_administradores (id_admin, permiso)
       VALUES (?, ?)`,
      [id_admin, permiso]
    );
    return result;
  }

  static async eliminarPermiso(id_admin: number, permiso: string) {
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM permisos_administradores
       WHERE id_admin = ? AND permiso = ?`,
      [id_admin, permiso]
    );
    return result;
  }

  static async obtenerPermisosPorAdmin(id_admin: number) {
    const [rows] = await pool.query<PermisoRow[]>(
      `SELECT id, id_admin, permiso, fecha_creacion
       FROM permisos_administradores
       WHERE id_admin = ?
       ORDER BY id DESC`,
      [id_admin]
    );
    return rows;
  }

  static async registrarAuditoria(dto: CrearAuditoriaAdminDto) {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO auditoria_administradores
       (id_admin, accion, entidad, id_entidad, detalle, ip, navegador)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        dto.id_admin,
        dto.accion,
        dto.entidad,
        dto.id_entidad ?? null,
        dto.detalle ? JSON.stringify(dto.detalle) : null,
        dto.ip ?? null,
        dto.navegador ?? null,
      ]
    );
    return result.insertId;
  }

  static async obtenerAuditoria(id_admin?: number, limite = 100) {
    if (id_admin) {
      const [rows] = await pool.query<AuditoriaRow[]>(
        `SELECT id, id_admin, accion, entidad, id_entidad, detalle, ip, navegador, fecha_creacion
         FROM auditoria_administradores
         WHERE id_admin = ?
         ORDER BY id DESC
         LIMIT ?`,
        [id_admin, limite]
      );
      return rows;
    }

    const [rows] = await pool.query<AuditoriaRow[]>(
      `SELECT id, id_admin, accion, entidad, id_entidad, detalle, ip, navegador, fecha_creacion
       FROM auditoria_administradores
       ORDER BY id DESC
       LIMIT ?`,
      [limite]
    );
    return rows;
  }
}
