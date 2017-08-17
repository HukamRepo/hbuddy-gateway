#! /bin/sh

mkdir /tmp/motion
mkdir /tmp/motion/cam1
touch /tmp/motion/motion.log
sudo chmod 755 -R /tmp/motion

sudo modprobe bcm2835-v4l2

wget https://raw.githubusercontent.com/sinny777/hbuddy-gateway/master/gateway/app/resources/init.d/.asoundrc
mv .asoundrc ~/.asoundrc

docker run --rm -d -p 9000:9000 --name gateway-app -v /opt:/opt -v /tmp:/tmp --privileged -it hukam/gateway-app

sleep 3 &

docker run --rm -it -d --name motion -p 80:8080 -p 8081:8081 -v /tmp:/tmp --link gateway-app:gateway-app --device=/dev/video0 hukam/rpi-motion-detection
#docker run --rm -it -d --name motion -p 80:8080 -p 8081:8081 -v /tmp/motion:/mnt/motion --link gateway-app:gateway-app --device=/dev/video0 lazyatom/rpi-motion


sleep 5 &

docker exec -it motion motion

sleep 5 &

docker exec -it motion sudo motion
