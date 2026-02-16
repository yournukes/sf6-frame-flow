# Stage 1: Build frontend and (if present) install server dependencies
FROM node:22 AS builder
WORKDIR /app

# Copy all files from the current directory
COPY . ./

# Placeholder env vars for build-time expectations
RUN echo "API_KEY=PLACEHOLDER" > ./.env \
  && echo "GEMINI_API_KEY=PLACEHOLDER" >> ./.env

# Install server dependencies when a server package exists
RUN if [ -f /app/server/package.json ]; then \
      cd /app/server && npm install; \
    fi

# Install frontend dependencies and build when package.json exists
RUN mkdir -p /app/dist \
  && bash -c 'if [ -f /app/package.json ]; then npm install && npm run build; fi'

# Stage 2: Build runtime image for Cloud Run
FROM node:22
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy server files when they exist
COPY --from=builder /app/server ./

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./dist

# Static file server fallback (used when server.js is absent)
RUN npm install -g serve

EXPOSE 8080

# Prefer a Node server if available; otherwise serve static build
CMD ["sh", "-c", "if [ -f server.js ]; then node server.js; else serve -s dist -l ${PORT:-8080}; fi"]
