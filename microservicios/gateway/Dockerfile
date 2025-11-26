# Etapa 1: Build
FROM node:18 AS builder

# Establece el entorno como desarrollo (para instalar devDependencies)
ENV NODE_ENV=development

# Crea la carpeta de trabajo
WORKDIR /app

# Copia solo archivos de dependencias para acelerar la cache
COPY package*.json ./

# Instala TODAS las dependencias, incluidas las de desarrollo
RUN npm install

# Copia el resto del proyecto
COPY . .

# Compila el código TypeScript
RUN npm run build

# Etapa 2: Production
FROM node:18-slim

# Establece el entorno de producción
ENV NODE_ENV=production

WORKDIR /app

# Copia solo lo necesario desde la etapa de build
COPY package*.json ./

# Instala solo dependencias de producción
RUN npm install --only=production

# Copia el código compilado
COPY --from=builder /app/dist ./dist

# Expón el puerto necesario
EXPOSE 1010

# Ejecuta el servidor
CMD ["npm", "start"]
