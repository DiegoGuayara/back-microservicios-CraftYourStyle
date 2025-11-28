# Usa una imagen oficial de Python
FROM python:3.11-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia solo el archivo de dependencias para aprovechar la cache de Docker
COPY requirements.txt .

# Instala las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del proyecto
COPY . .

# Expone el puerto del microservicio de notificaciones
EXPOSE 10104

# Comando para ejecutar la aplicación con uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10104"]
