# Stage 1: Build React app
FROM node:22-alpine AS frontend
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# Stage 2: Server + static assets
FROM node:22-alpine

# claude-code binary is required by @anthropic-ai/claude-agent-sdk at runtime
# (the SDK spawns it as a subprocess)
RUN npm i -g @anthropic-ai/claude-code

WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/ .
RUN npm run build

# Copy frontend build into public/
COPY --from=frontend /app/client/dist ./public

EXPOSE 8080
CMD ["node", "dist/index.js"]
