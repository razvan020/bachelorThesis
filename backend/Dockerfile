# backend/Dockerfile
############################################################
# 1) Build with Maven + JDK 21
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

# Create directories for credentials
RUN mkdir -p /app/credentials
RUN mkdir -p /tmp/credentials

# copy in the fat JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Create a script to handle credential copying at runtime
RUN echo '#!/bin/bash' > /app/copy-credentials.sh && \
    echo 'if [ -f /tmp/google-credentials.json ] && [ -s /tmp/google-credentials.json ]; then' >> /app/copy-credentials.sh && \
    echo '  echo "Copying credentials from mount to app directory..."' >> /app/copy-credentials.sh && \
    echo '  cp /tmp/google-credentials.json /app/credentials/google-credentials.json' >> /app/copy-credentials.sh && \
    echo '  echo "Credentials copied successfully"' >> /app/copy-credentials.sh && \
    echo '  ls -la /app/credentials/' >> /app/copy-credentials.sh && \
    echo 'else' >> /app/copy-credentials.sh && \
    echo '  echo "No valid credentials file found at /tmp/google-credentials.json"' >> /app/copy-credentials.sh && \
    echo 'fi' >> /app/copy-credentials.sh && \
    echo 'exec "$@"' >> /app/copy-credentials.sh && \
    chmod +x /app/copy-credentials.sh

EXPOSE 8080
ENTRYPOINT ["/app/copy-credentials.sh", "java", "-jar", "app.jar"]