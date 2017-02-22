
var SerialPort = require("serialport");
var usbPort = "/dev/ttyUSB0";
var commonHandler = require('../handlers/commonHandler')();
var CONFIG = require('../config/config').get();
var serialPort;

module.exports = function(appConfig) {

	var lastPublishTime = {};

	var methods = {};

	methods.initSerialPort = function(){
		try{
			serialPort = new SerialPort(usbPort, {
			    baudrate: 9600,
			    bufferSize: 131072,
			    parser: SerialPort.parsers.readline('\n')
			  });
			  serialPort.on("open", function () {
			    serialPort.on('data', function(data) {
			      console.log('data received: ' + data);
			      methods.handleDataOnSerialPort(data);
			    });
			  });

			  serialPort.on('error', function(err) {
	//			  throw new Error('Custom SerialPort Communication Error: ', err);
				  console.log('ERROR In SERIAL PORT COMMUNICATION: >>> ', err);
			  });
		}catch(err){
			console.log(err);
		}
	};

	methods.writeToSerialPort = function(command){
		if(serialPort){
			serialPort.write(command, function(){
				console.log('Command Broadcast Successfully: >>> ', command);
			});
		}else{
			console.log("SerialPort not Initialized yet !");
			methods.initSerialPort();
		}
	};

	methods.broadcastMessage = function(payloadStr){
		console.log('IN broadcastMessage: >> payload: ', payloadStr);
		try{
			var payload = JSON.parse(payloadStr);
				if(payload.d && payload.d.boardId && payload.d.deviceIndex){
					var command = "#"+payload.d.boardId+"#"+payload.d.deviceIndex+"#"+payload.d.deviceValue;
					console.log('Command To Broadcast: >>> ', command);
					methods.writeToSerialPort(command, function(){
						console.log('Command Broadcast Successfully: >>> ', command);
					});
				}else{
					console.log("INVALID PAYLOAD RECEIVED: >>> ", payload);
				}
		}catch(err){
			console.log("ERROR In broadcastMessage: ", err);
		}
	};

	methods.handleDataOnSerialPort = function(deviceData){
		var timeNow = new Date();
		try{
			var deviceWithData = JSON.parse(deviceData);
			if(!deviceWithData.data){
				deviceWithData.data = {};
			}
			deviceWithData.data.ts = timeNow;
			deviceWithData.data.gatewayId = global.gatewayInfo.gatewayId;
			if(methods.publishRequired(deviceWithData)){
				methods.publishMessage(deviceWithData);
			}
		}catch(err){
			console.log('ERROR IN handleDataOnSerialPort: >>> ', err);
		}
	};

	methods.publishRequired = function(deviceWithData){
		console.log("IN publishRequired: >>> ", deviceWithData);
		
		//TODO: Remove below return... Added for testing
		return true;

		if(deviceWithData.d && deviceWithData.d.boardID){
			deviceWithData.d.boardId = deviceWithData.d.boardID;
			delete deviceWithData.d["boardID"];
			return true;
		}else{
			if(appConfig.PUBLISH_CONFIG){
				var sensorsConf = appConfig.PUBLISH_CONFIG.sensors;
				console.log("sensorsConf: >>>> ", sensorsConf);
				if(sensorsConf && sensorsConf.length > 0){
					for(var i = 0; i < sensorsConf.length; i++){
						sensorConf = sensorsConf[i];
						console.log("sensorConf: >>> ", sensorConf);
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
						appClient.publishDeviceEvent("HukamGateway", global.gatewayInfo.gatewayId, "cloud", "json", sensorData);
					});
			 }else{
				 appClient.publishDeviceEvent("HukamGateway", global.gatewayInfo.gatewayId, "cloud", "json", sensorData);
			 }
		}catch(err){
			console.log(err);
		}
	  };


    return methods;

}
