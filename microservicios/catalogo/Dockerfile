# Usa una imagen oficial de Node.js
FROM node:18

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

# Expón el puerto necesario (ajústalo al que uses en tu servidor)
EXPOSE 10103

# Ejecuta el servidor
CMD ["npm", "start"]
