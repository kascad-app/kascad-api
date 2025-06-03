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

# Argument pour injecter le token GitHub depuis Cloud Build
ARG GITHUB_TOKEN

# Crée un .npmrc local avec le token
RUN echo "@kascad-app:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

# Copy uniquement les fichiers de dépendances
COPY --chown=node:node package.json pnpm-lock.yaml ./

# Installer les dépendances
RUN pnpm install --frozen-lockfile

RUN rm -f .npmrc


# Copier le reste du code
COPY --chown=node:node . .

# Build de l'app
RUN pnpm build

###################
# PRODUCTION
###################
FROM base AS production

WORKDIR /usr/src/app

ARG GITHUB_TOKEN

# Crée un .npmrc local avec le token pour install prod-only
RUN echo "@kascad-app:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

# Copy uniquement les fichiers nécessaires
COPY --chown=node:node package.json pnpm-lock.yaml ./

# Installer uniquement les dépendances de production
RUN pnpm install --prod --frozen-lockfile

RUN rm -f .npmrc


# Copier l'app buildée depuis le builder
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

USER node

EXPOSE 8080

CMD [ "node", "dist/main.js" ]
