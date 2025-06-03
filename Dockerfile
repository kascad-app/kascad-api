###################
# BASE IMAGE
###################
FROM node:22-alpine AS base

RUN npm i -g pnpm@latest

###################
# BUILD FOR PRODUCTION
###################
FROM base AS builder

WORKDIR /usr/src/app

ARG GITHUB_TOKEN

RUN echo "@kascad-app:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "always-auth=false" >> .npmrc


COPY --chown=node:node package.json pnpm-lock.yaml ./

RUN echo "📦 .npmrc content:" && cat .npmrc


RUN pnpm install --frozen-lockfile

RUN rm -f .npmrc

COPY --chown=node:node . .

RUN pnpm build

###################
# PRODUCTION
###################
FROM base AS production

WORKDIR /usr/src/app

ARG GITHUB_TOKEN

RUN echo "@kascad-app:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "always-auth=false" >> .npmrc


COPY --chown=node:node package.json pnpm-lock.yaml ./

RUN echo "📦 .npmrc content:" && cat .npmrc

RUN pnpm install --prod --frozen-lockfile

RUN rm -f .npmrc


COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

USER node

EXPOSE 8080

CMD [ "node", "dist/main.js" ]
