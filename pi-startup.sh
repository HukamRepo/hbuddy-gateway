#! /bin/sh

mkdir /tmp/motion
mkdir /tmp/motion/cam1
touch /tmp/motion/motion.log
sudo chmod 755 -R /tmp/motion

sudo modprobe bcm2835-v4l2

sudo rm -rf ~/.asoundrc

wget https://raw.githubusercontent.com/sinny777/hbuddy-gateway/master/gateway/app/resources/init.d/.asoundrc
mv .asoundrc ~/.asoundrc

docker run --privileged -d -p 9000:9000 --name gateway-app -v /opt:/opt -v /tmp:/tmp -e CLOUDANT_URL=REPLACE_WITH_CLOUDANT_URL hukam/gateway-app

sleep 3 &

docker run -it -d --name motion -p 90:9090 -p 9091:9091 -v /tmp:/tmp --link gateway-app:gateway-app --device=/dev/video0 hukam/rpi-motion-detection

sleep 5 &

docker start motion

sleep 5 &

docker stop motion
