FROM hypriot/rpi-node:8.1.3
# Enable systemd
ENV INITSYSTEM on
MAINTAINER Gurvinder Singh <contact@hukamtechnologies.com>
#
# install packages for "motion" and mail support
#
RUN apt-get update
RUN apt-get install -q -y --no-install-recommends --fix-missing \
  apt-utils \
  csh \
  build-essential \
  make \
  cmake \
  tcsh \
  bc \
  gawk \
  motion \
  imagemagick \
  sysstat rsync ssh \
  curl \
  python3 \
  python-pip \
  python3-pip \
  x264 \
  unzip \
  vsftpd \
  gcc

RUN apt-get install -q -y --no-install-recommends --fix-missing \
  bison \
  alsa-base \
  alsa-utils \
  autoconf \
  automake \
  libasound2-dev \
  libtool \
  portaudio19-dev python-all-dev python3-all-dev \
  python-pyaudio \
  python3-pyaudio \
  sox

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
COPY . /usr/src/app
WORKDIR /usr/src/app

#
# resin-electron dependencies
#
RUN apt-get update && apt-get install -y --fix-missing \
  clang \
  libatlas-base-dev \
  libudev-dev && rm -rf /var/lib/apt/lists/*

USER root
ENTRYPOINT []

# audio drivers
ENV AUDIODEV hw:1,0
ENV AUDIODRIVER alsa

RUN pip3 install pyaudio

RUN npm install --ignore-scripts --unsafe-perm
RUN npm config set unsafe-perm true -g --unsafe-perm
RUN npm install -g node-gyp@3.4.0
RUN npm install -g node-pre-gyp --fallback-to-build
RUN npm install serialport@4.0.7 --save --unsafe-perm --build-from-source
RUN JOBS=MAX npm install --production


CMD ["node","server.js"]
