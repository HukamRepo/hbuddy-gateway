#!/bin/bash
RTMP_URL=rtmp://a.rtmp.youtube.com/live2
STREAM_KEY=g03p-dvr3-x070-7axm
STREAM_KEY2="qsp4-sgv7-63ya-0rwr"
while :
do
#raspivid -n -vf -hf -t 0 -w 960 -h 540 -fps 25 -b 500000 -o - | ffmpeg -i - -vcodec copy -an -metadata title="Streaming from raspberry pi camera" -f flv $RTMP_URL/$STREAM_KEY
	raspivid -o - -t 0 -w 1280 -h 720 -fps 25 -b 4000000 -g 50 | ffmpeg -re -ar 44100 -ac 2 -acodec pcm_s16le -f s16le -ac 2 -i /dev/zero -f h264 -i - -vcodec copy -acodec aac -ab 128k -g 50 -strict experimental -f flv $RTMP_URL/$STREAM_KEY2
  sleep 2
done 