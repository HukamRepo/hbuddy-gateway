
var CONFIG = require('../config/config').get(),
commonHandler = require('../handlers/commonHandler')(),
localDBHandler = require('../handlers/localDBHandler')(),
cloudantHandler = require('../handlers/cloudantHandler')(),
sceneHandler = require('../handlers/sceneHandler')(),
scheduleHandler = require('../handlers/scheduleHandler')(),
serialportHandler = null;
ibmIoTHandler = null;
var appConfig;

module.exports = function() {
    
var methods = {};

	methods.gatewayInfo = function(cb){
		var info = {"gatewayId": "", "internet": "", "visibility": true};		
		info.gatewayId = commonHandler.getRPISerialNumber();
		
		commonHandler.checkInternet(function(isConnected) {
			info.internet = isConnected;
			if(cb){
				cb(info);
			}
		});
		
		return info;
	};
	
	methods.initGateway = function(){
		console.log('\n\n<<<<<<<< IN initGateway >>>>>>>');
		localDBHandler.loadAllLocalDBs();
		commonHandler.checkInternet(function(isConnected) {
		    if (isConnected) {
		    	handleOnline(function(appConfig){
		    		serialportHandler = require('../handlers/serialportHandler')(appConfig);
					serialportHandler.initSerialPort();
					ibmIoTHandler = require('../handlers/ibmIoTHandler')(appConfig, serialportHandler);
					ibmIoTHandler.connectToIBMCloud(function(appclient){
						appClient = appclient;
					});
					sensorsHandler = require('../handlers/sensorsHandler.js')(ibmIoTHandler);
					methods.startProcessWithCloud();
		    	});
		    } else {
		    	handleOffline(function(appConfig){
		    		serialportHandler = require('../handlers/serialportHandler')(appConfig);
					serialportHandler.initSerialPort();
					methods.startProcessWithLocal();
		    	});
		    }
		});
	};
	
	handleOnline = function(cb){
		console.log("<<<<<<< INTERNET IS AVAILABLE >>>>>>> ");
		cloudantHandler.loadConfigurationsFromCloud(true, function(err, configurations){
			if(err){
				console.log('ERROR IN FETCHING CONFIGURATIONS: >>>>>> ', err);
				appConfig = CONFIG;
			}else{
				appConfig = configurations;
			}
			cb(appConfig);
		});
	};

	handleOffline = function(cb){
		console.log("<<<<<<< INTERNET IS NOT AVAILABLE >>>>>>> ");
		var appConfig;
		localDBHandler.loadConfigurationsFromLocalDB(function(err, configurations){
			if(err){
				console.log('ERROR IN FETCHING CONFIGURATIONS: >>>>>> ', err);
				appConfig = CONFIG;
			}else{
				appConfig = configurations;
			}
			cb(appConfig);
		});
	};
	
	methods.startProcessWithCloud = function(){
		cloudantHandler.loadBoardsFromCloud(true, function(err, boards){
			if(err){
				console.log("ERROR IN loadBoardsFromCloud: >>>> ", err );
			}else{
				console.log("<<<< BOARDS SYNCHRONISED WITH CLOUD IN LOCAL DB >>>>> ", boards.length);
				methods.broadcastCommandsToBoards(boards);
			}
		});
		
		cloudantHandler.loadScenesFromCloud(true, function(err, scenes){
			if(err){
				console.log("ERROR IN loadScenesFromCloud: >>>> ", err );
			}else{
				console.log("<<<< SCENES SYNCHRONISED WITH CLOUD IN LOCAL DB >>>>> ", scenes.length);
				sceneHandler.processScenes(scenes);
			}
		});
	};
	
	methods.startProcessWithLocal = function(){
		localDBHandler.loadBoardsFromLocalDB(function(err, boards){
			if(err){
				console.log('<<<<<<< ERROR FETCHING BOARDS FROM LOCAL DB: >> ', err);
			}else{
				console.log("BOARDS FETCHED FROM LOCAL DB: >> ", boards.length);
				methods.broadcastCommandsToBoards(boards);
			}
		});
		
		sceneHandler.processScenes(null);
	};

	methods.broadcastCommandsToBoards = function(boards){
		if(!boards){
			console.log("NO BOARDS TO BROADCAST :>>>>>>> ");
			return false;
		}
		console.log("IN broadcastCommandsToBoards: >>>> ", boards.length);
		
		for(var i = 0; i < boards.length; i++){
			var board = boards[i];
			if(board.devices){
				for(var j = 0; j < board.devices.length; j++){
					var device = board.devices[j];
					var payload = {
							d: {
								boardId: board.uniqueIdentifier,
								deviceIndex: device.deviceIndex,
								deviceValue: device.value
							}
					};
					serialportHandler.broadcastMessage(JSON.stringify(payload));
				}
			}
		}
	};
	
	methods.handleCommand = function(payload, cb){
		var respMsg = {};
		console.log("IN gatewayHandler.handleCommand: PAYLOAD: >>> ", payload);
		try{
			
			if(payload){
				if(payload.type == 'DEVICE'){
					methods.handleDeviceCommand(payload, cb);
				}
				
				if(payload.type == 'SENSOR'){
					methods.handleSensorCommand(payload, cb);
				}
			}
			
		}catch(err){
			console.log("ERROR In handlePayload, payload: ", payload, ", ERROR: >>",  err);
			respMsg.status = "ERROR";
			respMsg.msg = err;
			if(cb){
				cb(respMsg);
			}
		}
		
	};
	
	methods.handleDeviceCommand = function(payload, cb){
		var respMsg = {};
		try{
				if(payload.d && payload.d.boardId && payload.d.deviceIndex){
					var command = "#"+payload.d.boardId+"#"+payload.d.deviceIndex+"#"+payload.d.deviceValue;
					console.log('Command To Broadcast: >>> ', command);
					serialportHandler.writeToSerialPort(command, function(){
						console.log('Command Broadcast Successfully: >>> ', command);
						respMsg.status = "SUCCESS";
						respMsg.msg = "Command Broadcast Successfully: >>> " + command;
						if(cb){
							cb(respMsg);
						}
					});
				}else if(payload.action){
					if(payload.type && payload.type == "Scene" && payload.data){
						// TODO: Refresh Scene 
						console.log("Refresh Scene: >>> ", payload.data.title);
						sceneHandler.updateScene(payload.data);
					}else{
						console.log("Payload.type is Invalid: >>> ", payload.type);
						respMsg.status = "ERROR";
						respMsg.msg = "INVALID PAYLOAD TYPE, type: " + payload.type;
					}
					if(cb){
						cb(respMsg);
					}
				}else{
					console.log("INVALID PAYLOAD RECEIVED: >>> ", payload);
					respMsg.status = "ERROR";
					respMsg.msg = "INVALID PAYLOAD";
					if(cb){
						cb(respMsg);
					}
				}
		}catch(err){
			console.log("ERROR In handleDeviceCommand, payload: ", payload, ", ERROR: >>",  err);
			respMsg.status = "ERROR";
			respMsg.msg = err;
			if(cb){
				cb(respMsg);
			}
		}
	};
  	
	methods.handleSensorCommand = function(payload, cb){
		var respMsg = {};
		try{
			
			if(!sensorsHandler){
				console.log("No SensorsHandler, may be Internet is not connected >>>>");
				return;
			}
			
			if(payload.command == 'CONNECT_SENSORS'){
				sensorsHandler.connectSensors(payload);
			}
			
			if(payload.command == 'DISCONNECT_SENSORS'){
				sensorsHandler.disconnectSensors();
			}
			
			respMsg.status = "SUCCESS";
			respMsg.msg = "Command Executed Successfully: >>> ", payload;
			if(cb){
				cb(respMsg);
			}
			
		}catch(err){
			console.log("ERROR In handleSensorCommand, payload: ", payload, ", ERROR: >>",  err);
			respMsg.status = "ERROR";
			respMsg.msg = err;
			if(cb){
				cb(respMsg);
			}
		}
	};
	
	
    return methods;
    
}