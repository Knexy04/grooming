FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma schema uses env("DATABASE_URL") in Docker builds; give it a default for generate/build steps.
ENV DATABASE_URL="postgresql://grooming:grooming@postgres:5432/grooming?schema=public"

RUN npm run prisma:generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV="production"
ENV PORT="3000"
ENV DATABASE_URL="postgresql://grooming:grooming@postgres:5432/grooming?schema=public"

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 3000

# Apply migrations on startup
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main.js"]


