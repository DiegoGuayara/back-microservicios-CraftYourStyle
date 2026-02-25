# Usa una imagen oficial de Node.js
FROM node:18

ENV NODE_ENV=development
WORKDIR /app

# Build context: raíz del repo (Render monorepo)
COPY microservicios/pagos/package*.json ./
RUN npm install

COPY microservicios/pagos/ ./
RUN npm run build

EXPOSE 10103
CMD ["npm", "start"]
