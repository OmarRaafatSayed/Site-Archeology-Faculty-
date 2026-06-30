# ============================================================
# backend/Dockerfile — Multi-stage build
# ============================================================

# ----------------------------------------------------------
# Stage 1: Base — الصورة الأساسية المشتركة
# ----------------------------------------------------------
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ----------------------------------------------------------
# Stage 2: Dependencies — تثبيت الـ packages
# ----------------------------------------------------------
FROM base AS deps
COPY package.json ./
RUN npm install --frozen-lockfile

# ----------------------------------------------------------
# Stage 3: Builder — بناء TypeScript
# ----------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# توليد Prisma Client
RUN npx prisma generate

# Build TypeScript → JavaScript
RUN npm run build

# ----------------------------------------------------------
# Stage 4: Production — الصورة النهائية الصغيرة
# ----------------------------------------------------------
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# نسخ فقط ما يلزم للتشغيل
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

# مجلد الرفع
RUN mkdir -p uploads

# مستخدم غير root للأمان
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs && \
    chown -R expressjs:nodejs /app

USER expressjs

EXPOSE 3001

# تشغيل migrate ثم تشغيل السيرفر
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]
