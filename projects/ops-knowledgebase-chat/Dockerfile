# Stage 1: Build React app
FROM node:22-alpine AS frontend
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# Stage 2: Server + static assets
FROM node:22-alpine

# bash is required — claude-code CLI needs a POSIX shell environment
# Alpine only ships ash (/bin/sh) which claude-code doesn't detect
RUN apk add --no-cache bash

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

# Run as non-root user — claude-code SDK refuses --dangerously-skip-permissions as root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup -s /bin/bash \
    && chown -R appuser:appgroup /app \
    && mkdir -p /workspace && chown appuser:appgroup /workspace \
    && mkdir -p /home/appuser && chown appuser:appgroup /home/appuser

# Install superpowers plugin for claude-code agent
COPY .claude-setup/plugins /home/appuser/.claude/plugins
COPY .claude-setup/settings.json /home/appuser/.claude/settings.json
RUN chown -R appuser:appgroup /home/appuser/.claude

# Entrypoint fixes volume perms (mounted as root) then drops to appuser
RUN printf '#!/bin/bash\nchown appuser:appgroup /workspace 2>/dev/null\nexec su -s /bin/bash appuser -c "export HOME=/home/appuser SHELL=/bin/bash && node /app/dist/index.js"\n' > /app/entrypoint.sh \
    && chmod +x /app/entrypoint.sh

EXPOSE 8080
CMD ["/app/entrypoint.sh"]
