FROM hukam/pi3-base:v2

MAINTAINER Gurvinder Singh <contact@hukamtechnologies.com>

ENV INITSYSTEM on \
  AUDIODEV hw:1,0 \
  AUDIODRIVER alsa \
  BUILD_VERSION="V1"

# Updates and adds system required packages
RUN apt-get update

USER root

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

ENV TINI_SUBREAPER=true

EXPOSE 9000

ENTRYPOINT ["tini","-s", "--"]

CMD ["npm", "start"]
