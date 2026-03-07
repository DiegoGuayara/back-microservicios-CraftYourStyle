import type { NextFunction, Request, Response } from "express";
import { getTokenFromAuthHeader, verifyToken } from "../helpers/jwt.helper.js";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        sub?: string;
        role?: string;
        id?: string;
        userId?: string;
        usuarioId?: string;
        [key: string]: unknown;
      };
    }
  }
}

export function requireAuthenticated(req: Request, res: Response, next: NextFunction) {
  const token = getTokenFromAuthHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ message: "Token inválido o faltante" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "JWT_SECRET no configurado en admin" });
  }

  const payload = verifyToken(token, secret);
  if (!payload) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }

  req.auth = payload;
  return next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = getTokenFromAuthHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ message: "Token inválido o faltante" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "JWT_SECRET no configurado en admin" });
  }

  const payload = verifyToken(token, secret);
  if (!payload) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }

  req.auth = payload;

  const normalizedRole =
    typeof payload.role === "string" ? payload.role.toUpperCase().trim() : "";

  if (normalizedRole !== "ADMIN") {
    return res.status(403).json({ message: "No tienes permisos de administrador" });
  }

  return next();
}
