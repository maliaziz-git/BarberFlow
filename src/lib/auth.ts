import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "barberflow-fallback-secret-development-key-123456";

export interface TokenPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "BARBER";
  name: string;
  barberId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the authenticated user from a NextRequest.
 * Supports both `Authorization: Bearer <token>` (Mobile app) and `barberflow_token` HTTP cookie (Web app).
 */
export async function getAuthUser(req: NextRequest): Promise<TokenPayload | null> {
  let token: string | undefined;

  // 1. Check Authorization Bearer Header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // 2. Check cookies
  if (!token) {
    const cookieToken = req.cookies.get("barberflow_token")?.value;
    if (cookieToken) {
      token = cookieToken;
    }
  }

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  return payload;
}
