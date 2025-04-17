pipeline {
  // 1) Run the checkout on the master (which has Git + workspace)
  agent any

  stages {
    stage('Checkout') {
      steps {
        // Clone your repo onto the master node's workspace
        checkout scm
      }
    }

    stage('Build & Deploy') {
      // 2) Now switch to a Docker agent just for the build/deploy
      agent {
        docker {
          image 'ci-agent:dind-git'
          // mount the host socket so docker commands work
          args  '--privileged -v /var/run/docker.sock:/var/run/docker.sock'
        }
      }
      steps {
        // We're already *in* the same workspace, so just invoke Compose
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
