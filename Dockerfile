# can't build on latest node version v21.0.0, because of this issue:
# https://github.com/nodejs/node/issues/50269
# neither on bun, because of this issue:
# https://github.com/oven-sh/bun/issues/4671
FROM docker.io/node:20-alpine AS base

FROM base AS builder

WORKDIR /build

COPY . .

ENV HUSKY 0

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

RUN pnpm install
RUN pnpm build

FROM base AS runner

WORKDIR /app

RUN mkdir .next

COPY --from=builder /build/public .
COPY --from=builder /build/.next/standalone .
COPY --from=builder /build/.next/static ./.next/static

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV HOSTNAME "0.0.0.0"

EXPOSE 3000

CMD ["node", "server.js"]