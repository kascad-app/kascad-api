FROM base AS production
WORKDIR /usr/src/app

ARG GITHUB_TOKEN_GCP

# Inject .npmrc pour GitHub Packages
RUN echo "@kascad-app:registry=https://npm.pkg.github.com" > .npmrc \
  && echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN_GCP}" >> .npmrc

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile && rm .npmrc

COPY --from=builder /usr/src/app/dist ./dist

USER node
EXPOSE 8080
CMD ["node", "dist/main.js"]
