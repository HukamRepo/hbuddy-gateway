
//TODO: THIS ONE STILL NEEDS MORE WORK

var conf;

module.exports = function(ibmIoTHandler) {
	
	var sensortagHandler = require('../handlers/sensortagHandler')(ibmIoTHandler);
    
var methods = {};

	methods.connectSensors = function(payload, callback) {
		if(payload){
			conf = payload.options;
		}
		console.log("IN sensorsHandler.connectSensors, configuration: >>> ", conf);
		try{
			sensortagHandler.connectSensorTags(conf, function(error, data){
				if(callback){
					callback(error, data);
				}
			});			
		}catch(err){
			console.log("ERROR in connectSensors: >> ", err);
			sensortagHandler.disconnectSensorTags();
			if(callback){
				callback(err, null);
			}
		}
	};
	
	methods.disconnectSensors = function() {
		console.log("IN sensorsHandler.disconnectSensors: >>>> ");
		try{
			sensortagHandler.disconnectSensorTags();
		}catch(err){
			console.log("ERROR in disconnectSensors: >> ", err);
		}
	};
	
	return methods;
    
}