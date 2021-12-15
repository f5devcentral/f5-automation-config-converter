# syntax = docker/dockerfile:1.3
FROM node:lts-alpine
ENV DOCKER_CONTAINER true
ENV TEEM_API_ENVIRONMENT "production"
WORKDIR /app

COPY . .
RUN npm install --production
RUN --mount=type=secret,id=TEEM_KEY cp /run/secrets/TEEM_KEY .
RUN chown -R node:node .

USER node
ENTRYPOINT [ "node", "init.js" ]
