FROM node:24.18.0-alpine3.24

RUN apk add --update \
    curl \
    && rm -rf /var/cache/apk/*

WORKDIR /usr/src/app
COPY . /usr/src/app

RUN chmod 755 docker-entrypoint.sh
CMD ["sh", "docker-entrypoint.sh"]
