#!/bin/bash
set -e

# Builds and deploys all images for the Azure environments

ORG=${ORG:-hsl}

# dev stage production
TAG="latest"

DOCKER_IMAGE="bulttiregistry.azurecr.io/${ORG}/bultti-db:${TAG}"

docker build -t "$DOCKER_IMAGE" .
docker push "$DOCKER_IMAGE"
