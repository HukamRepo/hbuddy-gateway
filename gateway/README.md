# Hukam Hbuddy - Home Automation IoT Gateway

## How to setup Hukam IoT Gateway - hBuddy


## Requirements
* WiFi Connection
* An SD Card

# Initial Gateway Setup

_The following changes to the freshly imaged SD card should be made on your computer before you plug the card into the Gateway for the first time._

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
Power on your hBuddy and open browser of your choice at following URL:
http://hbuddy-gateway.local
