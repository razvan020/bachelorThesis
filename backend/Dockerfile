# 1) Build your Spring Boot app
FROM maven:3.8.8-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# 2) Run it
FROM openjdk:17-jdk-slim
ARG JAR_FILE=target/*.jar
WORKDIR /app
COPY --from=build /app/${JAR_FILE} app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
