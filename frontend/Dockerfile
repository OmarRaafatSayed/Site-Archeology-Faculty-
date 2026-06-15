# ============================================================
# frontend/Dockerfile — Next.js 14 Multi-stage build
# ============================================================

# ----------------------------------------------------------
# Stage 1: Base
# ----------------------------------------------------------
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ----------------------------------------------------------
# Stage 2: Dependencies
# ----------------------------------------------------------
FROM base AS deps
COPY package.json ./
RUN npm install --frozen-lockfile

# ----------------------------------------------------------
# Stage 3: Builder
# ----------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js — standalone output للـ production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ----------------------------------------------------------
# Stage 4: Production — صورة صغيرة مع standalone
# ----------------------------------------------------------
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# مستخدم غير root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# نسخ الـ standalone build (يتطلب output: 'standalone' في next.config)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
