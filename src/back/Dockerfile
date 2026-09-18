# syntax=docker/dockerfile:1.7

ARG BUN_VERSION=1.4.2

FROM oven/bun:${BUN_VERSION}-alpine AS frontend-builder
WORKDIR /app

COPY src/common ./src/common
COPY src/back/assetsDynamiques.ts ./src/back/assetsDynamiques.ts

COPY src/front-cloud/package.json src/front-cloud/bun.lock ./src/front-cloud/
RUN cd src/front-cloud && bun install --frozen-lockfile
COPY src/front-cloud ./src/front-cloud
RUN cd src/front-cloud && bun run build

COPY src/front-editeur/package.json src/front-editeur/bun.lock ./src/front-editeur/
RUN cd src/front-editeur && bun install --frozen-lockfile
COPY src/front-editeur ./src/front-editeur
RUN cd src/front-editeur && bun run build

FROM oven/bun:${BUN_VERSION}-alpine AS backend-dependencies
WORKDIR /app/src/back
COPY src/back/package.json src/back/bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:${BUN_VERSION}-alpine AS runtime

ARG OCI_SOURCE="https://github.com/Bing-Chill-inc/Algoforge-main"
ARG OCI_REVISION="unknown"
ARG OCI_VERSION="development"

LABEL org.opencontainers.image.title="AlgoForge" \
      org.opencontainers.image.description="Self-hosted AlgoForge web editor and cloud workspace" \
      org.opencontainers.image.source="${OCI_SOURCE}" \
      org.opencontainers.image.url="${OCI_SOURCE}" \
      org.opencontainers.image.revision="${OCI_REVISION}" \
      org.opencontainers.image.version="${OCI_VERSION}" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app

COPY --chown=bun:bun src/back ./src/back
COPY --chown=bun:bun src/common ./src/common
COPY --chown=bun:bun --from=backend-dependencies /app/src/back/node_modules ./src/back/node_modules
COPY --chown=bun:bun --from=frontend-builder /app/src/front-cloud/dist ./src/front-cloud/dist
COPY --chown=bun:bun --from=frontend-builder /app/src/front-editeur/out ./src/front-editeur/out
COPY --chown=bun:bun src/front-editeur/src/Bibliotheque ./src/front-editeur/src/Bibliotheque

RUN mkdir -p /app/data/algos /app/logs && chown -R bun:bun /app/data /app/logs

ENV PORT=5205 \
    BUILD=prod \
    PREBUILT_FRONTENDS=true \
    DATABASE_TYPE=sqlite \
    DATABASE_NAME=/app/data/algoforge.sqlite \
    MAIL_ACTIVE=false \
    RETRY_MANY_TIMES=3 \
    QUOTA_ALGO=500 \
    DEBUG=false \
    DEBUG_LEVEL=0

VOLUME ["/app/data", "/app/logs"]
EXPOSE 5205/tcp

USER bun
WORKDIR /app/src/back

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD bun -e 'fetch(`http://127.0.0.1:${process.env.PORT || 5205}/edit/`).then((response) => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1));'

CMD ["bun", "index.ts"]
