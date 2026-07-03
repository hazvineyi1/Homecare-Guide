import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Password hashing with Node's built-in scrypt — no native module, so it works
// inside the esbuild single-file runtime bundle (no node_modules at runtime).
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(password, salt, 64);
  const known = Buffer.from(hash, "hex");
  return known.length === test.length && timingSafeEqual(known, test);
}

export const SESSION_COOKIE = "hg_session";
const isProduction = process.env.NODE_ENV === "production";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const sessionCookieOptions = {
  httpOnly: true,
  signed: true,
  sameSite: "lax" as const,
  secure: isProduction,
  maxAge: THIRTY_DAYS_MS,
  path: "/",
};

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// A short, human-friendly, hard-to-guess verification code, e.g. HG-7F3K-9QX2.
export function certificateCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const chunk = () =>
    Array.from(randomBytes(4))
      .map((b) => alphabet[b % alphabet.length])
      .join("");
  return `HG-${chunk()}-${chunk()}`;
}
