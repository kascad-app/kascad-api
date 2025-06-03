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

COPY --chown=node:node package.json pnpm-lock.yaml ./

ARG GITHUB_TOKEN
RUN echo "=== DEBUG: Checking token and registry configuration ===" && \
    echo "Token length: ${#GITHUB_TOKEN}" && \
    echo "Token first 10 chars: $(echo $GITHUB_TOKEN | cut -c1-10)" && \
    echo "@kascad-app:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc && \
    echo "registry=https://registry.npmjs.org/" >> .npmrc && \
    echo "=== DEBUG: .npmrc content ===" && \
    cat .npmrc && \
    echo "=== DEBUG: Testing GitHub registry access ===" && \
    curl -H "Authorization: Bearer ${GITHUB_TOKEN}" \
         -H "Accept: application/vnd.npm.install-v1+json" \
         https://npm.pkg.github.com/@kascad-app/shared-types || echo "Curl test failed" && \
    echo "=== DEBUG: Running pnpm install ===" && \
    pnpm install && \
    rm .npmrc

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