# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN npx prisma generate && yarn build

# Stage 2: Production
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production

# Prisma requires openssl on Alpine
RUN apk add --no-cache openssl

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy Prisma generated client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/build ./build
COPY prisma ./prisma

EXPOSE 3000

CMD ["node_modules/.bin/remix-serve", "build/server/index.js"]
