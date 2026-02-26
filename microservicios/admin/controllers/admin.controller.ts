import type { Request, Response } from "express";
import type { ActualizarAdminDto, CrearAdminDto } from "../DTO/admin.dto.js";
import type { CrearAuditoriaAdminDto } from "../DTO/auditoriaAdmin.dto.js";
import { AdminRepository } from "../repository/admin.repository.js";

export class AdminController {
  static async crearAdmin(req: Request, res: Response) {
    try {
      const { id_usuario, nivel, activo } = req.body as CrearAdminDto;

      if (!id_usuario || Number(id_usuario) <= 0) {
        return res.status(400).json({ message: "id_usuario es obligatorio" });
      }

      const id = await AdminRepository.crearAdmin({
        id_usuario: Number(id_usuario),
        nivel,
        activo,
      });

      return res.status(201).json({ message: "Administrador creado", id });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al crear administrador", error });
    }
  }

  static async obtenerAdmins(_req: Request, res: Response) {
    try {
      const admins = await AdminRepository.obtenerAdmins();
      return res.status(200).json({ message: "Administradores obtenidos", data: admins });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al obtener administradores", error });
    }
  }

  static async obtenerAdminPorId(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const admin = await AdminRepository.obtenerAdminPorId(id);

      if (!admin) {
        return res.status(404).json({ message: "Administrador no encontrado" });
      }

      return res.status(200).json({ message: "Administrador obtenido", data: admin });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al obtener administrador", error });
    }
  }

  static async actualizarAdmin(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const data = req.body as ActualizarAdminDto;

      const result = await AdminRepository.actualizarAdminPorId(id, data);
      if (!result) {
        return res.status(400).json({
          message: "No enviaste campos para actualizar (nivel o activo)",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Administrador no encontrado" });
      }

      return res.status(200).json({ message: "Administrador actualizado" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al actualizar administrador", error });
    }
  }

  static async eliminarAdmin(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const result = await AdminRepository.eliminarAdminPorId(id);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Administrador no encontrado" });
      }

      return res.status(200).json({ message: "Administrador eliminado" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al eliminar administrador", error });
    }
  }

  static async asignarPermiso(req: Request, res: Response) {
    try {
      const { id_admin, permiso } = req.body as {
        id_admin: number;
        permiso: string;
      };

      if (!id_admin || !permiso?.trim()) {
        return res
          .status(400)
          .json({ message: "id_admin y permiso son obligatorios" });
      }

      const result = await AdminRepository.asignarPermiso(
        Number(id_admin),
        permiso.trim()
      );

      if (result.affectedRows === 0) {
        return res.status(200).json({ message: "El permiso ya existia para este admin" });
      }

      return res.status(201).json({ message: "Permiso asignado" });
    } catch (error) {
      return res.status(500).json({ message: "Error al asignar permiso", error });
    }
  }

  static async eliminarPermiso(req: Request, res: Response) {
    try {
      const id_admin = Number(req.params.id_admin);
      const permisoParam = req.params.permiso;
      const permiso = Array.isArray(permisoParam) ? permisoParam[0] : permisoParam;

      if (!permiso?.trim()) {
        return res.status(400).json({ message: "permiso es obligatorio" });
      }

      const result = await AdminRepository.eliminarPermiso(id_admin, permiso);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Permiso no encontrado para este admin" });
      }

      return res.status(200).json({ message: "Permiso eliminado" });
    } catch (error) {
      return res.status(500).json({ message: "Error al eliminar permiso", error });
    }
  }

  static async obtenerPermisosPorAdmin(req: Request, res: Response) {
    try {
      const id_admin = Number(req.params.id_admin);
      const permisos = await AdminRepository.obtenerPermisosPorAdmin(id_admin);
      return res.status(200).json({ message: "Permisos obtenidos", data: permisos });
    } catch (error) {
      return res.status(500).json({ message: "Error al obtener permisos", error });
    }
  }

  static async registrarAuditoria(req: Request, res: Response) {
    try {
      const body = req.body as CrearAuditoriaAdminDto;
      const { id_admin, accion, entidad, id_entidad, detalle } = body;

      if (!id_admin || !accion?.trim() || !entidad?.trim()) {
        return res.status(400).json({
          message: "id_admin, accion y entidad son obligatorios",
        });
      }

      const ip = req.ip || null;
      const navegador = req.get("user-agent") || null;

      const id = await AdminRepository.registrarAuditoria({
        id_admin: Number(id_admin),
        accion: accion.trim(),
        entidad: entidad.trim(),
        id_entidad: id_entidad ?? null,
        detalle: detalle ?? null,
        ip,
        navegador,
      });

      return res.status(201).json({ message: "Auditoria registrada", id });
    } catch (error) {
      return res.status(500).json({ message: "Error al registrar auditoria", error });
    }
  }

  static async obtenerAuditoria(req: Request, res: Response) {
    try {
      const id_admin = req.params.id_admin ? Number(req.params.id_admin) : undefined;
      const limite = req.query.limite ? Number(req.query.limite) : 100;
      const auditoria = await AdminRepository.obtenerAuditoria(id_admin, limite);
      return res.status(200).json({ message: "Auditoria obtenida", data: auditoria });
    } catch (error) {
      return res.status(500).json({ message: "Error al obtener auditoria", error });
    }
  }
}
