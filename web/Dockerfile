FROM hypriot/rpi-node:8.1.3
# Enable systemd
ENV INITSYSTEM on
MAINTAINER Gurvinder Singh <contact@hukamtechnologies.com>

RUN apt-get update
RUN apt-get install -q -y --no-install-recommends --fix-missing \
  apt-utils \
  build-essential

COPY . /usr/src/app
WORKDIR /usr/src/app

USER root
ENTRYPOINT []

RUN npm install --ignore-scripts --unsafe-perm
RUN npm config set unsafe-perm true -g --unsafe-perm
RUN npm install -g @angular/cli
RUN JOBS=MAX npm install --production

CMD ["ng","serve"]
