#! /bin/sh

mkdir /tmp/motion
mkdir /tmp/motion/cam1
touch /tmp/motion/motion.log
sudo chmod 755 -R /tmp/motion

sudo modprobe bcm2835-v4l2

sudo rm -rf ~/.asoundrc

wget https://raw.githubusercontent.com/sinny777/hbuddy-gateway/master/gateway/app/resources/init.d/.asoundrc
mv .asoundrc ~/.asoundrc

docker run --privileged -it -d -p 9000:9000 --name gateway-app -v /opt:/opt -v /tmp:/tmp -e CLOUDANT_URL=$CLOUDANT_URL hukam/gateway-app

sleep 3 &

docker run --privileged -it -d --name camera -p 80:9090 -p 8081:9091 -v /tmp:/tmp --link gateway-app:gateway-app --device=/dev/video0 hukam/security-camera motion

sleep 5 &
