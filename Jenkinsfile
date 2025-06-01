pipeline {
  agent {
    docker {
      image 'ci-agent:cli-git'
      args  '--privileged -v /var/run/docker.sock:/var/run/docker.sock --entrypoint=""'
      reuseNode true
    }
  }

  stages {
    stage('Checkout & Inspect') {
      steps {
        checkout scm
        sh 'pwd; ls -R .'
        sh 'rm -rf google-credentials.json'
        sh 'rm -rf backend/tmp/*'
      }
    }

    stage('Setup Google Cloud') {
      steps {
        withCredentials([
          file(credentialsId: 'gemini-xlr8', variable: 'GOOGLE_CREDS_FILE')
        ]) {
          sh '''
            echo "=== SETTING UP GOOGLE CLOUD AUTHENTICATION ==="
            
            # Copy credentials to workspace
            cp "$GOOGLE_CREDS_FILE" google-credentials.json
            
            # Verify gcloud is available
            gcloud version || echo "gcloud not found"
            
            # Authenticate with service account
            echo "Authenticating with Google Cloud..."
            gcloud auth activate-service-account --key-file=google-credentials.json
            
            # Set project
            gcloud config set project xlr8travel
            
            # Enable APIs
            echo "Enabling Vertex AI API..."
            gcloud services enable aiplatform.googleapis.com || echo "API enablement failed"
            
            # Verify authentication
            echo "✅ Authentication status:"
            gcloud auth list

            # Create backend/tmp directory if it doesn't exist
            mkdir -p backend/tmp
            
            # Copy credentials file with the correct name
            echo "Copying credentials file..."
            cp "$GOOGLE_CREDS_FILE" backend/tmp/google-credentials.json
            
            # Verify the file was copied correctly
            echo "Verifying credentials file:"
            ls -la backend/tmp/
            echo "File size: $(wc -c < backend/tmp/google-credentials.json) bytes"
            echo "First line of credentials file:"
            head -1 backend/tmp/google-credentials.json
            
            echo "✅ Google Cloud setup complete"
          '''
        }
      }
    }

    stage('Prepare Environment') {
      steps {
        withCredentials([
          string(credentialsId: 'stripe-pk', variable: 'PK'),
          string(credentialsId: 'stripe-sk', variable: 'SK'),
          string(credentialsId: 'jwt-sk', variable: 'JWT'),
          string(credentialsId: 'gclientid', variable: 'GCL'),
          string(credentialsId: 'g-sk', variable: 'GSK'),
          string(credentialsId: 'gmail', variable: 'GMAIL'),
          string(credentialsId: 'gmail-pass', variable: 'GMAILPASS'),
          string(credentialsId: 'recaptcha-site-key', variable: 'RECAPTCHA_SITE_KEY'),
          string(credentialsId: 'recaptcha-secret-key', variable: 'RECAPTCHA_SECRET_KEY'),
          string(credentialsId: 'gemini-api-key', variable: 'GEMINI_API_KEY'),
          string(credentialsId: 'gemini-project-id', variable: 'GEMINI_PROJECT_ID'),
          string(credentialsId: 'weather-id', variable: 'OPENWEATHER_API_KEY')
        ]) {
          sh '''
            echo "=== PREPARING APPLICATION ENVIRONMENT ==="
            
            # Create .env file

cat > .env <<EOF
NEXT_PUBLIC_BACKEND_URL=http://backend:8080
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$PK
STRIPE_SECRET_KEY=$SK
STRIPE_WEBHOOK_SECRET=\${WEBHOOK_SECRET:-}
JWT_SECRET=$JWT
GOOGLE_CLIENT_ID=$GCL
GOOGLE_CLIENT_SECRET=$GSK
SPRING_MAIL_USERNAME=$GMAIL
SPRING_MAIL_PASSWORD=$GMAILPASS
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$RECAPTCHA_SITE_KEY
RECAPTCHA_SECRET_KEY=$RECAPTCHA_SECRET_KEY
GEMINI_API_KEY=$GEMINI_API_KEY
GEMINI_PROJECT_ID=$GEMINI_PROJECT_ID
NEXT_PUBLIC_OPENWEATHER_API_KEY=$OPENWEATHER_API_KEY
# No file paths needed - credentials created from environment variable
EOF
            
            echo "✅ Environment prepared"
            
            # Final verification of credentials file
            echo "Final verification of credentials file:"
            ls -la backend/tmp/
            echo "Credentials file exists: $(test -f backend/tmp/google-credentials.json && echo 'YES' || echo 'NO')"
            echo "Credentials file size: $(wc -c < backend/tmp/google-credentials.json) bytes"
          '''
        }
      }
    }

stage('Build & Deploy') {
  steps {
    sh 'docker compose down --remove-orphans || true'
    sh 'docker compose pull || true'
    
    // SIMPLE SOLUTION: Pass credentials as environment variable
    withCredentials([
      file(credentialsId: 'gemini-xlr8', variable: 'GOOGLE_CREDS_FILE')
    ]) {
      sh '''
        # Read the credentials file content and encode it
        GOOGLE_CREDS_CONTENT=$(cat "$GOOGLE_CREDS_FILE" | base64 -w 0)
        
        # Export it as environment variable for docker compose
        export GOOGLE_CREDENTIALS_BASE64="$GOOGLE_CREDS_CONTENT"
        
        # Start containers with the credentials
        docker compose up --build --remove-orphans -d
      '''
    }
    
sh '''
  echo "WORKSPACE: $WORKSPACE"  
  export WORKSPACE=$(pwd)
  
  # Get the job name, replace slashes with underscores, and convert to lowercase
  CONTAINER_NAME=$(echo "${JOB_NAME}-backend-1" | tr '/' '_' | tr '[:upper:]' '[:lower:]')
  echo "Looking for container: $CONTAINER_NAME"

  echo "Waiting for containers..."
  timeout 60 sh -c "until docker ps | grep $CONTAINER_NAME | grep -q 'Up'; do sleep 2; done"
  echo "✅ Backend is running"
'''
  }
}
    stage('Debug Container Mounts') {
      steps {
        sh '''
          echo "=== DEBUGGING CONTAINER MOUNTS ==="
          
          # Check what's in the host directory
          echo "📁 Host backend/tmp directory:"
          ls -la backend/tmp/ || echo "backend/tmp directory not found"
          pwd
          
          # Check what's mounted in the container

echo "📁 Checking if entrypoint script exists:"
docker exec xlr8travel2_testbranch-backend-1 ls -la /app/copy-credentials.sh || echo "❌ Entrypoint script not found"

echo "📁 Checking entrypoint script content:"
docker exec xlr8travel2_testbranch-backend-1 cat /app/copy-credentials.sh || echo "❌ Cannot read entrypoint script"

echo "📁 Checking what's actually mounted at /tmp:"
docker exec xlr8travel2_testbranch-backend-1 ls -la /tmp/google-credentials.json || echo "❌ No file at /tmp/google-credentials.json"

echo "📁 Checking if /tmp mount is a file or directory:"
docker exec xlr8travel2_testbranch-backend-1 file /tmp/google-credentials.json || echo "❌ Cannot determine file type"

echo "📁 Running the entrypoint script manually:"
docker exec xlr8travel2_testbranch-backend-1 /app/copy-credentials.sh echo "test" || echo "❌ Entrypoint script failed"

echo "📁 Container /app/credentials directory:"
docker exec xlr8travel2_testbranch-backend-1 ls -la /app/credentials/ || echo "❌ /app/credentials directory not found"

echo "📁 Checking for final file:"
docker exec xlr8travel2_testbranch-backend-1 test -f /app/credentials/google-credentials.json && echo "✅ google-credentials.json EXISTS" || echo "❌ google-credentials.json NOT FOUND"

echo "📁 File size check:"
docker exec xlr8travel2_testbranch-backend-1 wc -c /app/credentials/google-credentials.json || echo "❌ Cannot check file size"          
          # Check container environment variables
          echo "📁 Container environment variables:"
          docker exec xlr8travel2_testbranch-backend-1 env | grep -E "(GEMINI|GOOGLE)" || echo "No Gemini/Google env vars found"
          
          # Check Docker mount details
          echo "📁 Docker inspect volumes:"
          docker inspect xlr8travel2_testbranch-backend-1 | grep -A 10 -B 10 "Mounts" || echo "Could not inspect mounts"
          
          echo "✅ Debug complete"
        '''
      }
    }

    stage('Test Application') {
      steps {
        sh '''
          echo "=== TESTING GEMINI INTEGRATION ==="
          
          # Wait for application startup
          sleep 20
          
          # Check for authentication issues
          echo "Checking for authentication logs:"
          docker logs xlr8travel2_testbranch-backend-1 | grep -E "(Gemini|Google|UNAUTHENTICATED|authentication|credentials)" | tail -10 || echo "No auth issues found"
          
          # Health check
          if curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
              echo "✅ Application health check passed"
          else
              echo "⚠️ Application health check failed"
          fi
          
          echo "✅ Testing complete"
        '''
      }
    }
  }

  post {
    always {
      echo 'Pipeline completed'
    }
    success {
      echo '✅ Success! Google Cloud authentication should now work'
    }
failure {
  echo '❌ Pipeline failed'
  sh '''
    CONTAINER_NAME=$(echo "${JOB_NAME}-backend-1" | tr '/' '_' | tr '[:upper:]' '[:lower:]')
    docker logs $CONTAINER_NAME --tail 50 || echo "Could not get logs"
  '''
}
  }
}