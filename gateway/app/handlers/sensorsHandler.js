
//TODO: THIS ONE STILL NEEDS MORE WORK
var FACTORY = require('../common/commonFactory')();

var conf;

module.exports = function() {

var methods = {};

	methods.connectSensors = function(payload, callback) {
		if(payload){
			conf = payload.options;
		}
		console.log("IN sensorsHandler.connectSensors, configuration: >>> ", conf);
		try{
			FACTORY.SensorTagHandler().connectSensorTags(conf, function(error, data){
				if(callback){
					callback(error, data);
				}
			});
		}catch(err){
			console.log("ERROR in connectSensors: >> ", err);
			FACTORY.SensorTagHandler().disconnectSensorTags();
			if(callback){
				callback(err, null);
			}
		}
	};

	methods.disconnectSensors = function() {
		console.log("IN sensorsHandler.disconnectSensors: >>>> ");
		try{
			FACTORY.SensorTagHandler().disconnectSensorTags();
		}catch(err){
			console.log("ERROR in disconnectSensors: >> ", err);
		}
	};

	return methods;

}
