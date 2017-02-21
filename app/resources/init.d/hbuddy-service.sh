#! /bin/bash
# /etc/init.d/hbuddy-service

### BEGIN INIT INFO
# Provides:          hbuddy-service
# Required-Start:    $local_fs $syslog $network
# Required-Stop:     $local_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Script to Start, Stop or Restart the Hukam hBuddy Gateway Service
# chkconfig: 234 20 80
### END INIT INFO

#HBUDDY_SERVICE_USAGE is the message if this script is called without any options
HBUDDY_SERVICE_USAGE="Usage: $0 {\e[00;32mstart\e[00m|\e[00;31mstop\e[00m|\e[00;31mkill\e[00m|\e[00;32mstatus\e[00m|\e[00;31mrestart\e[00m}"

node_pid() {
	echo `ps -fe | grep node | grep -v grep | tr -s " "|cut -d" " -f2`
}

start() {
	echo "Starting Hukam hBuddy Gateway service"
    pid=$(node_pid)
	if [ -n "$pid" ]; then
    	echo -e "\e[00;31mHukam hBuddy Gateway is already running (pid: $pid)\e[00m"
	else
    	cd ~/hukam/hbuddy-gateway
    	sudo node server.js &
    	echo $! > node.pid
	fi
	return 0
}

stop() {
	echo "Stopping Hukam hBuddy Gateway service"
	if [ -n "$(node_pid)" ]; then
     for pid in $(node_pid)
		do
		kill -9 $pid 2>&1 > /dev/null
		done
	fi

    PIDFile=~/hukam/hbuddy-gateway/node.pid
    if [ -f "$PIDFile" ]; then
        sudo kill -9 $(cat $PIDFile)
        sudo kill -9 $(($(cat $PIDFile) + 1))
        sudo rm $PIDFile
    fi
    return 0
}

status(){
	pid=$(node_pid)
	if [ -n "$pid" ]
    	then echo -e "\e[00;32mHukam hBuddy Gateway Service is running with pid: $pid\e[00m"
	else
    	echo -e "\e[00;31mHukam hBuddy Gateway Service is not running\e[00m"
    	return 3
	fi
}

terminate() {
	echo -e "\e[00;31mTerminating Hukam hBuddy Gateway Service \e[00m"
    sudo kill -9 $(node_pid)
}

case $1 in
	start)
	  start
	;;
	stop)
	  stop
	;;
	restart)
	  stop
	  start
	;;
	status)
		status
		exit $?
	;;
	kill)
		terminate
	;;
	*)
		echo -e $HUKAM_SERVICE_USAGE
	;;
esac

exit 0
