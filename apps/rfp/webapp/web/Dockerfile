# ---- builder: node22 + npm ci, next standalone build (bun crashes on the depot builder CPU) ----
FROM node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# ---- runner: node22 + python3 (for the rfp CLI) ----
FROM node:22-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-yaml ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080 \
    RFP_DIR=/rfp \
    RFP_SESSIONS_DIR=/data/sessions \
    RFP_PROMPT_PATH=/app/system-prompt.txt
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/lib/system-prompt.txt ./system-prompt.txt
COPY rfp-bundle/ /rfp/
EXPOSE 8080
CMD ["node", "server.js"]
