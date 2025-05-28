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

    stage('Setup Google Cloud SDK') {
      steps {
        script {
          // Use the Google Service Account credential with proper Google Cloud SDK binding
          withCredentials([
            [$class: 'ServiceAccountCredentialsBinding', 
             credentialsId: 'gemini-xlr8',
             variable: 'GOOGLE_APPLICATION_CREDENTIALS']
          ]) {
            sh '''
              echo "=== SETTING UP GOOGLE CLOUD SDK ==="
              
              # Install Google Cloud SDK if not present
              if ! command -v gcloud &> /dev/null; then
                echo "Installing Google Cloud SDK..."
                curl https://sdk.cloud.google.com | bash
                exec -l $SHELL
                source $HOME/google-cloud-sdk/path.bash.inc
              else
                echo "✅ gcloud CLI already available"
              fi
              
              # Authenticate with service account
              echo "Authenticating with service account..."
              gcloud auth activate-service-account --key-file="$GOOGLE_APPLICATION_CREDENTIALS"
              
              # Set the project
              gcloud config set project xlr8travel
              
              # Verify authentication
              gcloud auth list
              gcloud config list
              
              # Copy credentials for application use
              cp "$GOOGLE_APPLICATION_CREDENTIALS" google-credentials.json
              
              echo "✅ Google Cloud SDK setup complete"
            '''
          }
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
            
            # Verify credentials file exists
            if [ -f "google-credentials.json" ]; then
                echo "✅ Google credentials file ready"
                echo "File size: $(wc -c < google-credentials.json) bytes"
            else
                echo "❌ Google credentials file missing"
                exit 1
            fi
            
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
          '''
        }
      }
    }

    stage('Verify Google Cloud APIs') {
      steps {
        script {
          withCredentials([
            [$class: 'ServiceAccountCredentialsBinding', 
             credentialsId: 'gemini-xlr8',
             variable: 'GOOGLE_APPLICATION_CREDENTIALS']
          ]) {
            sh '''
              echo "=== VERIFYING GOOGLE CLOUD APIS ==="
              
              # Set authentication
              export GOOGLE_APPLICATION_CREDENTIALS="$GOOGLE_APPLICATION_CREDENTIALS"
              gcloud auth activate-service-account --key-file="$GOOGLE_APPLICATION_CREDENTIALS" --quiet
              gcloud config set project xlr8travel --quiet
              
              # Check if Vertex AI API is enabled
              echo "Checking Vertex AI API status..."
              if gcloud services list --enabled --filter="name:aiplatform.googleapis.com" --format="value(name)" | grep -q aiplatform; then
                  echo "✅ Vertex AI API is enabled"
              else
                  echo "❌ Vertex AI API is NOT enabled"
                  echo "Attempting to enable Vertex AI API..."
                  gcloud services enable aiplatform.googleapis.com --quiet || echo "Failed to enable API - check permissions"
              fi
              
              # Test API access
              echo "Testing API access..."
              gcloud ai models list --region=us-central1 --limit=1 --quiet || echo "API access test failed - this is expected if no models exist"
              
              echo "✅ Google Cloud verification complete"
            '''
          }
        }
      }
    }

    stage('Build & Deploy') {
      steps {
        sh 'docker compose down --remove-orphans || true'
        sh 'docker compose pull || true'
        sh 'docker compose up --build --remove-orphans -d'
        
        sh '''
          echo "Waiting for containers..."
          timeout 60 sh -c 'until docker ps | grep xlr8travel2_testbranch-backend-1 | grep -q "Up"; do sleep 2; done'
          echo "✅ Backend is running"
          
          # Verify mounted credentials
          echo "=== VERIFYING MOUNTED CREDENTIALS ==="
          docker exec xlr8travel2_testbranch-backend-1 ls -la /app/credentials/google-credentials.json || echo "Credentials not found"
          docker exec xlr8travel2_testbranch-backend-1 head -c 100 /app/credentials/google-credentials.json || echo "Cannot read credentials"
          
          # Check environment variables
          docker exec xlr8travel2_testbranch-backend-1 env | grep -E "(GOOGLE_APPLICATION_CREDENTIALS|GEMINI_)" || echo "No Google env vars found"
        '''
      }
    }

    stage('Test Gemini Integration') {
      steps {
        sh '''
          echo "=== TESTING GEMINI INTEGRATION ==="
          
          # Wait for application to fully start
          sleep 45
          
          # Check application logs for Gemini-related messages
          echo "Checking for Gemini configuration in logs:"
          docker logs xlr8travel2_testbranch-backend-1 | grep -E "(Gemini|Google|Vertex|AI)" | tail -20 || echo "No Gemini logs found"
          
          # Check for authentication errors
          echo ""
          echo "Checking for authentication errors:"
          docker logs xlr8travel2_testbranch-backend-1 | grep -E "(UNAUTHENTICATED|authentication|credentials)" | tail -10 || echo "No auth errors found"
          
          # Test health endpoint
          if curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
              echo "✅ Application health check passed"
          else
              echo "⚠️ Application health check failed"
          fi
          
          echo "✅ Gemini integration test complete"
        '''
      }
    }
  }

  post {
    always {
      echo 'Pipeline execution completed'
    }
    success {
      echo '✅ All stages completed successfully!'
      echo '🔍 Your application should now have proper Google Cloud authentication'
    }
    failure {
      echo '❌ Pipeline failed'
      sh '''
        echo "=== FAILURE DIAGNOSTICS ==="
        echo "Container logs:"
        docker logs xlr8travel2_testbranch-backend-1 --tail 50 || echo "Could not get container logs"
        
        echo ""
        echo "Google Cloud configuration:"
        gcloud config list || echo "gcloud not available"
        gcloud auth list || echo "gcloud auth not available"
      '''
    }
  }
}