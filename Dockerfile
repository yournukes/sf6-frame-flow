# Stage 1: Build frontend assets
FROM node:22 AS builder
WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy source files and build
COPY . ./
RUN npm run build

# Stage 2: Runtime image for Cloud Run
FROM node:22-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Serve static assets
RUN npm install -g serve
COPY --from=builder /app/dist ./dist

EXPOSE 8080
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
