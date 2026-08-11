# --- Stage 1: build the jar with Maven ---
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy just the pom first so Docker can cache downloaded dependencies
# between builds when only source code changes, not pom.xml.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# --- Stage 2: run the jar on a slim JRE-only image ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Render injects PORT at runtime; application.properties already falls
# back to it (server.port=${PORT:${SERVER_PORT:8080}}).
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
