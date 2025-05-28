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
	sh 'rm -rf google-credentials.json'


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
          string(credentialsId: 'gemini-api-key', variable: 'GEMINI_API_KEY'),
          string(credentialsId: 'gemini-project-id', variable: 'GEMINI_PROJECT_ID')



        ]) {
          sh """

            # The GOOGLE_APPLICATION_CREDENTIALS is already set by Jenkins
            echo "GOOGLE_APPLICATION_CREDENTIALS path: $GOOGLE_APPLICATION_CREDENTIALS"
            
            # Verify the credentials file
            if [ -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
                echo "✅ Credentials file exists"
                echo "File size: $(wc -c < "$GOOGLE_APPLICATION_CREDENTIALS") bytes"
                echo "File preview:"
                head -c 200 "$GOOGLE_APPLICATION_CREDENTIALS"
                echo ""
                
                           
            # Copy the credentials to workspace for Docker mounting
            cp "$GOOGLE_APPLICATION_CREDENTIALS" google-credentials.json


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
            GOOGLE_APPLICATION_CREDENTIALS=/google-credentials.json
            GEMINI_API_KEY=\$GEMINI_API_KEY
            GEMINI_PROJECT_ID=\$GEMINI_PROJECT_ID
	    GEMINI_APPLICATION_CREDENTIALS=/google-credentials.json
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

	sh 'docker cp google-credentials.json xlr8travel2_testbranch-backend-1:/google-credentials.json'
      }
    }
  }

  post {
    success { echo "✅ All done!" }
    failure { echo "❌ Build or deploy failed." }
  }
}
