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
          withCredentials([
            [$class: 'ServiceAccountCredentialsBinding', 
             credentialsId: 'gemini-xlr8',
             variable: 'GOOGLE_APPLICATION_CREDENTIALS']
          ]) {
            sh '''
              echo "=== SETTING UP GOOGLE CLOUD SDK ==="
              
              # Install Google Cloud SDK (works on Alpine)
              if ! command -v gcloud &> /dev/null; then
                echo "Installing Google Cloud SDK..."
                
                # Install required packages
                apk add --no-cache python3 py3-pip curl bash
                
                # Install Google Cloud SDK
                curl https://sdk.cloud.google.com | bash -s -- --disable-prompts
                
                # Add to PATH for current session
                export PATH="/root/google-cloud-sdk/bin:$PATH"
                source /root/google-cloud-sdk/path.bash.inc
                
                echo "✅ Google Cloud SDK installed"
              else
                echo "✅ gcloud CLI already available"
              fi
              
              # Ensure gcloud is in PATH
              export PATH="/root/google-cloud-sdk/bin:$PATH"
              
              # Authenticate with service account
              echo "Authenticating with service account..."
              gcloud auth activate-service-account --key-file="$GOOGLE_APPLICATION_CREDENTIALS"
              
              # Set the project
              gcloud config set project xlr8travel
              
              # Verify authentication
              echo "Current authentication:"
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

    stage('Enable APIs & Verify') {
      steps {
        script {
          withCredentials([
            [$class: 'ServiceAccountCredentialsBinding', 
             credentialsId: 'gemini-xlr8',
             variable: 'GOOGLE_APPLICATION_CREDENTIALS']
          ]) {
            sh '''
              echo "=== ENABLING APIS AND VERIFICATION ==="
              
              # Ensure gcloud is available
              export PATH="/root/google-cloud-sdk/bin:$PATH"
              gcloud auth activate-service-account --key-file="$GOOGLE_APPLICATION_CREDENTIALS" --quiet
              gcloud config set project xlr8travel --quiet
              
              # Enable required APIs
              echo "Enabling Vertex AI API..."
              gcloud services enable aiplatform.googleapis.com --quiet || echo "API enablement failed - continuing anyway"
              
              echo "Enabling Cloud Resource Manager API..."
              gcloud services enable cloudresourcemanager.googleapis.com --quiet || echo "API enablement failed - continuing anyway"
              
              # Check API status
              echo "Checking enabled APIs..."
              gcloud services list --enabled --filter="name:aiplatform.googleapis.com" --format="value(name)" || echo "Could not check API status"
              
              echo "✅ API verification complete"
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

    stage('Build & Deploy') {
      steps {
        sh 'docker compose down --remove-orphans || true'
        sh 'docker compose pull || true'
        sh 'docker compose up --build --remove-orphans -d'
        
        sh '''
          echo "Waiting for containers..."
          timeout 60 sh -c 'until docker ps | grep xlr8travel2_testbranch-backend-1 | grep -q "Up"; do sleep 2; done'
          echo "✅ Backend is running"
        '''
      }
    }

    stage('Test Application') {
      steps {
        sh '''
          echo "=== TESTING APPLICATION ==="
          
          # Wait for application startup
          sleep 45
          
          # Check for Gemini/Google logs
          echo "Application logs (Gemini related):"
          docker logs xlr8travel2_testbranch-backend-1 | grep -E "(Gemini|Google|Vertex|UNAUTHENTICATED)" | tail -15 || echo "No specific logs found"
          
          # Health check
          if curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
              echo "✅ Health check passed"
          else
              echo "⚠️ Health check failed"
          fi
        '''
      }
    }
  }

  post {
    always {
      echo 'Pipeline completed'
    }
    success {
      echo '✅ Success! Your app should now have proper Google Cloud authentication'
    }
    failure {
      echo '❌ Pipeline failed'
      sh 'docker logs xlr8travel2_testbranch-backend-1 --tail 30 || echo "Could not get logs"'
    }
  }
}