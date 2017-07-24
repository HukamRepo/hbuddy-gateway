# Granslive iOS Home Kit 

##References
https://github.com/nfarina/homebridge/wiki/Running-HomeBridge-on-a-Raspberry-Pi
https://github.com/nfarina/homebridge

##Installing Nodejs on RaspberryPi 3
wget https://nodejs.org/dist/v4.3.2/node-v4.3.2-linux-armv6l.tar.gz 
tar -xvf node-v4.3.2-linux-armv6l.tar.gz 
cd node-v4.3.2-linux-armv6l
sudo cp -R * /usr/local/
node -v

##Install Avahi and other Dependencies
=>This is required by the mdns package in HAP-NodeJS library.
sudo apt-get install libavahi-compat-libdnssd-dev

##Install Homebridge and dependencies
sudo npm install -g --unsafe-perm homebridge hap-nodejs node-gyp
cd /usr/local/lib/node_modules/homebridge/
sudo npm install --unsafe-perm bignum
cd /usr/local/lib/node_modules/hap-nodejs/node_modules/mdns
sudo node-gyp BUILDTYPE=Release rebuild

DEBUG=* ./bin/homebridge -D -P /root/granslive/granslive-gateway/homekit/plugins/homebridge-granslive





