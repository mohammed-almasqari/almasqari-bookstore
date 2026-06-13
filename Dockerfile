# ============================================================================
#  متجر الكتب الرقمية — صورة Docker للإنتاج (Next.js + Prisma)
#  بناء متعدد المراحل: تثبيت الاعتماديات، البناء، ثم التشغيل.
# ============================================================================

FROM node:20-alpine AS base
# openssl و libc6-compat مطلوبة لـ Prisma على alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---------- المرحلة 1: الاعتماديات ----------
FROM base AS deps
COPY package.json package-lock.json* ./
# مخطط Prisma مطلوب لأن postinstall يشغّل prisma generate
COPY prisma ./prisma
# يستخدم npm ci إن وُجد ملف القفل، وإلا npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install --no-audit --no-fund; fi

# ---------- المرحلة 2: البناء ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prisma generate + next build (انظر سكربت build في package.json)
RUN npm run build

# ---------- المرحلة 3: التشغيل ----------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# مستخدم غير جذري للأمان
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/prisma ./prisma

# مجلد الملفات المرفوعة (يُربط بحجم دائم في docker-compose)
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads /app/.next

USER nextjs
EXPOSE 3000

# عند الإقلاع: تطبيق ترحيلات قاعدة البيانات ثم تشغيل الخادم
CMD ["npm", "run", "start"]
