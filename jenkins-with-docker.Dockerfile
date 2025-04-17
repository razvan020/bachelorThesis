FROM jenkins/jenkins:lts

USER root
RUN apt-get update \
  && apt-get install -y docker.io \
  && rm -rf /var/lib/apt/lists/*

# allow the 'jenkins' user to use the Docker socket
RUN usermod -aG docker jenkins

USER jenkins
