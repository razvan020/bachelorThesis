# 1. Build stage
FROM node:20-alpine AS builder

# 1.1 Build args (only these may sit above FROM if used in FROM)
# 1) Declare the build‑time arg
ARG NEXT_PUBLIC_BACKEND_URL

# 2) Export to the runtime ENV (for next.config.js)
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2. Production runtime stage
FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
