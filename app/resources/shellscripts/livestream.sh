### BEGIN INIT INFO
#Provides:Stream startup
#Should-Start:console-screen debus network-manager
#Required-Start:$all
#Required-Stop:$remote_fs
#Default-Start:2 3 4 5
#Default-Stop: 0 1 6
#Short-Description: Starts avconv and the webcam live stream
### END INIT INFO
set -e
case "$1" in
start)
RESOLUTION="hd720"
BITRATE="200k"
FPS="2" #fps
STREAM_KEY="g03p-dvr3-x070-7axm"
STREAM_KEY2="qsp4-sgv7-63ya-0rwr"
SERVER_URL="rtmp://a.rtmp.youtube.com/live2"
echo "Starting avconv stream"
echo $RESOLUTION " " $FPS " " $BITRATE " " $SERVER_URL " " $STREAM_KEY2
#sudo avconv -f video4linux2 -s "$RESOLUTION" -r "$FPS" -b $BITRATE -i /dev/video0 -f flv $SERVER_URL$STREAM_KEY
#raspivid -o - -t 0 -vf -hf -fps 30 -b 6000000 | avconv -re -ar 44100 -ac 2 -acodec pcm_s16le -f s16le -ac 2 -i /dev/zero -f h264 -i - -vcodec copy -acodec aac -ab 128k -g 50 -strict experimental -f flv $SERVER_URL/$STREAM_KEY	

raspivid -o - -t 0 -w 1280 -h 720 -fps 25 -b 4000000 -g 50 | ffmpeg -re -ar 44100 -ac 2 -acodec pcm_s16le -f s16le -ac 2 -i /dev/zero -f h264 -i - -vcodec copy -acodec aac -ab 128k -g 50 -strict experimental -f flv $SERVER_URL/$STREAM_KEY2	

;;
stop)
echo "STOPPING STERAM"
skill $PROGRAMNAME
exit 1
;;
esac
exit 0