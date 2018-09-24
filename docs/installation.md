# Hukam Hbuddy - Home Automation Gateway

## How to setup Homebridge & Docker on a Raspberry Pi



## Requirements
* WiFi Connection
* An SD Card

# Initial Raspberrypi Setup

## Download and Install Raspbian Stretch
Get the latest copy of Raspbian Stretch from the official Raspberry Pi website and image this to your SD card.

* Raspbian Stretch Lite is prefered as there is no need to run a GUI desktop.
* How to install Raspberry Pi Operating System Images

## Configure Raspbian for Headless Boot

By default SSH access and WiFi are disabled in Raspbian. You can enable both these services before we boot from the SD card for the first time - this will avoid the need to ever connect a screen to the Pi.

_The following changes to the freshly imaged SD card should be made on your computer before you plug the card into the Raspberry Pi for the first time._

## Enable SSH
To enable remote SSH access on first boot create an empty file called ssh in the root of the SD card.

## Enable WiFi (Optional)
If you have a Raspberry Pi with built in WiFi (Pi 3 or Zero W), you can configure WiFi on first boot. To do this create a file named wpa_supplicant.conf in the root of the SD card that contains the following (replace the [YOUR_COUNTRY_CODE](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2), YOUR_SSID and YOUR_PASSWORD values):

```
country=YOUR_COUNTRY_CODE
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
    ssid="YOUR_SSID"
    scan_ssid=1
    psk="YOUR_PASSWORD"
    key_mgmt=WPA-PSK
}
```
## Login
Power on your Raspberry Pi and connect to the console using SSH.

If you're running macOS or have Bonjour for Windows (part of iTunes) installed, you should be able to connect using raspberrypi.local as the hostname. If not then you'll need to find out what IP address the Raspberry Pi was assigned and connect using that instead.

```
ssh pi@raspberrypi.local
```
The default username is pi and password raspberry. You should change the default password now using the passwd command.

# 1. Install Docker
Install Docker from the official repository by running these commands:
```
# Add Docker’s official GPG key:
curl -fsSL https://download.docker.com/linux/raspbian/gpg | sudo apt-key add -

# Use the following command to set up the stable repository:
echo "deb [arch=armhf] https://download.docker.com/linux/raspbian stretch stable" | sudo tee /etc/apt/sources.list.d/docker.list

# Update sources and install docker
sudo apt-get update
sudo apt-get install docker-ce
```
Add the pi user to the docker group:
```
sudo usermod -aG docker pi && logout
```
_You will need to logout of the Raspberry Pi and login again in order for your user to pick up the docker group membership._

# 2. Install Docker Compose
[Docker Compose](https://docs.docker.com/compose/overview/) allows you to easily create a manifest for your Docker containers. Since Docker Compose does not provide an official binary for ARM, you need to install it using Python:

```
sudo apt-get -y install python-setuptools && sudo easy_install pip  && sudo pip install docker-compose
```
# 3. Create Docker Compose Manifest
Create a new directory to store your homebridge docker-compose manifest and config data in. In this example we will install Homebridge in the pi user's home directory.

Create a new directory and change into it:
```
mkdir /home/pi/homebridge
cd /home/pi/homebridge
```
Create a new file called docker-compose.yml using nano:
```
nano docker-compose.yml
```
The contents of this file should be:
```
version: '2'
services:
  homebridge:
    image: oznu/homebridge:raspberry-pi
    restart: always
    network_mode: host
    volumes:
      - ./config:/homebridge
    environment:
      - PGID=1000
      - PUID=1000
      - HOMEBRIDGE_CONFIG_UI=1
      - HOMEBRIDGE_CONFIG_UI_PORT=8080
```

* The restart: always line instructs docker to setup the container so that it that will automatically start again if the Raspberry Pi is rebooted, or if the container unexpectedly quits or crashes.
* The network_mode: host line instructs docker to share the Raspberry Pi's network with the container, allowing your iOS device to find the Homebridge accessory.
* The ./config:/homebridge instructs docker to share the local folder config with the container. This will allow you to recreate or update the docker container without losing any Homekit settings or Homebridge plugins.
* For an explanation of the PGID and PUID environment variables please see User & Group Identifiers.
* The HOMEBRIDGE_CONFIG_UI and HOMEBRIDGE_CONFIG_UI_PORT enable the homebridge-config-ui-x plugin. You can remove these two options if you don't want to use the UI.

Save and close the file by pressing CTRL+X.

# 4. Start Homebridge
Start the Homebridge Docker container by running:
```
docker-compose up -d
```
* It might take some time to download the initial image which is about 125 MB compressed.
* Docker will now download the latest oznu/homebridge docker image.
* The -d flag tells docker-compose to run the container as a background process.

You'll probably want to view the Homebridge logs to check everything is working and to get the iOS pairing code:
```
docker-compose logs -f
```
Your Homebridge config.json, plugins and all HomeKit data will be stored in the newly created config directory.

# 5. Managing Homebridge
To manage Homebridge go to http://<ip of raspberry pi>:8080 in your browser. For example, http://192.168.1.20:8080. From here you can install, remove and update plugins, modify the Homebridge config.json and restart Homebridge.

The default username is admin with password admin. Remember you will need to restart Homebridge to apply any changes you make to the config.json.

You can restart the container by running:
```
docker-compose restart homebridge
```

# Connect iOS / HomeKit
You should now be able to see the Homebridge as a new HomeKit accessory in the Apple iOS Home App. You can pair the device using the QR code displayed in the logs (see above) or in browser using the Homebridge UI.

# Default Pairing Pin: 031-45-154
If the QR code is not displaying correctly and you're using using iOS 11 you will need to select Don't have a Code or Can't Scan and then under the Manual Code heading select the Enter code... link.

# Updating Homebridge
To update Homebridge to the latest version you just need to pull the latest version of [oznu/homebridge](https://hub.docker.com/r/oznu/homebridge/).
Download the latest [oznu/homebridge](https://hub.docker.com/r/oznu/homebridge/) image:
```
docker-compose pull homebridge
```
If a newer version of the image was downloaded, recreate the container using the new image by running the up command again:
```
docker-compose up -d
```
# Shell Access
If you require shell access to the container you can run:
```
docker-compose exec homebridge sh
```
