# can't build on bun, because of this issue:
# https://github.com/oven-sh/bun/issues/4671
FROM docker.io/node AS base

FROM base AS builder

WORKDIR /build

COPY . .

ENV HUSKY 0
ENV STANDALONE 1

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

RUN pnpm install
RUN pnpm build

FROM base AS runner

WORKDIR /app

COPY --from=builder /build/public ./public

RUN mkdir .next

COPY --from=builder /build/.next/standalone .
COPY --from=builder /build/.next/static ./.next/static

ENV NODE_ENV production

EXPOSE 3000

CMD ["node", "server.js"]