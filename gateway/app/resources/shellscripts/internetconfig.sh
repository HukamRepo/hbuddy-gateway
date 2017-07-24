#!/bin/bash

### BEGIN INIT INFO
# Provides: internetconfig
# Short-Description: Updates Wifi SSID and Password
### END INIT INFO

# if [ "$EUID" -ne 0 ]
# 	then echo "Must be root"
# 	exit
# fi

# USER=pi
# HOME=/home/pi
#
# export USER HOME

if [[ $# < 2 ]];
	then echo "You need to pass both ssid and password for Wifi connection!"
	echo "Usage:"
	echo "sudo $0 SSID password [apName]"
	exit
fi

SSID=$1
PWD=$2

# sed -i '' "s/SSID/$1/g" /etc/wpa_supplicant/wpa_supplicant.conf
# sed -i '' "s/PASSWORD/$2/g" /etc/wpa_supplicant/wpa_supplicant.conf

if ls ~/hbuddy/hbuddy-gateway/app/resources/etc/network/interfaces.wifi.template > /dev/null 2>&1
then
    echo "There is at least one match (maybe more)!"
    sudo cp ~/hbuddy/hbuddy-gateway/app/resources/etc/network/interfaces.wifi.template /etc/network/interfaces
else
    echo "No interfaces file found in USB drive"
fi

if ls ~/hbuddy/hbuddy-gateway/app/resources/wpa_supplicant/wpa_supplicant.conf > /dev/null 2>&1
then
    echo "There is at least one match (maybe more)!"
    sudo cp ~/hbuddy/hbuddy-gateway/app/resources/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf
else
    echo "No wpa_supplicant.conf file found in USB drive"
fi


sudo sed -i "s/ssid.*/ssid=\"$SSID\"/" /etc/wpa_supplicant/wpa_supplicant.conf
sudo sed -i "s/psk.*/psk=\"$PWD\"/" /etc/wpa_supplicant/wpa_supplicant.conf

echo "All done!"

exit 0
