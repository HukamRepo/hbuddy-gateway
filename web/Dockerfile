FROM resin/raspberrypi3-alpine-node:8.0.0

# Internal unprivileged user will have this ID:
ENV BUILD_VERSION="V1"

# Updates S.O. and adds system required packages
# RUN apk update && apk upgrade

USER root

# Install usefull npm packages
# RUN npm cache clean --force
# RUN npm install -g npm
RUN npm install -g typescript@2.2.0
RUN npm install -g @angular/cli

WORKDIR /home/user/src
VOLUME /home/user/src

# Copy entrypoint script (should be an executable) into the container
COPY ./entrypoint.sh /entrypoint.sh

# Copy everything (except what is in .dockerignore) to the workdir, inside the container
COPY ./ .

RUN npm install

EXPOSE 4200
# ENTRYPOINT ["entrypoint.sh"]
CMD ["ng", "serve", "--host=0.0.0.0"]  # default is defined in entrypoint.sh
