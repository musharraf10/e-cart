FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY ./src ./src
COPY .env.example ./.env

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "src/server.js"]

