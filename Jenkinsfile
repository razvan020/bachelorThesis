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
          // Use the Google Service Account credential properly
          [$class: 'GoogleRobotPrivateKeyBinding', 
           credentialsId: 'gemini-xlr8', 
           variable: 'GOOGLE_APPLICATION_CREDENTIALS']
        ]) {
          sh '''
            echo "=== SETTING UP GOOGLE CREDENTIALS ==="
            
            # The GOOGLE_APPLICATION_CREDENTIALS variable now contains the path to the key file
            echo "Google credentials file path: $GOOGLE_APPLICATION_CREDENTIALS"
            
            # Copy the credentials to workspace for Docker mounting
            cp "$GOOGLE_APPLICATION_CREDENTIALS" google-credentials.json
            
            # Verify the credentials file
            if [ -f "google-credentials.json" ]; then
                echo "✅ Credentials file copied successfully"
                echo "File size: $(wc -c < google-credentials.json) bytes"
                echo "File preview:"
                head -c 200 google-credentials.json
                echo ""
            else
                echo "❌ Failed to copy credentials file"
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
            
            echo "✅ Environment setup complete"
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
          echo "Waiting for backend container to be ready..."
          timeout 60 sh -c 'until docker ps | grep xlr8travel2_testbranch-backend-1 | grep -q "Up"; do sleep 2; done'
          echo "✅ Backend container is running"
          
          # Verify the mounted credentials
          echo "=== VERIFYING MOUNTED CREDENTIALS ==="
          docker exec xlr8travel2_testbranch-backend-1 ls -la /app/credentials/google-credentials.json || echo "File not found"
          docker exec xlr8travel2_testbranch-backend-1 head -c 200 /app/credentials/google-credentials.json || echo "Cannot read file"
          
          # Check environment variables
          echo "=== ENVIRONMENT VARIABLES IN CONTAINER ==="
          docker exec xlr8travel2_testbranch-backend-1 env | grep -E "(GOOGLE_APPLICATION_CREDENTIALS|GEMINI_)" || echo "No env vars found"
        '''
      }
    }

    stage('Test Application') {
      steps {
        sh '''
          echo "=== TESTING APPLICATION ==="
          sleep 30
          docker logs xlr8travel2_testbranch-backend-1 --tail 20 || echo "Could not get logs"
          
          if curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
              echo "✅ Application health check passed"
          else
              echo "⚠️ Application health check failed"
          fi
        '''
      }
    }
  }

  post {
    success { 
      echo "✅ Deployment successful!"
    }
    failure { 
      echo "❌ Deployment failed"
      sh 'docker logs xlr8travel2_testbranch-backend-1 --tail 50 || echo "Could not get logs"'
    }
  }
}