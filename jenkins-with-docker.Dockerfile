# jenkins-with-docker.Dockerfile
FROM jenkins/jenkins:lts

USER root
RUN apt-get update \
 && apt-get install -y docker.io git \
 && rm -rf /var/lib/apt/lists/*

# Let the jenkins user speak to the Docker socket
RUN usermod -aG docker jenkins

USER jenkins
