# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Builder: install the whole pnpm workspace and build both the frontend and
# the API server.
# ---------------------------------------------------------------------------
FROM node:24-bookworm-slim AS builder
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile=false

# Vite's config reads PORT + BASE_PATH at load time, so they must be present
# for the build even though they only matter at runtime for the dev server.
RUN PORT=5000 BASE_PATH=/ NODE_ENV=production pnpm --filter @workspace/tutor run build
RUN NODE_ENV=production pnpm --filter @workspace/api-server run build

# ---------------------------------------------------------------------------
# Runtime: the API server is bundled by esbuild into a self-contained ESM file
# (dependencies inlined), so no node_modules are needed at runtime — just the
# bundle, its pino transport workers, and the built SPA assets.
# ---------------------------------------------------------------------------
FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV STATIC_DIR=/app/public
WORKDIR /app

COPY --from=builder /app/artifacts/api-server/dist ./dist
COPY --from=builder /app/artifacts/tutor/dist/public ./public

# Railway injects PORT; default to 8080 for local `docker run`.
ENV PORT=8080
EXPOSE 8080

CMD ["node", "--enable-source-maps", "dist/index.mjs"]
