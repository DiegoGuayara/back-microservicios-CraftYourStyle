# Usa una imagen oficial de Node.js
FROM node:18

ENV NODE_ENV=development
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
