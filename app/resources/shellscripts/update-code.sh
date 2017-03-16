#! /bin/sh

 ### BEGIN INIT INFO
 # Short-Description: Hukam hBuddy Gateway Update Code Script
 ### END INIT INFO

cd ~/hukam/hbuddy-gateway/
git fetch --all
git reset --hard origin/master

exit 0
