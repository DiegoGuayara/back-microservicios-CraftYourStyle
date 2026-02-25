# Usa una imagen oficial de Node.js
FROM node:18

ENV NODE_ENV=development
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 10103
CMD ["npm", "start"]
