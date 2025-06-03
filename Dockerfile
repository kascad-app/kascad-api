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

# Copy package files
COPY --chown=node:node package.json pnpm-lock.yaml ./

ARG GITHUB_TOKEN

# Setup npm registry for private packages
RUN echo "@kascad-app:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY --chown=node:node . .

# Build application
RUN pnpm build

###################
# PRODUCTION
###################
FROM base AS production

WORKDIR /usr/src/app

# Copy package files
COPY --chown=node:node package.json pnpm-lock.yaml ./

ARG GITHUB_TOKEN

# Setup npm registry for private packages
RUN echo "@kascad-app:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

USER node

EXPOSE 8080

CMD [ "node", "dist/main.js" ]