FROM docker:24    
RUN apk add --no-cache git


RUN apk add --no-cache \
    python3 \
    py3-pip \
    curl \
    bash \
    gnupg \
    file

# Install Google Cloud SDK
RUN curl https://sdk.cloud.google.com | bash -s -- --disable-prompts
RUN echo 'source /root/google-cloud-sdk/path.bash.inc' >> ~/.bashrc
RUN echo 'source /root/google-cloud-sdk/completion.bash.inc' >> ~/.bashrc

# Add gcloud to PATH
ENV PATH="/root/google-cloud-sdk/bin:${PATH}"

# Verify installation
RUN gcloud version