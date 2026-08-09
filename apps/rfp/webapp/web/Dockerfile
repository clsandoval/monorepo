# ---- builder: install + next standalone build ----
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# ---- runner: node + python3 (for the rfp CLI) ----
FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-yaml ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080 \
    RFP_DIR=/rfp \
    RFP_SESSIONS_DIR=/data/sessions \
    RFP_PROMPT_PATH=/app/system-prompt.txt
# next standalone server + assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/lib/system-prompt.txt ./system-prompt.txt
# rfp CLI + baked read-only data (corpus.db, tags.db, profile.md)
COPY rfp-bundle/ /rfp/
EXPOSE 8080
CMD ["node", "server.js"]
