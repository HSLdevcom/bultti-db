#!/bin/bash
set -e

# Builds and deploys all images for the Azure environments

ORG=${ORG:-hsldevcom}

for TAG in latest dev stage production; do
  DOCKER_IMAGE=$ORG/bultti-db:${TAG}

  docker build -t $DOCKER_IMAGE .
  docker push $DOCKER_IMAGE
done
