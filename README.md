# Hukam Dockers

docker run --rm --privileged multiarch/qemu-user-static:register --reset

## Running Hukam Gateway Application Docker Container

`docker run --privileged -p 9000:9000 --name gateway-app -v /opt:/opt -v /tmp:/tmp -e CLOUDANT_URL=REPLACE_WITH_CLOUDANT_URL hukam/gateway-app`


## Running Hukam Gateway UI Docker Container
`docker run --rm -it -p 3000:4200 hukam/gateway-ui`

OR

`docker run --rm -d -it -p 3000:4200 hukam/pi-angular-cli:v1-arm ng serve --host=0.0.0.0 --disable-host-check`

## Running Docker container for motion detection

START CONTAINER

`docker run --privileged -it --name camera -p 9090:9090 -p 9091:9091 -v /tmp:/tmp --device=/dev/video0 hukam/security-camera motion`

`docker exec -it camera bash entrypoint.sh camera`

To start Live Streaming on Youtube
`docker exec -it camera bash entrypoint.sh live XXX-XXX-XXX`

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

## Remot3.io
To completely remove Weaved/remot3.it from your Pi perform the following two instructions in this order from command line:
`sudo weavedinstaller`
Sign in to your account and delete your services until they are all gone.
`sudo dpkg --purge weavedconnectd`
This command will remove all Weaved and/or remot3.it software and directories from the Pi.


## REFERENCES
[OpenCV on Raspberry Pi](http://www.pyimagesearch.com/2016/04/18/install-guide-raspberry-pi-3-raspbian-jessie-opencv-3/) |
[Motion Detection 1](https://github.com/remonlam/rpi-docker-motion) |
[Motion Detection 2](https://github.com/yushi/rpi-dockerfile) |

[VNC Connect and Raspberry Pi] (https://www.realvnc.com/en/connect/docs/raspberry-pi.html#raspberry-pi-setup)
[Tunnelpi](http://www.tunnelpi.com/scripts.html)
