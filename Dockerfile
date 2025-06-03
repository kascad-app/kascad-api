FROM node:22-alpine AS base
RUN npm i -g pnpm@latest

FROM base AS builder
WORKDIR /usr/src/app

ARG GITHUB_TOKEN_GCP
RUN echo "@kascad-app:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN_GCP}" >> .npmrc

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile && rm .npmrc

COPY . .
RUN pnpm build

FROM base AS production
WORKDIR /usr/src/app

ARG GITHUB_TOKEN_GCP
RUN echo "@kascad-app:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN_GCP}" >> .npmrc

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile && rm .npmrc

COPY --from=builder /usr/src/app/dist ./dist

COPY .env .env

USER node
EXPOSE 8080
CMD ["node", "dist/main.js"]
