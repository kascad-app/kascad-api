FROM node:22-alpine AS base
RUN npm i -g pnpm@latest

FROM base AS builder
WORKDIR /usr/src/app

COPY .npmrc .npmrc
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile && rm .npmrc
COPY . .

RUN pnpm build

FROM base AS production
WORKDIR /usr/src/app

COPY .npmrc .npmrc
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile && rm .npmrc

COPY --from=builder /usr/src/app/dist ./dist

USER node
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/main.js"]
