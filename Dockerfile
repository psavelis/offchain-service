ARG DOCKER_REPOSITORY=''

FROM --platform=linux/amd64 ${DOCKER_REPOSITORY}node:16.18

COPY ./ /var/www

WORKDIR /var/www

RUN npm install

RUN npm run build

RUN npm prune --production



FROM --platform=linux/amd64 ${DOCKER_REPOSITORY}node:16.18-alpine

ENV NODE_ENV=production
ENV APP_NAME=offchain-purchase-service-dev
ENV API_ENTRYPOINT=v1/purchases
ENV API_PORT=3000
ENV API_HOST=localhost
ENV CORS_ORIGIN=*
ENV QUOTE_EXPIRATION_SECONDS=3600
ENV PERSIST_QUOTES=false
ENV RPC_NETWORK=eth-mainnet
ENV LOAD_ADAPTERS=rest-api,clearing-cron,settlement-cron
ENV LOG_LEVEL=info

WORKDIR /var/www

COPY --from=0 /var/www/package.json /var/www/package.json
COPY --from=0 /var/www/package-lock.json /var/www/package-lock.json
COPY --from=0 /var/www/node_modules /var/www/node_modules
COPY --from=0 /var/www/dist /var/www/dist

EXPOSE 3000

HEALTHCHECK --timeout=10s --start-period=30s --retries=5 CMD npm run healthcheck:prod || exit 1

CMD node dist/main.js
