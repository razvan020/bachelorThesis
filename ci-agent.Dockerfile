FROM docker:24    
RUN apk add --no-cache git


RUN apt-get update && apt-get install -y \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Add Google Cloud SDK repository
RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -

# Install Google Cloud SDK
RUN apt-get update && apt-get install -y google-cloud-sdk

# Verify installation
RUN gcloud version