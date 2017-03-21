
var Client = require("ibmiotf");
var CONFIG = require('../config/config').get();
var sceneHandler = require('../handlers/sceneHandler')();

var appClient;

var startTime = new Date();
var mqttConnected = false;

module.exports = function(appConfig, serialportHandler) {

	var methods = {};

	methods.connectToIBMCloud = function(){
//		checkConnectivity();
		console.log('\n\n<<<<<< IN connectToMqtt >>>>>>>>> ', appConfig.IOT_CONFIG);
		if(!appClient){
			appClient = new Client.IotfApplication(appConfig.IOT_CONFIG);
		}
		if(!mqttConnected){
			appClient.connect();
		}
	  //setting the log level to 'trace'
//		appClient.log.setLevel('trace');

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
					serialportHandler.writeToSerialPort(command, function(){
						console.log('Command Broadcast Successfully: >>> ', command);
					});
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
