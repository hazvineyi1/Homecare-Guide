import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const windowMs = 60 * 1000; // 1 minute

/**
 * Rate limiter for the AI-backed endpoints (session creation and message
 * sending). Each streamed message is a paid model call, so this caps runaway
 * cost and abuse. Keyed by owner id (per browser) when available, falling back
 * to client IP. Override the ceiling with AI_RATE_LIMIT_PER_MIN.
 */
export const aiRateLimiter = rateLimit({
  windowMs,
  limit: Number(process.env.AI_RATE_LIMIT_PER_MIN ?? 20),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) =>
    req.ownerId ?? ipKeyGenerator(req.ip ?? "unknown"),
  message: { error: "Too many requests. Please slow down and try again shortly." },
});
