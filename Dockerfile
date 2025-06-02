FROM node:23-alpine AS pnpm-23-alpine

RUN npm install -g pnpm

FROM pnpm-23-alpine

WORKDIR /kascad-api

COPY package.json .
COPY pnpm-lock.yaml .
COPY tsconfig.json .
COPY .npmrc .

RUN --mount=type=secret,id=GITHUB_TOKEN \
    sed -i "s|\${GITHUB_TOKEN}|$(cat /run/secrets/GITHUB_TOKEN)|g" .npmrc \
    && pnpm install \
    && rm .npmrc

COPY ./src ./src

RUN pnpm build

ENTRYPOINT ["pnpm", "start:prod"]