import { jwtDecode } from "jwt-decode";
import jwt from "jsonwebtoken";

export interface AdminJwtPayload {
  sub?: string;
  role?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export function getTokenFromAuthHeader(authorization?: string): string | null {
  if (!authorization) return null;
  if (!authorization.startsWith("Bearer ")) return null;
  const token = authorization.slice(7).trim();
  return token.length > 0 ? token : null;
}

export function decodeToken(token: string): AdminJwtPayload {
  return jwtDecode<AdminJwtPayload>(token);
}

export function verifyToken(token: string, secret: string): AdminJwtPayload | null {
  try {
    return jwt.verify(token, secret) as AdminJwtPayload;
  } catch {
    return null;
  }
}

export function getRoleFromAuthHeader(authorization?: string): string | null {
  const token = getTokenFromAuthHeader(authorization);
  if (!token) return null;

  try {
    const payload = decodeToken(token);
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}
