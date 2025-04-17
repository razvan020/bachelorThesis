pipeline {
  /* 
     This will spin up a container FROM the official docker:dind image,
     mount the host’s Docker socket so that docker commands go to the host daemon,
     and run _inside_ that container.
  */
  agent {
    docker {
      image 'docker:24-dind'
      args  '--privileged -v /var/run/docker.sock:/var/run/docker.sock'
    }
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build & Deploy') {
      steps {
        // Notice we’re now using the v2 compose plugin:
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
