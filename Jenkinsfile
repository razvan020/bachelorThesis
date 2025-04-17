pipeline {
  agent {
    docker {
      image 'ci-agent:dind-git'
      args  '--privileged -v /var/run/docker.sock:/var/run/docker.sock'
    }
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Build & Deploy') {
      steps {
        sh 'docker compose pull || true'
        sh 'docker compose up --build -d'
      }
    }
  }
  post {
    success { echo "✅ Deployed!" }
    failure { echo "❌ Something went wrong." }
  }
}
