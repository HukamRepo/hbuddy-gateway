#!/bin/bash
#
# Provides: gateway
# Short-Description: Start/Stop Hukam Gateway
# chkconfig: 234 20 80
#
#
# Copyright (C) 2016 GransLive
#
# This program is free software: you can redistribute it and/or modify it under
# the terms of the GNU General Public License as published by the Free Software
# Foundation, either version 3 of the License, or (at your option) any later
# version.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of  MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along with
# this program.  If not, see <http://www.gnu.org/licenses/>.
#
# Source: https://github.com/sinny777/hbuddy-gateway

# sudo -i
 echo "<<<< INSIDE HUKAM GATEWAY STARTUP SCRIPT  >>>>>"

# Functions ==============================================

# return 1 if global command line program installed, else 0
# example
# echo "node: $(program_is_installed node)"
function program_is_installed {
  # set to 1 initially
  local return_=1
  # set to 0 if not found
  type $1 >/dev/null 2>&1 || { local return_=0; }
  # return value
  echo "$return_"
}

# return 1 if local npm package is installed at ./node_modules, else 0
# example
# echo "gruntacular : $(npm_package_is_installed gruntacular)"
function npm_package_is_installed {
  # set to 1 initially
  local return_=1
  # set to 0 if not found
  ls node_modules | grep $1 >/dev/null 2>&1 || { local return_=0; }
  # return value
  echo "$return_"
}

# display a message in red with a cross by it
# example
# echo echo_fail "No"
function echo_fail {
  # echo first argument in red
  printf "\e[31m✘ ${1}"
  # reset colours back to normal
  echo "\033[0m"
}

# display a message in green with a tick by it
# example
# echo echo_fail "Yes"
function echo_pass {
  # echo first argument in green
  printf "\e[32m✔ ${1}"
  # reset colours back to normal
  echo "\033[0m"
}

# echo pass or fail
# example
# echo echo_if 1 "Passed"
# echo echo_if 0 "Failed"
function echo_if {
  if [ $1 == 1 ]; then
    echo_pass $2
  else
    echo_fail $2
  fi
}

# ============================================== Functions

cd ~
if [ ! -d "hukam" ]; then
	mkdir hukam
	echo "<<<< hukam DIRECTORY CREATED >>>>>"
fi
cd hukam
if [ ! -d "tools" ]; then
	mkdir tools
	echo "<<<< tools DIRECTORY CREATED >>>>>"
fi

cd tools

sudo apt-get install python3 python3-pip python-pyaudio python3-pyaudio sox gcc
sudo pip3 install pyaudio
sudo apt-get install -y --no-install-recommends --fix-missing libatlas-base-dev libudev-dev portaudio19-dev

if [ $(program_is_installed node) == 0 ]; then
	echo "<<<< GOING TO INSTALL NODEJS INSIDE hukam/tools DIRECTORY >>>>>"
	#wget https://nodejs.org/dist/v4.3.2/node-v4.3.2-linux-armv6l.tar.gz
	wget https://nodejs.org/dist/v6.2.2/node-v6.2.2-linux-armv6l.tar.gz
	tar -xvf node-v6.2.2-linux-armv6l.tar.gz
	sudo rm -rf node-v6.2.2-linux-armv6l.tar.gz
	cd node-v6.2.2-linux-armv6l
	sudo cp -R * /usr/local/
else
	echo "node $(echo_if $(program_is_installed node))"
	echo "NODE ALREADY INSTALLED"
fi

if [ $(program_is_installed git) == 0 ]; then
	echo "<<<< GOING TO INSTALL GIT >>>>>"
	sudo apt-get install git
	sudo npm install bower -g
else
	echo "git  $(echo_if $(program_is_installed git))"
	echo "GIT ALREADY INSTALLED"
fi

cd ..

if [ ! -d "hbuddy-gateway" ]; then
	echo "<<<< GOING TO CREATE HUKAM hBUDDY GATEWAY APPLICATION >>>>>"
	sudo git clone https://github.com/sinny777/hbuddy-gateway.git
	cd hbuddy-gateway
else
	echo "<<<< GOING TO UPDATE HUKAM hBUDDY GATEWAY APPLICATION >>>>>"
	cd hbuddy-gateway
	sudo git fetch --all
	sudo git reset --hard origin/master
fi

sudo cp app/resources/init.d/.asoundrc ~/.asoundrc
	
sudo npm install -g node-gyp
sudo npm install -g node-pre-gyp
sudo npm install -g serialport --unsafe-perm --build-from-source

sudo npm update
sudo bower --allow-root install

exit 0
