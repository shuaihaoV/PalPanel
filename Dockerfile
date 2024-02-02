FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV RCON_HOST=""
ENV RCON_PORT=""
ENV RCON_PASSWORD=""
# openssl rand -base64 32
ENV AUTH_SECRET="KnZeOod+UyrBsXZk/HxWlpoolYvuWN7kj90X26/+7+0="
ENV WEB_USERNAME=""
ENV WEB_PASSWORD=""
ENV STEAM_API_KEY=""

RUN yarn build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1
ENV RCON_HOST=""
ENV RCON_PORT=""
ENV RCON_PASSWORD=""
# openssl rand -base64 32
ENV AUTH_SECRET="KnZeOod+UyrBsXZk/HxWlpoolYvuWN7kj90X26/+7+0="
ENV WEB_USERNAME=""
ENV WEB_PASSWORD=""
ENV STEAM_API_KEY=""

RUN mkdir .next

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/server ./.next/server

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]