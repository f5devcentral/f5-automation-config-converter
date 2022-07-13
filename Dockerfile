# syntax = docker/dockerfile:1.3
FROM node:lts-alpine
ENV DOCKER_CONTAINER true
ARG TEEM_CONTEXT
ENV TEEM_API_ENVIRONMENT $TEEM_CONTEXT

RUN ls -als

WORKDIR /app

COPY . .
RUN npm ci --omit=dev
RUN rm -r dependencies
RUN --mount=type=secret,id=TEEM_KEY cp /run/secrets/TEEM_KEY .
RUN chown -R node:node .

USER node
ENTRYPOINT [ "node", "init.js" ]
