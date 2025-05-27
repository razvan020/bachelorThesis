pipeline {
  agent {
    docker {
      image 'ci-agent:cli-git'
      args  '--privileged -v /var/run/docker.sock:/var/run/docker.sock'
      reuseNode true
    }
  }

  stages {
    stage('Checkout & Inspect') {
      steps {
        checkout scm

        sh 'pwd; ls -R .'
      }
    }

    stage('Prepare .env') {
      steps {
        // Assume you've stored your keys in Jenkins as "stripe-pk" and "stripe-sk"
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
          string(credentialsId: 'gemini-xlr8', variable: 'GOOGLE_CREDENTIALS_JSON_CONTENT'),
          string(credentialsId: 'gemini-api-key', variable: 'GEMINI_API_KEY'),
          string(credentialsId: 'gemini-project-id', variable: 'GEMINI_PROJECT_ID')



        ]) {
          sh """

        echo "=== DEBUGGING CREDENTIALS FILE CREATION ==="
        
        # Remove any existing file/directory
        rm -rf google-credentials.json
        
        # Create the file
        printf '%s' "\$GOOGLE_CREDENTIALS_JSON_CONTENT" > google-credentials.json
        
        # Debug the created file
        echo "File details:"
        ls -la google-credentials.json
        file google-credentials.json
        echo "File size: \$(stat -c%s google-credentials.json)"
        echo "File permissions: \$(stat -c%A google-credentials.json)"
        echo "File content preview:"
        head -c 200 google-credentials.json
        echo ""
        echo "Is it valid JSON?"
        if command -v jq >/dev/null 2>&1; then
          echo "Using jq to validate:"
          jq empty google-credentials.json && echo "Valid JSON" || echo "Invalid JSON"
        else
          echo "jq not available, checking manually:"
          if [[ \$(head -c 1 google-credentials.json) == "{" ]]; then
            echo "Starts with { - likely valid JSON"
          else
            echo "Does not start with { - likely invalid"
          fi
        fi

            cat > .env <<EOF
            NEXT_PUBLIC_BACKEND_URL=http://backend:8080
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=\$PK
            STRIPE_SECRET_KEY=\$SK
            STRIPE_WEBHOOK_SECRET=\${WEBHOOK_SECRET:-}
            JWT_SECRET=\$JWT
            GOOGLE_CLIENT_ID=\$GCL
            GOOGLE_CLIENT_SECRET=\$GSK
            SPRING_MAIL_USERNAME=\$GMAIL
            SPRING_MAIL_PASSWORD=\$GMAILPASS
            NEXT_PUBLIC_RECAPTCHA_SITE_KEY=\$RECAPTCHA_SITE_KEY
            RECAPTCHA_SECRET_KEY=\$RECAPTCHA_SECRET_KEY
            GEMINI_APPLICATION_CREDENTIALS=/google-credentials.json
            GEMINI_API_KEY=\$GEMINI_API_KEY
            GEMINI_PROJECT_ID=\$GEMINI_PROJECT_ID
            EOF
          """

        }
      }
    }

    stage('Build & Deploy') {
      steps {
        sh 'docker compose down --remove-orphans || true'

        sh 'docker compose pull || true'
        sh 'docker compose up --build --remove-orphans -d'
      }
    }
  }

  post {
    success { echo "✅ All done!" }
    failure { echo "❌ Build or deploy failed." }
  }
}
