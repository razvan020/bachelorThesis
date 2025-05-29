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

# Create a robust startup script that handles credential copying
RUN echo '#!/bin/bash' > /app/startup.sh && \
    echo 'set -e' >> /app/startup.sh && \
    echo 'echo "=== Application Startup ==="' >> /app/startup.sh && \
    echo '' >> /app/startup.sh && \
    echo '# Function to copy credentials if available' >> /app/startup.sh && \
    echo 'copy_credentials() {' >> /app/startup.sh && \
    echo '  echo "Checking for credentials file..."' >> /app/startup.sh && \
    echo '  if [ -f "/tmp/google-credentials.json" ]; then' >> /app/startup.sh && \
    echo '    echo "Found credentials file at /tmp/google-credentials.json"' >> /app/startup.sh && \
    echo '    echo "File size: $(stat -c%s /tmp/google-credentials.json) bytes"' >> /app/startup.sh && \
    echo '    if [ -s "/tmp/google-credentials.json" ]; then' >> /app/startup.sh && \
    echo '      echo "Copying credentials to /app/credentials/"' >> /app/startup.sh && \
    echo '      cp /tmp/google-credentials.json /app/credentials/google-credentials.json' >> /app/startup.sh && \
    echo '      chmod 600 /app/credentials/google-credentials.json' >> /app/startup.sh && \
    echo '      echo "✅ Credentials copied successfully"' >> /app/startup.sh && \
    echo '      echo "Final file size: $(stat -c%s /app/credentials/google-credentials.json) bytes"' >> /app/startup.sh && \
    echo '      ls -la /app/credentials/' >> /app/startup.sh && \
    echo '    else' >> /app/startup.sh && \
    echo '      echo "❌ Credentials file is empty"' >> /app/startup.sh && \
    echo '    fi' >> /app/startup.sh && \
    echo '  else' >> /app/startup.sh && \
    echo '    echo "❌ No credentials file found at /tmp/google-credentials.json"' >> /app/startup.sh && \
    echo '    echo "Directory contents:"' >> /app/startup.sh && \
    echo '    ls -la /tmp/ || echo "Cannot list /tmp"' >> /app/startup.sh && \
    echo '  fi' >> /app/startup.sh && \
    echo '}' >> /app/startup.sh && \
    echo '' >> /app/startup.sh && \
    echo '# Copy credentials' >> /app/startup.sh && \
    echo 'copy_credentials' >> /app/startup.sh && \
    echo '' >> /app/startup.sh && \
    echo '# Start the application' >> /app/startup.sh && \
    echo 'echo "Starting application..."' >> /app/startup.sh && \
    echo 'exec java -jar app.jar' >> /app/startup.sh && \
    chmod +x /app/startup.sh

EXPOSE 8080
ENTRYPOINT ["/app/startup.sh"]