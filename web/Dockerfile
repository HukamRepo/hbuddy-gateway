FROM hypriot/rpi-alpine

# Internal unprivileged user will have this ID:
ENV CONTAINER_USER_ID="1000" \
    CONTAINER_GROUP_ID="1000" \
    BUILD_VERSION="V1"

# Updates S.O. and adds system required packages
RUN apk update && apk upgrade
RUN apk add --update nodejs nodejs-npm python make g++ git

USER root

# configures environment
ENV NPM_CONFIG_PREFIX=/opt/npm-global
ENV PATH=$NPM_CONFIG_PREFIX/bin:$PATH

# Install usefull npm packages
RUN npm install -g npm
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
