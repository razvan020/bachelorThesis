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
          string(credentialsId: 'recaptcha-secret-key', variable: 'RECAPTCHA_SECRET_KEY')


        ]) {
          sh """
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
