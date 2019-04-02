#!/bin/bash

#echo -e "GET http://google.com HTTP/1.0\n\n" | nc google.com 80 > /dev/null 2>&1
#if [ $? -eq 0 ]; then

if [[ $# < 1 ]];
	then echo "You need to pass gatewayId"
	echo "Usage:"
	echo "sudo $0 SSID password [apName]"
	exit
fi

GATEWAY_ID=$1

echo $GATEWAY_ID

ssh -t -t -R $GATEWAY_ID.serveo.net:80:localhost:9000 serveo.net &&

echo "Gateway has now access on https ..."

exit 0
