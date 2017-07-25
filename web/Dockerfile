FROM hukam/pi-angular-cli:v1

# Internal unprivileged user will have this ID:
ENV BUILD_VERSION="V1"

# Updates S.O. and adds system required packages
# RUN apk update && apk upgrade

USER root

WORKDIR /home/user/src
VOLUME /home/user/src

# Copy entrypoint script (should be an executable) into the container
COPY ./entrypoint.sh /entrypoint.sh

# Copy everything (except what is in .dockerignore) to the workdir, inside the container
COPY ./ .

RUN npm install --production

EXPOSE 4200
# ENTRYPOINT ["entrypoint.sh"]
CMD ["ng", "serve", "--host=0.0.0.0"]  # default is defined in entrypoint.sh
