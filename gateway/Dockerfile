FROM resin/rpi-raspbian:jessie

ENV INITSYSTEM on \
  AUDIODEV hw:1,0 \
  AUDIODRIVER alsa \
  BUILD_VERSION="V2"

MAINTAINER Gurvinder Singh <contact@hukamtechnologies.com>

USER root

RUN apt-get update && \
    apt-get -qy install curl ca-certificates \
    -y --no-install-recommends --fix-missing libatlas-base-dev libudev-dev portaudio19-dev \
    python3 python3-pip python-pyaudio python3-pyaudio sox \
    apt-utils csh build-essential make cmake tcsh bc gawk motion curl \
    libatlas-base-dev libudev-dev && rm -rf /var/lib/apt/lists/*

RUN pip3 install pyaudio

#
# VSFTPD
#
RUN echo "anon_root=/var/lib/motion" >> /etc/vsftpd.conf \
      && sed -i -e"s/^.*listen=.*$/listen=YES/" /etc/vsftpd.conf \
      && sed -i -e"s/^.*listen_ipv6=.*$/listen_ipv6=NO/" /etc/vsftpd.conf \
      && sed -i -e"s/^.*anonymous_enable=.*$/anonymous_enable=YES/" /etc/vsftpd.conf

#
# ALSA (http://julius.sourceforge.jp/forum/viewtopic.php?f=9&t=66)
#
RUN echo 'pcm.array { type hw card 1 }' >! ~/.asoundrc
RUN echo 'pcm.array_gain { type softvol slave { pcm "array" } control { name "Mic Gain" count 2 } min_dB -10.0 max_dB 5.0 }' >> ~/.asoundrc
RUN echo 'pcm.cap { type plug slave { pcm "array_gain" channels 4 } route_policy sum }' >> ~/.asoundrc

COPY app/resources/init.d/.asoundrc ~/.asoundrc
COPY ./ /root
WORKDIR /root

RUN curl -O \
  https://nodejs.org/dist/v8.2.1/node-v8.2.1-linux-armv7l.tar.gz
RUN tar -xvf node-*.tar.gz -C /usr/local \
  --strip-components=1

  RUN npm config set unsafe-perm true -g --unsafe-perm
  RUN npm install -g node-gyp@3.4.0
  RUN npm install -g node-pre-gyp --fallback-to-build
  RUN npm install serialport@4.0.7 --save --unsafe-perm --build-from-source

RUN npm install

EXPOSE 9000

CMD ["node","server.js"]
