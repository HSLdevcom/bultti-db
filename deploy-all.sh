#!/bin/bash
set -e

# Builds and deploys all images for the Azure environments

ORG=${ORG:-hsldevcom}

# dev stage production
TAG="latest"

DOCKER_IMAGE="${ORG}/bultti-db:${TAG}"

docker build -t "$DOCKER_IMAGE" .
docker push "$DOCKER_IMAGE"
