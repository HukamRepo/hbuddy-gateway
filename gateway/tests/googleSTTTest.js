
var spawn = require('child_process').spawn;
var CONFIG = require('../app/config/config').get();
var fs = require('fs');
var gcloud = require('google-cloud');
var watson = require('watson-developer-cloud');
var async = require('async');

var Sound = require('node-arecord');
var sound;

var googleKeyPath = require('path').resolve(__dirname, '../app/config/granslive-cd7fa4ae7894.json');
var audioFile = "audio.raw";
var recordingsPath = require('path').resolve(__dirname, '../recordings');
//var recordingsPath = "/tmp";//TODO: Change this later

var speech = gcloud.speech({
  projectId: 'granslive',
  keyFilename: googleKeyPath
});

var ttsCredentials = CONFIG.SERVICES_CONFIG.stt;
ttsCredentials.version = 'v1';
var textToSpeech = watson.text_to_speech(ttsCredentials);

var methods = {};

	methods.convertSTT = function(audioFilePath, cb){
		console.log("IN convertSTT:>>> ", audioFilePath);
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
		      if(result.isFinal){
		    	  methods.convertTTS(result.transcript);
		      }
//		      cb(result.isFinal);
		    }else{
//		    	cb(false);
		    }
		  });
	};
	
	methods.convertTTS = function(transcript){
		console.log("You said: ", transcript);
  	  	var query = {"voice": "en-US_AllisonVoice", "text": transcript, "download": true };
		var transcript = textToSpeech.synthesize(query);
		  transcript.on('response', function(response) {
			  try{
				  this.process = spawn('aplay', [response]);
				  var self = this;
				  this.process.on('exit', function (code, sig) {
				    if (code !== null && sig === null) {
				      self.emit('complete');
				    }
				  });

				  if (this.debug) {
				    this.process.stdout.on('data', function (data) {
				      console.log('Data: ' + data);
				    });
				    this.process.stderr.on('error', function (data) {
				      console.log('Error: ' + data);
				    });
				    this.process.on('close', function (code) {
				      console.log('arecord closed: ' + code);
				    });
				  }
			  }catch(err){
				  console.log(err);
			  }
		  });
		  transcript.on('error', function(error) {
		    next(error);
		  });
	}
	
methods.convertSTT(recordingsPath+"/"+audioFile, function(isFinal){
	if(isFinal){
		console.log("TEST COMPLETED >>>>> ");
	}
});


