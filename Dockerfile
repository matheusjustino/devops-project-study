FROM node:21.1.0-alpine AS builder

# Create app directory
WORKDIR /app

COPY package*.json ./

# Install app dependencies
RUN yarn install

COPY . .

RUN yarn build



FROM node:21.1.0-alpine

WORKDIR /app

RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
	bash

COPY --from=builder /app/package*.json ./

RUN yarn cache clean && yarn install --prod

COPY --from=builder /app/dist ./dist

EXPOSE 8081

CMD [ "node", "dist/main.js" ]
