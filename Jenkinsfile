pipeline {
  agent any

  environment {
    // If you have a registry, set REPO_URL like "myregistry.io/xlr8travel"
    REPO_URL = "" // or leave empty for local-only
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Backend') {
      steps {
        script {
          def backendImage = docker.build("${env.REPO_URL}/backend:${env.BUILD_NUMBER}", "./backend")
          if (env.REPO_URL) {
            docker.withRegistry("https://${env.REPO_URL}", 'docker-creds-id') {
              backendImage.push()
            }
          }
        }
      }
    }

    stage('Build Frontend') {
      steps {
        script {
          def frontendImage = docker.build("${env.REPO_URL}/frontend:${env.BUILD_NUMBER}", "./frontend")
          if (env.REPO_URL) {
            docker.withRegistry("https://${env.REPO_URL}", 'docker-creds-id') {
              frontendImage.push()
            }
          }
        }
      }
    }

    stage('Deploy via Compose') {
      steps {
        // Copy your docker-compose.yml to the deployment node,
        // or run this on the same machine (since Docker socket is mounted)
        sh """
          docker-compose pull || true
          docker-compose up --build -d
        """
      }
    }
  }

  post {
    success {
      echo "✅ Deployment succeeded!"
    }
    failure {
      echo "❌ Deployment failed."
    }
  }
}
