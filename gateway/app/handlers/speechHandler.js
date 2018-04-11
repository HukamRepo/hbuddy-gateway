

var FACTORY = require('../common/commonFactory')();
var cp = require('child_process');
var format = require('util').format;
var fs = require('fs');
var watson = require('watson-developer-cloud');
var eventEmmiter = require('../common/common').EVENTS();

var googleKeyPath = require('path').resolve(__dirname, '../resources/keys/hukam-f32b2442e888.json');

//var recordingsPath = require('path').resolve(__dirname, '../recordings');
var recordingsPath = "/tmp";//TODO: Change this later

var hotwordsFilePath = require('path').resolve(__dirname, '../resources/hotwords/heyBuddy.pmdl');
const VoiceOffline = require(require('path').resolve(__dirname, '../utils/voiceoffline.js'));

const GOOGLE_SPEECH = require('@google-cloud/speech');
var speech = GOOGLE_SPEECH({
  projectId: 'hukam-157906',
  keyFilename: googleKeyPath
});

var ttsCredentials = FACTORY.getGatewayConfig().SERVICES_CONFIG.tts;
ttsCredentials.version = 'v1';
var ttsService = watson.text_to_speech(ttsCredentials);

var TTS_CONFIG = {
		"voice":"en-US_AllisonVoice",
		"accept":"audio/wav",
		"download":true,
		"audioFile":"tts.wav"
}

var watsonResponse = {};
var context;

module.exports = function() {

var methods = {};

	eventEmmiter.on('TTS', function(text) {
			console.log("IN TTS EVENT received: >> ", text);
			var query = {"voice": TTS_CONFIG.speakInVoice,
  			  		"text": text,
  			  		"accept": TTS_CONFIG.accept,
  			  		"download": TTS_CONFIG.download };
			methods.convertTTS(query);
	});

	methods.speechToText = function(cb) {
		console.log("IN speechHandler, speechToText >>>>>>> ");
		try{
			context = {
					"gatewayId": gatewayInfo.gatewayId
				};
			const language = "en-IN";
			var hotwords = [{ file: hotwordsFilePath, hotword: 'hey buddy', sensitivity: '0.5' }];
			var voiceOffline = VoiceOffline.init({ hotwords, language }, speech);
			VoiceOffline.start(voiceOffline);

			voiceOffline.on('hotword', (index, keyword) => console.log("hBuddy Listening Now !! ", keyword, ", index: ", index));

			voiceOffline.on('partial-result', function(result){
				console.log("PartialResult: >> ", result);
			});

			voiceOffline.on('final-result', function(result){
				if(!result || result.length > 200){
					console.log("DO Nothing: >>> ", result);
				}else{
					console.log("STT RESPONSE: >>>", result);
					if(result == 'stop' || result == 'stop buddy' || result == 'thanks buddy' || result == 'thanks'){
						methods.stopTTS();
					}else{
						methods.getCommandResponse(result, true, function(err){
							console.log("STT ERROR Resp: >>> ", err);
						});
					}
				}
			});

			voiceOffline.on('silence', function(result){
	//			console.log("Silence Triggered !! ");
			});

			voiceOffline.on('error', function(error){
				console.log("VoiceOffline ERROR: >>> ", error);
			});

			if(cb){
				cb("hBuddy Listening now....");
			}

			methods.getCommandResponse("Hey Buddy", false, function(err){
				console.log("STT ERROR Resp: >>> ", err);
			});

		}catch(err){
			console.log("Error in speechHandler: >>> ", err);
//			throw new Error("Error in speechHandler: >>> ", err);
			console.log("ERROR while hBuddy Listening: ", err);
			cb(err);
		}
	};

	methods.getCommandResponse = function(commandResp, playTTS, errFunc){
		var conversationReq = {
								"params": {
											input: commandResp,
											"context": context
										}
								};
		FACTORY.ConversationHandler().callConversation(conversationReq, function(err, watsonResponse){
			if(err){
				console.log(err);
				if(errFunc){
					errFunc(err);
				}
			}else{

					if(watsonResponse && watsonResponse.context){
						context = watsonResponse.context;
					}

					if(watsonResponse && watsonResponse.output && watsonResponse.output.text){
						var respText = "";
						if(watsonResponse.output.log_messages){
							if(watsonResponse.output.log_messages.level == 'err'){
								console.log("ERROR In Conversation Service: >>>> ", watsonResponse.output.log_messages.msg);
								return;
							}
						}
						for(var i = 0 ; i < watsonResponse.output.text.length; i++){
							respText += watsonResponse.output.text[i]+" ";
						}

						console.log("Conversation Response: ", respText);
						if(playTTS){
							var query = {"voice": TTS_CONFIG.speakInVoice,
				  			  		"text": respText,
				  			  		"accept": TTS_CONFIG.accept,
				  			  		"download": TTS_CONFIG.download };
							methods.convertTTS(query);
						}
					}else{
						if(watsonResponse && watsonResponse.context && watsonResponse.context.next_action != "DO_NOTHING" && playTTS){
							var query = {"voice": TTS_CONFIG.speakInVoice,
				  			  		"text": "Sorry, I can not help you with this.",
				  			  		"accept": TTS_CONFIG.accept,
				  			  		"download": TTS_CONFIG.download };
							methods.convertTTS(query);
						}else{
							console.log("DO NOTHING >>>>>> ");
						}
				}
			}
		});
	};

	methods.convertTTS = function(query){
		console.log("IN convertTTS: >> ", JSON.stringify(query));
		if(!query || !query.text || query.text.length < 3){
			return;
		}
		var outfile = recordingsPath+"/"+TTS_CONFIG.audioFile;
		var transcript = ttsService.synthesize(query).pipe(fs.createWriteStream(outfile))
        .on('error', function(){
        	console.log("Error in convertTTS: >> ");
        })
        .on('close', function() {
        	methods.playAudioFrom(outfile);
         });
	};

	methods.playAudioFrom = function(filePath) {
		console.log('IN playAudioFrom: >> ', filePath);
        console.log('playing %s', filePath);
        cp.exec(format('aplay %s', filePath));
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
