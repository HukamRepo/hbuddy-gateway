
var FACTORY = require('../common/commonFactory')();

var methods = {};

module.exports = function() {

	methods.listenCommands = function(req, resp, next){
		console.log("IN speechEndpoint, listenCommands >>>>>>> ");
		try{
			FACTORY.SpeechHandler().speechToText(function(result){
				console.log("RESULT: >>> ", result);
			});
			resp.json({"msg": "STARTED"});
		}catch(err){
			console.log("ERROR in speechHandler.speechToText: >> ", err);
			resp.status(err.statusCode || 500).json(err);
		}
	};

	methods.stopSTT = function(req, resp) {
		console.log('IN speechHandler.stopSTT: >> ');
		FACTORY.SpeechHandler().stopSTT();
		resp.json({"msg": "STOPPED"});
	};


return methods;

}
