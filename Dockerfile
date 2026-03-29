# ---- Build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Run ----
FROM node:20-alpine
WORKDIR /app

# Dépendances de production uniquement
COPY package*.json ./
RUN npm ci --omit=dev

# Frontend compilé (SSR + proxy)
COPY --from=builder /app/dist ./dist

# Backend Express
COPY server ./server

EXPOSE 3000 4000

# Lance l'API Express (3000) et le serveur SSR Angular (4000, proxifie /api → 3000)
CMD node server/index.js & node dist/wefund_dashboard/server/server.mjs
