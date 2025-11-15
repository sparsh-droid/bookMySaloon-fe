# Dockerfile — multi-stage build (recommended)
# Builder (install dev deps, build)
FROM node:18-bullseye AS builder
WORKDIR /app

# Copy package files and install ALL deps (dev + prod)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Runner (production image with only prod deps)
FROM node:18-bullseye AS runner
WORKDIR /app

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT 5000
EXPOSE 5000

# Simple health check (optional)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget -qO- --timeout=2 http://127.0.0.1:${PORT}/health || exit 1

# Start the app (assumes "start": "node dist/server.js")
CMD ["npm", "start"]

