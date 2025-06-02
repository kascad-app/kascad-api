FROM node:22-alpine AS pnpm-22-alpine

RUN npm install -g pnpm

FROM pnpm-22-alpine

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

EXPOSE 8080

ENTRYPOINT ["pnpm", "start:prod"]