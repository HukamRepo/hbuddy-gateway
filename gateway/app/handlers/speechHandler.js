
var CONFIG = require('../common/common').CONFIG();

var cp = require('child_process');
var format = require('util').format;
var fs = require('fs');
var watson = require('watson-developer-cloud');
var eventEmmiter = require('../common/common').EVENTS();

var googleKeyPath = require('path').resolve(__dirname, '../resources/keys/hukam-f32b2442e888.json');
var audioFile = "output.raw";
//var recordingsPath = require('path').resolve(__dirname, '../recordings');
var recordingsPath = "/tmp";//TODO: Change this later

var hotwordsFilePath = require('path').resolve(__dirname, '../resources/hotwords/heyBuddy.pmdl');
const VoiceOffline = require(require('path').resolve(__dirname, '../utils/voiceoffline.js'));

const GOOGLE_SPEECH = require('@google-cloud/speech');
var speech = GOOGLE_SPEECH({
  projectId: 'hukam-157906',
  keyFilename: googleKeyPath
});

var ttsCredentials = CONFIG.SERVICES_CONFIG.tts;
ttsCredentials.version = 'v1';
var ttsService = watson.text_to_speech(ttsCredentials);

var watsonResponse = {};

module.exports = function() {

var methods = {};

	eventEmmiter.on('TTS', function(payload) {
			console.log("IN TTS EVENT received: >> ", payload);
			methods.convertTTS(payload);
	});

	methods.speechToText = function(cb) {
		console.log("IN speechHandler, speechToText >>>>>>> ");
		try{
			const language = "en-IN";
			var hotwords = [{ file: hotwordsFilePath, hotword: 'hey buddy', sensitivity: '0.5' }];
			var voiceOffline = VoiceOffline.init({ hotwords, language }, speech);
			VoiceOffline.start(voiceOffline);

			voiceOffline.on('hotword', (index, keyword) => console.log("hBuddy Listening Now !! ", keyword, ", index: ", index));

			voiceOffline.on('partial-result', function(result){
				console.log("PartialResult: >> ", result);
			});

			voiceOffline.on('final-result', function(result){
				if(cb){
					cb(result);
				}
			});

			voiceOffline.on('silence', function(result){
	//			console.log("Silence Triggered !! ");
			});

			voiceOffline.on('error', function(error){
				console.log("VoiceOffline ERROR: >>> ", error);
			});
		}catch(err){
			console.log("Error in speechHandler: >>> ", err);
			throw new Error("Error in speechHandler: >>> ", err);
		}
	};

	methods.convertTTS = function(query, errorFunc){
		if(!query || !query.text || query.text.length < 3){
			return;
		}
		var outfile = recordingsPath+"/tts.opus";
		var transcript = ttsService.synthesize(query).pipe(fs.createWriteStream(outfile))
        .on('error', errorFunc)
        .on('close', function() {
        	methods.playAudioFrom(outfile);
         });
	};

	methods.playAudioFrom = function(filePath) {
		console.log('IN playAudioFrom: >> ', filePath);
        console.log('playing %s', filePath);
        cp.exec(format('omxplayer -o local %s', filePath));
	};

	methods.stopTTS = function() {
		console.log('IN speechHandler.stopTTS: >> ');
	};

	methods.stopSTT = function() {
		console.log('IN speechHandler.stopSTT: >> ');
		VoiceOffline.stop();
	};


    return methods;

}
