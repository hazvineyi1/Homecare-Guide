import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

/**
 * Name of the signed cookie that carries the opaque owner id.
 * The value is signed (HMAC) with COOKIE_SECRET by cookie-parser, so a client
 * cannot forge or tamper with it — they can only present one we issued.
 */
export const OWNER_COOKIE = "hg_owner";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === "production";

/**
 * Resolve (or mint) a per-browser owner id and attach it to `req.ownerId`.
 *
 * This is intentionally lightweight, anonymous "ownership": there is no login,
 * but every conversation is bound to the owner id that created it, and the
 * routes refuse to read or mutate conversations owned by anyone else. That
 * closes the IDOR where any client could read/delete another user's session by
 * guessing its integer id. Swapping this for real accounts later only requires
 * populating `req.ownerId` from an authenticated session instead of a cookie.
 */
export function ownerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const existing = req.signedCookies?.[OWNER_COOKIE];

  if (typeof existing === "string" && existing.length > 0) {
    req.ownerId = existing;
    next();
    return;
  }

  const ownerId = randomUUID();
  res.cookie(OWNER_COOKIE, ownerId, {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: ONE_YEAR_MS,
    path: "/",
  });
  req.ownerId = ownerId;
  logger.debug({ ownerId }, "Issued new owner id");
  next();
}
