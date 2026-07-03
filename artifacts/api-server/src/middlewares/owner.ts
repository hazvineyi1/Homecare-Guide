import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { SESSION_COOKIE } from "../lib/auth";
import { logger } from "../lib/logger";

export const OWNER_COOKIE = "hg_owner";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === "production";

/**
 * Resolves identity for every request.
 *  - If a signed `hg_session` cookie is present, the learner is logged in:
 *    `req.userId` is set and `req.ownerId` is the same user id, so every
 *    existing owner-scoped conversation query keeps working unchanged.
 *  - Otherwise it is an anonymous guest (free-taster flow): `req.ownerId` is a
 *    per-browser opaque id (minted on first visit). No account required.
 */
export function ownerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const session = req.signedCookies?.[SESSION_COOKIE];
  if (typeof session === "string" && session.length > 0) {
    req.userId = session;
    req.ownerId = session;
    next();
    return;
  }

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
  logger.debug({ ownerId }, "Issued new guest owner id");
  next();
}
