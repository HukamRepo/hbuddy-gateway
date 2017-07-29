# Hukam - hBuddy IoT Gateway

A Node application which makes connecting your Hukam Gateway (RaspberryPi 3) to your home wifi easier

## hBuddy DOCKER Container

RUN Docker container by following command:

docker run --rm -p 9000:9000 --privileged -it hukam/gateway-app npm start

Ubuntu base image:
https://github.com/phusion/baseimage-docker

## Connecting to WiFi?

When unable to connect to a wifi network, this service will turn the RPI into a wireless AP. This allows us to connect to it via a phone or other device and configure our home wifi network (for example).

Once configured, it prompts the PI to reboot with the appropriate wifi credentials. If this process fails, it immediately re-enables the PI as an AP which can be configurable again.

Special thanks to this [blog](https://github.com/sabhiram/raspberry-wifi-conf), which I used as a reference for connecting to the Wifi on our Gateway.

That project broadly follows these [instructions](http://www.maketecheasier.com/set-up-raspberry-pi-as-wireless-access-point/) in setting up a RaspberryPi as a wireless AP.

###Main files to be configured:
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf

and

sudo nano /etc/network/interfaces

## Requirements

Make sure that NodeJs version `6.2.2` is installed.

## New Installation

Once login to your Gateway (rPi):

Run following command:

```
wget https://raw.githubusercontent.com/sinny777/hukam-gateway/master/app/resources/shellscripts/startup.sh
```

## For updating, pull and replace local
```sh
git fetch --all
git reset --hard origin/master
```

## Setup the app as a service

There is a startup script included to make the server starting and stopping easier. Do remember that the application is assumed to be installed under `/home/pi/hukam-gateway`. Feel free to change this in the `assets/init.d/hukam-gateway` file.

```sh
$sudo cp assets/init.d/hukam-gateway /etc/init.d/hukam-gateway
$sudo chmod +x /etc/init.d/hukam-gateway
$sudo update-rc.d hukam-gateway defaults
```

#### Gotchas

The `hostapd` application does not like to behave itself on some wifi adapters (RTL8192CU et al). This link does a good job explaining the issue and the remedy: [Edimax Wifi Issues](http://willhaley.com/blog/raspberry-pi-hotspot-ew7811un-rtl8188cus/). The gist of what you need to do is as follows:

```
# run iw to detect if you have a rtl871xdrv or nl80211 driver
$iw list
```

If the above says `nl80211 not found.` it means you are running the `rtl871xdrv` driver and probably need to update the `hostapd` binary as follows:
```
$cd hukam-gateway
$sudo mv /usr/sbin/hostapd /usr/sbin/hostapd.OLD
$sudo mv app/resources/bin/hostapd.rtl871xdrv hostapd
$sudo chmod 755 /usr/sbin/hostapd
```

Note that the `wifi_driver_type` config variable is defaulted to the `nl80211` driver. However, if `iw list` fails on the app startup, it will automatically set the driver type of `rtl871xdrv`. Remember that even though you do not need to update the config / default value - you will need to use the updated `hostapd` binary bundled with this app.

TODO: Automatically maintain the correct version of `hostapd` based on the `wifi_driver_type`.

## Usage

This is approximately what occurs when we run this app:

1. Check to see if we are connected to a wifi AP
2. If connected to a wifi, do nothing -> exit
3. (if not wifi, then) Convert RPI to act as an AP (with a configurable SSID)
4. Host a lightweight HTTP server which allows for the user to connect and configure the RPIs wifi connection. The interfaces exposed are RESTy so other applications can similarly implement their own UIs around the data returned.
5. Once the RPI is successfully configured, reset it to act as a wifi device (not AP anymore), and setup it's wifi network based on what the user selected.
6. At this stage, the RPI is named, and has a valid wifi connection which it is now bound to.

Typically, I have the following line in my `/etc/rc.local` file:
```
cd /home/pi/hukam-gateway
sudo /usr/bin/node server.js
```

Note that this is run in a blocking fashion, in that this script will have to exit before we can proceed with others defined in `rc.local`. This way I can guarantee that other services which might rely on wifi will have said connection before being run. If this is not the case for you, and you just want this to run (if needed) in the background, then you can do:

```
cd /home/pi/hukam-gateway
sudo /usr/bin/node server.js < /dev/null &
```

## User Interface

In my config file, I have set up the static ip for my PI when in AP mode to `192.168.44.1` and the AP's broadcast SSID to `hukam-gateway`. These are images captured from my osx dev box.

Step 1: Power on Pi which runs this app on startup (assume it is not configured for a wifi connection). Once it boots up, you will see `hukam-gateway` among the wifi connections.  The password is configured in config.json.

<img src="https://raw.githubusercontent.com/sabhiram/public-images/master/raspberry-wifi-conf/wifi_options.png" width="200px" height="160px" />

Step 2: Join the above network, and navigate to the static IP and port we set in config.json (`http://192.168.44.1:88`), you will see:

<img src="https://raw.githubusercontent.com/sabhiram/public-images/master/raspberry-wifi-conf/ui.png" width="404px" height="222px" />

Step 3: Select your home (or whatever) network, punch in the wifi passcode if any, and click `Submit`. You are done! Your Pi is now on your home wifi!!

## Testing

TODO

## TODO

1. Automate the deployment of alternate `hostapd` application
2. Automate provisioning of the application dependencies
3. Make the running of scripts cleaner and more easy to read
4. ifup should never be allowed to fail... same w/ the "start" pieces of various services. Perhaps we need to tease the restart into stop and start and allow the stop to fail.
5. Add tests
6. Add travis ci / coveralls hook(s)

## Speech To Text Feature Related
https://www.npmjs.com/package/node-arecord
http://linuxcommand.org/man_pages/arecord1.html
Offline STT: https://wolfpaulus.com/journal/embedded/raspberrypi2-sr/
sudo apt-get install alsa-base alsa-utils
aplay -l
alsamixer

---------------------

XBEE CONFIGURATION

CORDINATOR:
Channel: C
ID PAN ID: 101
DH: 0
DL (High): 0
DL (Low): 0
Scan Channel: 7FFF
SD Scan Duration: 4
SM Sleep Mode: No Sleep [0]
