FROM node:22-alpine

RUN apk add --no-cache vips-dev

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p uploads/services

EXPOSE 5000
CMD ["node", "server.js"]