FROM hukam/pi3-base:v2

MAINTAINER Gurvinder Singh <contact@hukamtechnologies.com>

ENV INITSYSTEM on \
  AUDIODEV hw:1,0 \
  AUDIODRIVER alsa \
  BUILD_VERSION="V1"

# Updates and adds system required packages
RUN apt-get update && \
    apt-get -qy install curl ca-certificates nano omxplayer \
    -y --no-install-recommends --fix-missing apt-utils netcat && rm -rf /var/lib/apt/lists/*

USER root

#
# VSFTPD
#
RUN echo "anon_root=/var/lib/motion" >> /etc/vsftpd.conf \
      && sed -i -e"s/^.*listen=.*$/listen=YES/" /etc/vsftpd.conf \
      && sed -i -e"s/^.*listen_ipv6=.*$/listen_ipv6=NO/" /etc/vsftpd.conf \
      && sed -i -e"s/^.*anonymous_enable=.*$/anonymous_enable=YES/" /etc/vsftpd.conf

#Change directory so that our commands run inside this new directory
WORKDIR /root

# Copy dependency definitions
COPY package.json /root

COPY app/resources/init.d/.asoundrc /root/

# Install dependencies
RUN JOBS=MAX npm i --unsafe-perm --production

# Get all the code needed to run the app
COPY . /root

ENV TINI_SUBREAPER=true

EXPOSE 9000

ENTRYPOINT ["tini","-s", "--"]

CMD ["npm", "start"]
