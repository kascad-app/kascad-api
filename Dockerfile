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
    
RUN --mount=type=secret,id=GITHUB_TOKEN \
    sed -i "s|\${GITHUB_TOKEN}|$(cat /run/secrets/GITHUB_TOKEN)|g" .npmrc \
    && pnpm install \
    && rm .npmrc

COPY --chown=node:node package.json pnpm-lock.yaml ./

COPY --chown=node:node . .

RUN pnpm build
RUN pnpm install --prod && npm cache clean --force

###################
# PRODUCTION
###################
FROM base AS production

WORKDIR /usr/src/app

COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

USER node

EXPOSE 8080

CMD [ "node", "dist/main.js" ]