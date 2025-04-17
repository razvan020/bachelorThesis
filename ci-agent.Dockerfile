# ci-agent.Dockerfile
FROM docker:24-dind

# alpine-based, so use apk
RUN apk add --no-cache git
