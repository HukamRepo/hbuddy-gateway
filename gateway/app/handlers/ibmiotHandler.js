
var Client = require("ibmiotf");
var FACTORY = require('../common/commonFactory')();
var eventEmmiter = require('../common/common').EVENTS();

var appClient;

var startTime = new Date();
var mqttConnected = false;

module.exports = function() {

	var methods = {};

	eventEmmiter.on('publishdata', function(radioData) {
		console.log("IN publishdata EVENT received: >> ", radioData);
			if(methods.publishRequired(radioData)){
				methods.publishMessage(radioData);
			}
	});

	methods.getAppClient = function(){
		if(!appClient){
			FACTORY.getGatewayConfig().GATEWAY_IOT_CONFIG.id = gatewayInfo.gatewayId;
			appClient = new Client.IotfGateway(FACTORY.getGatewayConfig().GATEWAY_IOT_CONFIG);
		}
		return appClient;
	};

	methods.connectToIBMCloud = function(){
//		checkConnectivity();
		if(!appClient){
			FACTORY.getGatewayConfig().GATEWAY_IOT_CONFIG.id = gatewayInfo.gatewayId;
			appClient = new Client.IotfGateway(FACTORY.getGatewayConfig().GATEWAY_IOT_CONFIG);
		}
		if(!mqttConnected){
			appClient.connect();
		}
	  //setting the log level to 'trace'
		// appClient.log.setLevel('trace');

	    appClient.on("connect", function () {
	    	console.log('\n\n<<<<<<< IBM IoT Cloud Connected Successfully >>>>>> \n\n');
	    	mqttConnected = true;
	    	global.gatewayInfo.iot_connected = true;
	    	methods.subscribeToGateway();
	    	if(FACTORY.GpioHandler()){
					FACTORY.GpioHandler().setLEDStatus(FACTORY.getGatewayConfig().LEDS.GREEN, true, function(err, result){
					console.log("\n<<<< CLOUD CONNECTIVITY LED SET TO ON >>> \n");
				});
	    	}
	    });

	    appClient.on("disconnect", function () {
	    	console.log('\n\n<<<<<<< IBM IoT Cloud Is Offline >>>>>> \n\n');
	    	mqttConnected = false;
	    	global.gatewayInfo.iot_connected = false;
	    	if(FACTORY.GpioHandler()){
						FACTORY.GpioHandler().setLEDStatus(FACTORY.getGatewayConfig().LEDS.GREEN, false, function(err, result){
						console.log("\n<<<< CLOUD CONNECTIVITY LED SET TO OFF >>> \n");
					});
	    	}
	    });

	    appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {
//	        console.log("Device Event from :: "+deviceType+" : "+deviceId+" of event "+eventType+" with payload : "+payload);
	        methods.broadcastMessage(payload);
	    });

	    appClient.on("command", function (type, id, commandName, format, payload, topic) {
//	        console.log("Gateway Command from :: "+deviceType+" : "+deviceId+" of event "+eventType+" with payload : "+payload);
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
				appClient.subscribeToGatewayCommand("gateway");
			});
		}else{
			appClient.subscribeToGatewayCommand("gateway");
		}
	};

	methods.publishRequired = function(deviceWithData){
//		console.log("IN publishRequired: >>> ", deviceWithData);

		// BELOW IS THE FORMAT OF DATA RECEIVED FROM MASTER SWITCH BOARD
		// "{"type":"switch_board", "uniqueId":"SWB-AB00-11-22-33", "data": {"deviceId":1, "deviceValue": 1, "analogValue": 5}}";

		if(!deviceWithData || !deviceWithData.d){
			return false;
		}

		if(!deviceWithData || !deviceWithData.d || (!deviceWithData.d.uniqueId && !deviceWithData.d.id) || !deviceWithData.d.type){
			console.log("INVALID deviceWithData to Publish ", deviceWithData);
			return false;
		}

		if(deviceWithData.d.type == "SB_MICRO"){
			return true;
		}

		for (var dataKey in deviceWithData.d) {
			if(FACTORY.getGatewayConfig() && FACTORY.getGatewayConfig().PUBLISH_CONFIG){
				var sensorsConf = FACTORY.getGatewayConfig().PUBLISH_CONFIG.sensors;
//				console.log("sensorsConf: >>>> ", sensorsConf, ", deviceWithData: >> ", deviceWithData);
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
			 if(!deviceWithData || !deviceWithData.d){
				 console.log("Invalid data to Publish :>>> ", deviceWithData);
				 return false;
			 }
			 console.log('\n\n<<<<<< IN publishMessage >>>>>>>>> myData: ', JSON.stringify(deviceWithData));

			 if(!appClient){
				 methods.connectToIBMCloud(function(appclient){
						appClient = appclient;
						appClient.publishDeviceEvent(FACTORY.getGatewayConfig().GATEWAY_IOT_CONFIG.type, global.gatewayInfo.gatewayId, "cloud", "json", deviceWithData);
					});
			 }else{
				 appClient.publishDeviceEvent(FACTORY.getGatewayConfig().GATEWAY_IOT_CONFIG.type, global.gatewayInfo.gatewayId, "cloud", "json", deviceWithData);
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
//					var command = "";
//					command = "#"+payload.d.boardId+"#D#" +payload.d.deviceIndex+"#"+payload.d.status+"#"+payload.d.deviceValue;
//					console.log('Command To Broadcast: >>> ', payloadStr);
					if(FACTORY.getGatewayConfig().BROADCAST_TYPE == "LORA"){
						eventEmmiter.emit("broadcast", JSON.stringify(payload.d));
					}else{
						eventEmmiter.emit("writetoserial", JSON.stringify(payload.d));
					}
				}else if(payload.action){
					if(payload.action == "UPDATE_SCENE" && payload.data){
						// TODO: Refresh Scene
						console.log("Refresh Scene: >>> ", payload.data.title);
						FACTORY.SceneHandler().updateScene(payload.data);
					}else if(payload.action == "TTS" && payload.text){
						eventEmmiter.emit("TTS", payload.text);
					}else{
						console.log("MQTT Payload is Invalid: >>> ", payload);
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
