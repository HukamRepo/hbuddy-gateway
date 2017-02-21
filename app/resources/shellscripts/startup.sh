#! /bin/sh

 ### BEGIN INIT INFO
 # Short-Description: Hukam hBuddy Gateway Startup Script
 ### END INIT INFO

wget -q --spider http://google.com
if [ $? -eq 0 ]; then
    echo "Online"
    sudo rm -rf hbuddy-install.sh
	wget https://raw.githubusercontent.com/sinny777/hbuddy-gateway/master/app/resources/shellscripts/hbuddy-install.sh
	sudo bash hbuddy-install.sh

	sudo rm -rf hbuddy-service.sh
	wget https://raw.githubusercontent.com/sinny777/hbuddy-gateway/master/app/resources/init.d/hbuddy-service.sh
	sudo bash hbuddy-service.sh restart
else
    echo "Offline"
    sudo bash hbuddy-service.sh restart
fi

exit 0
