
var Client = require("ibmiotf");
var CONFIG = require('../common/common').CONFIG();
var eventEmmiter = require('../common/common').EVENTS();
var sceneHandler = require('../handlers/sceneHandler')();

var appClient;

var startTime = new Date();
var mqttConnected = false;

module.exports = function() {

	var methods = {};

	eventEmmiter.on('serialdata', function(serialData) {
  		console.log("IN serialdata EVENT received: >> ", serialData);
			if(methods.publishRequired(serialData)){
				methods.publishMessage(serialData);
			}
	});

	methods.getAppClient = function(){
		if(!appClient){
			appClient = new Client.IotfApplication(CONFIG.IOT_CONFIG);
		}
		return appClient;
	};

	methods.connectToIBMCloud = function(){
//		checkConnectivity();

		console.log('\n\n<<<<<< IN connectToMqtt >>>>>>>>> ', CONFIG.IOT_CONFIG);
		if(!appClient){
			appClient = new Client.IotfApplication(CONFIG.IOT_CONFIG);
		}
		if(!mqttConnected){
			console.log("Connecting IBM Iot over MQTT >>>>>>>> ");
			appClient.connect();
		}
	  //setting the log level to 'trace'
		// appClient.log.setLevel('trace');

	    appClient.on("connect", function () {
	    	console.log('<<<<<<< IBM IoT Cloud Connected Successfully >>>>>> \n\n');
	    	mqttConnected = true;
	    	methods.subscribeToGateway();
	    });

	    appClient.on("disconnect", function () {
	    	console.log('<<<<<<< IBM IoT Cloud Is Offline >>>>>> \n\n');
	    	mqttConnected = false;
	    });

	    appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {
//	        console.log("Device Event from :: "+deviceType+" : "+deviceId+" of event "+eventType+" with payload : "+payload);
	        methods.broadcastMessage(payload);
	    });

	    appClient.on("error", function (err) {
	        console.log("Error in appClient: >>  "+err);
	        mqttConnected = false;
	        appClient = null;
	    });
	};

	/*
	function checkConnectivity(){
			setInterval(function(){
				console.log("Is MQTT Cnnected ? : ", mqttConnected);
				if(!mqttConnected){
					methods.connectToIBMCloud();
				}
			},10000);
	};
	*/

	methods.subscribeToGateway = function(){
		if(!appClient){
			methods.connectToIBMCloud(function(appclient){
				appClient = appclient;
				appClient.subscribeToDeviceEvents(CONFIG.GATEWAY_TYPE, global.gatewayInfo.gatewayId, "gateway","json");
			});
		}else{
			appClient.subscribeToDeviceEvents(CONFIG.GATEWAY_TYPE, global.gatewayInfo.gatewayId, "gateway","json");
		}
	};

	methods.publishRequired = function(deviceWithData){
		console.log("IN publishRequired: >>> ", deviceWithData);

		// BELOW IS THE FORMAT OF DATA RECEIVED FROM MASTER SWITCH BOARD
		// "{"type":"switch_board", "uniqueId":"SWB-AB00-11-22-33", "data": {"deviceId":1, "deviceValue": 1, "analogValue": 5}}";

		if(!deviceWithData || !deviceWithData.uniqueId || !deviceWithData.type || !deviceWithData.data){
			console.log("INVALID deviceWithData to Publish ", deviceWithData);
			return false;
		}

		if(deviceWithData.type == "switch_board" && deviceWithData.data.deviceIndex){
			return true;
		}

		for (var dataKey in deviceWithData.data) {
			if(appConfig.PUBLISH_CONFIG){
				var sensorsConf = appConfig.PUBLISH_CONFIG.sensors;
				console.log("sensorsConf: >>>> ", sensorsConf, ", deviceWithData: >> ", deviceWithData);
				if(sensorsConf && sensorsConf.length > 0){
					for(var i = 0; i < sensorsConf.length; i++){
						sensorConf = sensorsConf[i];
						if(dataKey == sensorConf.type){
							var _initial = lastPublishTime[sensorConf];
							_final = new Date();
							if(_initial){
								var seconds = (_final - _initial)/1000;
								if(seconds >= sensorConf.publishAfter){
									lastPublishTime[sensorConf] = _final;
									console.log("\n\nPUBLISH DATA FOR: >>> ", deviceWithData);
									return true;
								}else{
									console.log("DO NOT PUBLISH YET: >>> ", seconds);
									return false;
								}
							}else{
								lastPublishTime[sensorConf] = _final;
								return true;
							}
						}
					}
				}
			}
		}

		return true;
	};

	methods.publishMessage = function(deviceWithData){
		try{

			if(deviceWithData.type && deviceWithData.data){
				deviceWithData.data.type = deviceWithData.type;
			}
			if(deviceWithData.uniqueId && deviceWithData.data){
				deviceWithData.data.uniqueId = deviceWithData.uniqueId;
			}

			 var sensorData = {"d": deviceWithData.data};
			 console.log('\n\n<<<<<< IN publishMessage >>>>>>>>> myData: ', JSON.stringify(deviceWithData));

			 if(!appClient){
				 methods.connectToIBMCloud(function(appclient){
						appClient = appclient;
						appClient.publishDeviceEvent(CONFIG.GATEWAY_TYPE, global.gatewayInfo.gatewayId, "cloud", "json", sensorData);
					});
			 }else{
				 appClient.publishDeviceEvent(CONFIG.GATEWAY_TYPE, global.gatewayInfo.gatewayId, "cloud", "json", sensorData);
			 }
		}catch(err){
			console.log(err);
		}
	  };


	methods.broadcastMessage = function(payloadStr){
//		console.log('IN broadcastMessage: >> payload: ', payloadStr);


		try{
			var payload = JSON.parse(payloadStr);
				if(payload.d && payload.d.boardId && payload.d.deviceIndex){
					var command = "";
					if(payload.d.analogValue && payload.d.deviceValue > 0){
						command = "#"+payload.d.boardId+"#"+payload.d.deviceIndex+"#"+payload.d.analogValue;
					}else{
						command = "#"+payload.d.boardId+"#"+payload.d.deviceIndex+"#"+payload.d.deviceValue;
					}
					console.log('Command To Broadcast: >>> ', command);

					eventEmmiter.emit("broadcast", command);

				}else if(payload.action){
					if(payload.type && payload.type == "Scene" && payload.data){
						// TODO: Refresh Scene
						console.log("Refresh Scene: >>> ", payload.data.title);
						sceneHandler.updateScene(payload.data);
					}else{
						console.log("MQTT Payload.type is Invalid: >>> ", payload.type);
					}
				}else{
					console.log("INVALID PAYLOAD RECEIVED: >>> ", payload);
				}
		}catch(err){
			console.log("ERROR In broadcastMessage, payloadStr: ", payloadStr, ", ERROR: >>",  err);
		}
	};

    return methods;

}