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
        // Pull down the branch you configured in Multibranch or Pipeline Git SCM
        checkout scm

        // OPTIONAL: verify that your monitoring folder and prometheus.yml are present
        sh 'pwd; ls -R .'
      }
    }

    stage('Build & Deploy') {
      steps {
        // Tear down any old containers/volumes
        sh 'docker compose down --remove-orphans || true'

        // Bring everything up
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
