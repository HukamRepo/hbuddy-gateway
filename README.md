# Hukam Dockers

docker run --rm --privileged multiarch/qemu-user-static:register --reset

## Running Hukam Gateway Application Docker Container
`docker run --rm -p 9000:9000 --privileged -it hukam/gateway-app npm start`

## Running Hukam Gateway UI Docker Container
`docker run --rm -it -p 3000:4200 hukam/gateway-ui`

OR

`docker run --rm -it -p 3000:4200 hukam/pi-angular-cli:v1-arm ng serve --host=0.0.0.0 --disable-host-check`

## Running Docker container for motion detection

START CONTAINER

`docker run --rm -it -d --name motion -p 80:8081 -v /tmp:/tmp --device=/dev/video0 hukam/rpi-motion-detection`

TO START MOTION DETECTION

`docker exec -it motion motion`

TO STOP

`docker exec -it motion service motion stop`

## Running FaceRecognition Docker Container

`docker run -p 9000:9000 -p 8000:8000 -t -i bamos/openface /bin/bash -l -c '/root/openface/demos/web/start-servers.sh'`


## REFERENCES
[OpenCV on Raspberry Pi](http://www.pyimagesearch.com/2016/04/18/install-guide-raspberry-pi-3-raspbian-jessie-opencv-3/) |
[Motion Detection 1](https://github.com/remonlam/rpi-docker-motion) |
[Motion Detection 2](https://github.com/yushi/rpi-dockerfile) |
