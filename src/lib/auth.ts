import crypto from "crypto";
import { cookies } from "next/headers";
import type { Role } from "@/lib/domain";

const SESSION_COOKIE = "nuoiheo_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

type SessionTokenPayload = {
  userId: string;
  role: Role;
  fullName: string;
  exp: number;
};

function getSecret(): string {
  return process.env.SESSION_SECRET || "dev_only_secret_change_me";
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(payloadPart: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payloadPart).digest("base64url");
}

export function createSessionToken(data: Omit<SessionTokenPayload, "exp">): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload: SessionTokenPayload = { ...data, exp };
  const payloadPart = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadPart);
  return `${payloadPart}.${signature}`;
}

export function verifySessionToken(token: string): SessionTokenPayload | null {
  const [payloadPart, signature] = token.split(".");
  if (!payloadPart || !signature) return null;
  if (sign(payloadPart) !== signature) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadPart)) as SessionTokenPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setSessionCookie(data: Omit<SessionTokenPayload, "exp">): void {
  const token = createSessionToken(data);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE
  });
}

export function clearSessionCookie(): void {
  cookies().delete(SESSION_COOKIE);
}

export function getSession(): SessionTokenPayload | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function hasRole(sessionRole: Role, allowed: Role[]): boolean {
  return allowed.includes(sessionRole);
}
