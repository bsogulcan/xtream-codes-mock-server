FROM node:16-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY data/ ./data/
COPY server.js .
COPY scripts/ ./scripts/
COPY public/ ./public/

EXPOSE 8080

CMD ["node", "server.js"]