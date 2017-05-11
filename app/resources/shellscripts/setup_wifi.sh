# Hukam 
# Wifi Setup
# This script configures WiFi credentials
#

if ls /media/pi/USB/interfaces > /dev/null 2>&1
then
    echo "There is at least one match (maybe more)!"
    sudo cp /media/pi/USB/configurations/interfaces /etc/network/interfaces
else
    echo "No interfaces file found in USB drive"
fi

if ls /media/pi/USB/wpa_supplicant.conf > /dev/null 2>&1
then
    echo "There is at least one match (maybe more)!"
    sudo cp /media/pi/USB/configurations/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf
else
    echo "No wpa_supplicant.conf file found in USB drive"
fi

sudo ifdown wlan0
sudo ifup wlan0