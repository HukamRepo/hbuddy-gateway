#! /bin/sh

mkdir /tmp/motion
mkdir /tmp/motion/cam1
touch /tmp/motion/motion.log

sudo modprobe bcm2835-v4l2

docker run --rm -d -p 9000:9000 --name gateway-app -v /tmp:/tmp --privileged -it hukam/gateway-app

sleep 3 &

docker run --rm -it -d --name motion -p 80:8081 -v /tmp:/tmp --link gateway-app:gateway-app --device=/dev/video0 hukam/rpi-motion-detection

sleep 3 &

docker exec -it motion motion

sleep 3 &

docker exec -it motion service motion start