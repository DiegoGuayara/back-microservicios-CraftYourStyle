import type { NextFunction, Request, Response } from "express";
import { getTokenFromAuthHeader, verifyToken } from "../helpers/jwt.helper.js";

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

  if (payload.role !== "ADMIN") {
    return res.status(403).json({ message: "No tienes permisos de administrador" });
  }

  return next();
}
