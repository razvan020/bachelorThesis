pipeline {
  agent any

  // don’t let Declarative try a built‑in checkout
  options { skipDefaultCheckout() }

  stages {
    stage('Clone') {
      steps {
        // nuke any old files
        sh 'rm -rf ./*'
        // clone the branch you actually want
        sh 'git clone --branch testBranch https://github.com/razvan020/bachelorThesis.git .'
      }
    }

    stage('Build & Deploy') {
      // run this stage inside your dind‑git agent
      agent {
        docker {
          image 'ci-agent:dind-git'
          args  '--privileged -v /var/run/docker.sock:/var/run/docker.sock'
        }
      }
      steps {
        // now the code is present, just invoke compose
        sh 'docker compose pull || true'
        sh 'docker compose up --build -d'
      }
    }
  }

  post {
    success { echo "✅ All done!" }
    failure { echo "❌ Build or deploy failed." }
  }
}
