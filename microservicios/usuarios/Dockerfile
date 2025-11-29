# Usar imagen con Maven y JDK para desarrollo
FROM maven:3.9.9-eclipse-temurin-17
WORKDIR /app

# Copiar archivos de configuración de Maven
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
COPY mvnw.cmd .

# Descargar dependencias
RUN mvn dependency:go-offline -B

# Copiar código fuente
COPY src ./src

# Exponer el puerto
EXPOSE 8080

# Ejecutar con Maven Spring Boot plugin
CMD ["mvn", "spring-boot:run"]
