
var CONFIG = require('../common/common').CONFIG();
var conversationHandler = require('../handlers/conversationHandler')();
var speechHandler = require('../handlers/speechHandler')();

var speakInVoice = "en-US_AllisonVoice";

var watsonResponse = {};

var methods = {};

module.exports = function() {

	methods.listenCommands = function(req, resp, next){
		console.log("IN speechEndpoint, listenCommands >>>>>>> ");
		try{
			speechHandler.speechToText(function(result){
				if(!result || result.length > 200){
					console.log("DO Nothing: >>> ", result);
					resp.json({"msg": "STARTED"});
				}else{
					console.log("STT RESPONSE: >>>", result);
					if(result == 'stop' || result == 'stop buddy'){
						speechHandler.stopTTS();
					}else{
						methods.getCommandResponse(result, function(err){
							console.log("ERROR Resp: >>> ", err);
							resp.status(err.statusCode || 500).json(err);
						});
					}
					resp.json({"msg": "STARTED"});
				}
			});
		}catch(err){
			console.log("ERROR in speechHandler.speechToText: >> ", err);
			resp.status(err.statusCode || 500).json(err);
		}
	};

	methods.getCommandResponse = function(commandResp, errFunc){
		var conversationReq = {
								"params": {
											input: commandResp
										},
								"context": {
											"gatewayId": gatewayInfo.gatewayId
										}
								};
		console.log("getCommandResponse for: ", commandResp);
		conversationHandler.callConversation(conversationReq, function(err, watsonResponse){
			if(err){
				console.log(err);
				if(errFunc){
					errFunc(err);
				}
			}else{
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
						var query = {"voice": speakInVoice,
			  			  		"text": respText,
			  			  		"accept": "audio/ogg; codec=opus",
			  			  		"download": true };
						speechHandler.convertTTS(query, errFunc);
					}else{
						if(watsonResponse && watsonResponse.context && watsonResponse.context.next_action != "DO_NOTHING"){
							var query = {"voice": speakInVoice,
				  			  		"text": "Sorry, I can not help you with this.",
				  			  		"accept": "audio/ogg; codec=opus",
				  			  		"download": true };
							speechHandler.convertTTS(query, errFunc);
						}else{
							console.log("DO NOTHING >>>>>> ");
						}
				}
			}
		});
	};

	methods.stopSTT = function(req, resp) {
		console.log('IN speechHandler.stopSTT: >> ');
		speechHandler.stopSTT();
		resp.json({"msg": "STOPPED"});
	};


return methods;

}
