
var CONFIG = require('../config/config').get();
var conversationHandler = require('../handlers/conversationHandler')();

var cp = require('child_process');
var format = require('util').format;
var fs = require('fs');
const GOOGLE_SPEECH = require('@google-cloud/speech');
var watson = require('watson-developer-cloud');

var Sound = require('node-arecord');
var sound;

var googleKeyPath = require('path').resolve(__dirname, '../config/granslive-cd7fa4ae7894.json');
var audioFile = "output.raw";
//var recordingsPath = require('path').resolve(__dirname, '../recordings');
var recordingsPath = "/tmp";//TODO: Change this later

var speech = GOOGLE_SPEECH({
  projectId: 'granslive',
  keyFilename: googleKeyPath
});

var ttsCredentials = CONFIG.SERVICES_CONFIG.stt;
ttsCredentials.version = 'v1';
var textToSpeech = watson.text_to_speech(ttsCredentials);
var speakInVoice = "en-US_AllisonVoice";

var watsonResponse = {};

module.exports = function() {
    
var methods = {};
  	
	methods.refreshAudioFile = function(cb){
		fs.exists(audioFile, function(exists) {
			  if(exists) {
				  fs.unlink(audioFile, function(err){
				      cb(err);
				   });
			  }else{
				  cb(null);
			  }
			});
		
	};
	
	methods.speechToText = function(cb){
		console.log('\n\n<<<<<<<< IN startSTT >>>>>>>');
		sound = new Sound({
			 debug: true, 
			 destination_folder: recordingsPath,
			 filename: audioFile,
			 alsa_format: 'S16_LE',
			 alsa_device: 'plughw:1,0',
			 alsa_addn_args: ['-c', '1', '-r', 16000, '-t', 'raw']
			});
		
		sound.on("complete", function(){
		    console.log('Done with recording!');
		    methods.convertSTT(recordingsPath+"/"+audioFile, function(result){
		    	if(result && result.isFinal){
			    	  if(cb){
			    		  cb(result.transcript);
			    	  }
			      }
			});
		});
		
		sound.record();
		
		setTimeout(function(){
		    console.log('stop recording after 5 seconds !');
		    sound.stop();
		}, 5000);
	};
	
	methods.stopSTT = function(req, res){
		if(sound){
			sound.stop();
		}
	};
	
	methods.convertSTT = function(audioFilePath, cb){
		var request = {
				  config: {
				    encoding: 'LINEAR16',
				    sampleRate: 16000,
				    languageCode: 'en-IN'
				  },
				  singleUtterance: false,
				  interimResults: false,
				  verbose: true
				};
		
		fs.createReadStream(audioFilePath)
		  .on('error', console.error)
		  .pipe(speech.createRecognizeStream(request))
		  .on('error', console.error)
		  .on('data', function(data) {
		    if(data && data.results && data.results.length > 0){
		      var result = data.results[0];
		      cb(result);
		    }else{
		    	cb(null);
		    }
		  });
	};
	
	methods.convertTTS = function(query, errorFunc){
	//	var outfile = require('path').resolve(__dirname, '../recordings/tts.opus');
		var outfile = recordingsPath+"/tts.opus";
		var transcript = textToSpeech.synthesize(query).pipe(fs.createWriteStream(outfile))
	    .on('error', errorFunc)
	    .on('close', function() {
	    	methods.playAudioFrom(outfile);
	     });
		/*
		  transcript.on('response', function(response) {
			  console.log("RESPONSE OF TTS: >>> ");
		    if (query.download) {
		      response.headers['content-disposition'] = 'attachment; filename=transcript.ogg';
		    }
		  });
		  transcript.on('error', function(error) {
		    next(error);
		  });
		  transcript.pipe(res);
		  */
	};
	
	methods.playAudioFrom = function(filePath) {
		console.log('IN playAudioFrom: >> ', filePath);
	    console.log('playing %s', filePath);
	    cp.exec(format('omxplayer -o local %s', filePath));
	};	
	
	methods.stopTTS = function() {
		console.log('IN speechHandler2.stopTTS: >> ');        
	};
	
    return methods;
    
}