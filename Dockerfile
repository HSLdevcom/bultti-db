FROM node:14

RUN apt-get update && \
  apt-get -y install git build-essential software-properties-common apt-transport-https ca-certificates && \
  # Needs new versions from the Buster repo, otherwise the matcher won't work
  apt-add-repository 'deb http://ftp.us.debian.org/debian buster main contrib non-free' && \
  apt-get update && \
  apt-get -y install postgresql-client-11 && rm -rf /var/lib/apt/lists/*

ENV WORK /opt/bultti-db

WORKDIR ${WORK}

# Install app dependencies
COPY package.json ${WORK}
COPY yarn.lock ${WORK}

# Copy the env file for production
COPY .env.production ${WORK}/.env

RUN yarn install

# Copy app source
COPY . ${WORK}
CMD yarn run start:production
