# Hukam Dockers

docker run --rm --privileged multiarch/qemu-user-static:register --reset

## Running Hukam Gateway Application Docker Container
`docker run --rm -d -p 9000:9000 --name gateway-app -v /opt:/opt -v /tmp:/tmp --privileged hukam/gateway-app`

`docker run --rm -it -p 9000:9000 --name gateway-app -v /opt:/opt -v /tmp:/tmp --privileged hukam/gateway-app`


## Running Hukam Gateway UI Docker Container
`docker run --rm -it -p 3000:4200 hukam/gateway-ui`

OR

`docker run --rm -d -it -p 3000:4200 hukam/pi-angular-cli:v1-arm ng serve --host=0.0.0.0 --disable-host-check`

## Running Docker container for motion detection

START CONTAINER

`docker run -it -d --name motion -p 90:9090 -p 9091:9091 -v /tmp:/tmp --device=/dev/video0 hukam/rpi-motion-detection`


MOTION DETECTION STANDALONE

`docker run -it -d --name motion -p 90:9090 -p 9091:9091 -v /tmp:/tmp --device=/dev/video0 hukam/rpi-motion-detection`

FOR LINKING CONTAINERS

`docker run -it -d --name motion 90:9090 -p 9091:9091 -v /tmp:/tmp --link gateway-app:gateway-app --device=/dev/video0 hukam/rpi-motion-detection`

TO START MOTION DETECTION

`docker start motion`

TO STOP

`docker stop motion`

## Running FaceRecognition Docker Container

`docker run -p 9000:9000 -p 8000:8000 -t -i bamos/openface /bin/bash -l -c '/root/openface/demos/web/start-servers.sh'`

## DOCKER COMMANDS

To Clear Docker logs

`truncate -s 0 /var/lib/docker/containers/*/*-json.log`

OR

`echo "" > $(docker inspect --format='{{.LogPath}}' <CONTAINER_ID_OR_NAME>)`

Stop and remove all containers:

`docker stop $(docker ps -a -q)`

`docker rm $(docker ps -a -q)`

Stop all stopped containers

`docker rm $(docker ps -a -q)`

Stop all untagged images

`docker rmi $(docker images | grep "^<none>" | awk "{print $3}")`

##TO Test Voice Recording and Audio
`$arecord -D plughw:1,0 -f cd test.wav`
`$aplay test.wav`


## REFERENCES
[OpenCV on Raspberry Pi](http://www.pyimagesearch.com/2016/04/18/install-guide-raspberry-pi-3-raspbian-jessie-opencv-3/) |
[Motion Detection 1](https://github.com/remonlam/rpi-docker-motion) |
[Motion Detection 2](https://github.com/yushi/rpi-dockerfile) |
