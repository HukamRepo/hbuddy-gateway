
var CONFIG = require('../common/common').CONFIG();
var speechHandler = require('../handlers/speechHandler')();

var methods = {};

module.exports = function() {

	methods.listenCommands = function(req, resp, next){
		context = {
			"gatewayId": gatewayInfo.gatewayId
		};
		
		console.log("IN speechEndpoint, listenCommands >>>>>>> ");
		try{
			speechHandler.speechToText(function(result){
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
		speechHandler.stopSTT();
		resp.json({"msg": "STOPPED"});
	};


return methods;

}
