# ─── Development stage ───────────────────────────────────────────────────────
FROM node:22-alpine AS dev

WORKDIR /app

# Install dependencies first (layer cache) — use ci for exact, platform-correct install
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source (volume-mounted in dev, so this is mainly for image inspection)
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev"]

# ─── Build stage ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Production stage (served by Nginx) ──────────────────────────────────────
FROM nginx:1.31-alpine AS prod

# Remove default Nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx will be configured at the compose level
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
