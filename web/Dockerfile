FROM resin/raspberrypi3-node:8.0.0

ENV BUILD_VERSION="V1"

USER root

# Updates S.O. and adds system required packages
RUN apt-get update

# Create a directory where our app will be placed
RUN mkdir -p /usr/src/app

#Change directory so that our commands run inside this new directory
WORKDIR /usr/src/app

# Copy dependency definitions
COPY package.json /usr/src/app

# Install dependencies
RUN npm install

# Get all the code needed to run the app
COPY . /usr/src/app

EXPOSE 4200
ENTRYPOINT []
CMD ["ng", "serve", "--host=0.0.0.0", "--disable-host-check"]
