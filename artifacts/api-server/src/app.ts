import path from "node:path";
import fs from "node:fs";
import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import seoRouter from "./routes/seo";
import { logger } from "./lib/logger";
import { ownerMiddleware } from "./middlewares/owner";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Secret used to sign the owner cookie. Required in production so that owner
 * ids cannot be forged; a fixed dev fallback keeps local runs frictionless.
 */
const cookieSecret = process.env.COOKIE_SECRET;
if (isProduction && !cookieSecret) {
  throw new Error(
    "COOKIE_SECRET environment variable is required in production but was not provided.",
  );
}

/**
 * Allowed browser origin(s) for credentialed (cookie-bearing) requests.
 * For the single-service deploy the frontend is same-origin, so this can stay
 * unset. Set CORS_ORIGIN (comma-separated) only if the frontend is hosted
 * elsewhere.
 */
const corsOrigins = process.env.CORS_ORIGIN?.split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const app: Express = express();

// Behind Railway's proxy; needed for secure cookies and correct client IPs.
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Baseline security headers plus a tuned Content-Security-Policy. The SPA and the
// server-rendered SEO pages need: same-origin scripts and streaming (SSE) fetch,
// Google Fonts (googleapis for the stylesheet, gstatic for the font files),
// inline styles (React sets style attributes; SEO pages use inline <style>), and
// data: URIs (Vite inlines small assets). Everything else is locked down.
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": ["'self'"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "frame-ancestors": ["'self'"],
        "form-action": ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: "same-origin" },
  }),
);

app.use(
  cors({
    origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  }),
);
app.use(cookieParser(cookieSecret ?? "dev-insecure-cookie-secret"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(ownerMiddleware);

app.use("/api", router);

// Crawlable, server-rendered SEO pages (/topics, /topics/:slug, /sitemap.xml).
// Mounted before the static + SPA fallback so these paths render real HTML.
app.use(seoRouter);

// ---------------------------------------------------------------------------
// Single-service deploy: serve the built tutor frontend from this same server
// so the SPA and the API share one origin (cookies + relative /api "just work").
// STATIC_DIR defaults to ./public relative to the process working directory.
// ---------------------------------------------------------------------------
const staticDir = process.env.STATIC_DIR
  ? path.resolve(process.env.STATIC_DIR)
  : path.resolve(process.cwd(), "public");

if (fs.existsSync(path.join(staticDir, "index.html"))) {
  app.use(express.static(staticDir));

  // SPA fallback: any non-API GET that isn't a real file returns index.html.
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(staticDir, "index.html"));
  });
  logger.info({ staticDir }, "Serving frontend static assets");
} else {
  logger.warn({ staticDir }, "No frontend build found; serving API only");
}

export default app;
