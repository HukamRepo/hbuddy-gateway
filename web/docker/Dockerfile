FROM hukam/pi-angular-cli:v1

# Internal unprivileged user will have this ID:
ENV BUILD_VERSION="V1"

USER root

# Updates S.O. and adds system required packages
RUN apk update && apk upgrade

# Copy entrypoint script (should be an executable) into the container
COPY ./entrypoint.sh /entrypoint.sh

# Copy everything (except what is in .dockerignore) to the workdir, inside the container
COPY ./ /home
WORKDIR /home

RUN npm install -g node-gyp
RUN npm install -g node-pre-gyp --fallback-to-build
RUN npm install -g @angular/cli --save-dev
RUN npm install

EXPOSE 4200
ENTRYPOINT []
CMD ["ng", "serve", "--host=0.0.0.0"]  # default is defined in entrypoint.sh
