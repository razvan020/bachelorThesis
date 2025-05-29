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

# copy in the fat JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# SIMPLE SOLUTION: Create a startup script that creates credentials from env variable
RUN echo '#!/bin/bash' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "=== Creating Google Credentials ==="' >> /app/start.sh && \
    echo 'if [ -n "$GOOGLE_CREDENTIALS_BASE64" ]; then' >> /app/start.sh && \
    echo '  echo "Found base64 credentials, decoding..."' >> /app/start.sh && \
    echo '  echo "$GOOGLE_CREDENTIALS_BASE64" | base64 -d > /app/credentials/google-credentials.json' >> /app/start.sh && \
    echo '  chmod 600 /app/credentials/google-credentials.json' >> /app/start.sh && \
    echo '  echo "✅ Credentials file created: $(wc -c < /app/credentials/google-credentials.json) bytes"' >> /app/start.sh && \
    echo '  export GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/google-credentials.json' >> /app/start.sh && \
    echo '  export GEMINI_APPLICATION_CREDENTIALS=/app/credentials/google-credentials.json' >> /app/start.sh && \
    echo 'else' >> /app/start.sh && \
    echo '  echo "❌ No GOOGLE_CREDENTIALS_BASE64 found"' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo 'echo "Starting application..."' >> /app/start.sh && \
    echo 'exec java -jar app.jar' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 8080
ENTRYPOINT ["/app/start.sh"]