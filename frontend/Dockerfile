# ─── Development stage ───────────────────────────────────────────────────────
FROM node:22-alpine AS dev

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json package-lock.json* ./
RUN npm install

# Copy source (volume-mounted in dev, so this is mainly for image inspection)
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev"]

# ─── Build stage ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Production stage (served by Nginx) ──────────────────────────────────────
FROM nginx:1.27-alpine AS prod

# Remove default Nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx will be configured at the compose level
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
