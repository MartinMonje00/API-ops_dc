FROM node:24-bookworm-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm cache clean --force && npm config set maxsockets 1

RUN npm config set strict-ssl false && \
    npm install --no-audit --no-fund

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
