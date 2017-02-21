
var CONFIG = require('../config/config').get();

var commonHandler = require('../handlers/commonHandler')();
var localDBHandler = require('../handlers/localDBHandler')();
var cloudantHandler = require('../handlers/cloudantHandler')();
var sceneHandler = require('../handlers/sceneHandler')();
var scheduleHandler = require('../handlers/scheduleHandler')();
var gatewayHandler = require('../handlers/gatewayHandler')();

var serialportHandler = null;

var methods = {};
var appConfig = {};

module.exports = function() {

	methods.gatewayInfo = function(req, resp){
		commonHandler.gatewayInfo(function(info){
			resp.json(info);
		})
	};

	methods.handleCommand = function(req, res){
		var payload = req.body;
		gatewayHandler.handleCommand(payload, function(respMsg){
			res.json(respMsg);
		});
	};

	methods.cameraWebhook = function(req, resp){
		var payload = req.body;
		console.log("IN hbuddyGateway.cameraWebhook: PAYLOAD: >>> ", payload);
		var imgURL = "http://hbuddy-gateway.local/capture/";

		if(payload.pathToImage){
			imgURL += payload.pathToImage;
		}else{
			var regionCoord = "_";
			if(payload.regionCoordinates && payload.regionCoordinates.length > 0){
				for(var i=0; i<payload.regionCoordinates.length; i++){
					regionCoord += payload.regionCoordinates[i];
					if(i != payload.regionCoordinates.length - 1){
						regionCoord += "-";
					}
				}
			}else{
				regionCoord += "regionCoordinates";
			}

			imgURL = imgURL+payload.timestamp+"_"+payload.microseconds+"_"+payload.instanceName+regionCoord+"_"+payload.numberOfChanges+"_"+payload.token+".jpg";
		}
		console.log("IMAGE CAPTURED: >>> ", imgURL);
	};

	methods.uploadContent = function(req, resp){
		var payload = req.body;
		console.log("IN gransiveGateway.uploadContent: PAYLOAD: >>> ", payload);
		var contentFolder = "/tmp/motion/cam1/";
		if(payload && payload.contentFolder){
			contentFolder = payload.contentFolder;
		}
		scheduleHandler.uploadContent(contentFolder);
	};

return methods;

}
