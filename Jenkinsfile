pipeline {
  agent any
  options { skipDefaultCheckout() }

  stages {
    stage('Clone') {
      steps {
        deleteDir()
        git url: 'https://github.com/razvan020/bachelorThesis.git', branch: 'testBranch'
      }
    }

    stage('Build & Deploy') {
      agent {
        docker {
          image 'ci-agent:cli-git'
          args  '--privileged -v /var/run/docker.sock:/var/run/docker.sock'
          reuseNode true
        }
      }
      steps {
    sh 'docker compose down --remove-orphans --volumes || true'
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
