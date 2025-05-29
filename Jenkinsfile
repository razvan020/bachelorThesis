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
            
            # Verify gcloud is available (should be built into the image now)
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

  echo "Copying credentials file..."
  cp "$GOOGLE_CREDS_FILE" backend/tmp/credentials.json
            
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
          string(credentialsId: 'gemini-project-id', variable: 'GEMINI_PROJECT_ID')
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
GEMINI_APPLICATION_CREDENTIALS=/app/credentials/google-credentials.json
GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/google-credentials.json
GEMINI_API_KEY=$GEMINI_API_KEY
GEMINI_PROJECT_ID=$GEMINI_PROJECT_ID
EOF
            
            echo "✅ Environment prepared"
  	echo "Ensuring credentials file is in backend/tmp..."
  	cp google-credentials.json backend/tmp/google-credentials.json
  	ls -l backend/tmp
          '''
        }
      }
    }

    stage('Build & Deploy') {
      steps {
        sh 'docker compose down --remove-orphans || true'
        sh 'docker compose pull || true'
        sh 'docker compose up --build --remove-orphans -d'
        
        sh '''
         echo "WORKSPACE: $WORKSPACE"
         export WORKSPACE=$(pwd)

          echo "Waiting for containers..."
          timeout 60 sh -c 'until docker ps | grep xlr8travel2_testbranch-backend-1 | grep -q "Up"; do sleep 2; done'
          echo "✅ Backend is running"
        '''
      }
    }

    stage('Test Application') {
      steps {
        sh '''
          echo "=== TESTING GEMINI INTEGRATION ==="

      echo "📁 Verifying credentials inside container..."
      docker exec xlr8travel2_testbranch-backend-1 ls -l /app/credentials || echo "❌ Credentials not found in container"
          
          # Wait for application startup
          sleep 20
          
          # Check for authentication issues
          echo "Checking for authentication logs:"
          docker logs xlr8travel2_testbranch-backend-1 | grep -E "(Gemini|Google|UNAUTHENTICATED|authentication)" | tail -10 || echo "No auth issues found"
          
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
      sh 'docker logs xlr8travel2_testbranch-backend-1 --tail 30 || echo "Could not get logs"'
    }
  }
}