FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /universidad

# Copiar solo archivos necesarios primero (mejor cache)
COPY universidad/pom.xml .
RUN mvn dependency:go-offline

# Ahora sí copiar el código
COPY universidad/src ./src

RUN mvn clean package -DskipTests

# Runtime
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /universidad

COPY --from=build /universidad/target/*.jar universidad.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "universidad.jar"]