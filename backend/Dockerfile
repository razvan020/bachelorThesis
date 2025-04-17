# backend/Dockerfile
############################################################
# 1) Build with Maven + JDK 21
############################################################
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /app

# copy in and resolve dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# copy your source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

############################################################
# 2) Package with a JRE‑only image
############################################################
FROM openjdk:21-jdk-slim
WORKDIR /app

# copy in the fat JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
