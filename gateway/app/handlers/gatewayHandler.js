
var CONFIG = require('../common/common').CONFIG(),
exec = require("child_process").exec,
commonHandler = require('../handlers/commonHandler')(),
localDBHandler = require('../handlers/localDBHandler')(),
cloudantHandler = require('../handlers/cloudantHandler')(),
sceneHandler = require('../handlers/sceneHandler')(),
scheduleHandler = require('../handlers/scheduleHandler')(),
radioHandler = null,
ibmIoTHandler = null,
sensorsHandler = null,
serialportHandler = null,
gpioHandler = null,
appConfig;


module.exports = function() {

var methods = {};

	methods.gatewayInfo = function(cb){
		if(cb){
			cb(global.gatewayInfo);
		}
		return global.gatewayInfo;
	};
	
	methods.initGateway = function(){
		console.log('\n\n<<<<<<<< IN initGateway >>>>>>> ');
		if(process.platform != 'darwin'){
			gpioHandler = require('../handlers/gpioHandler')();
			gpioHandler.setupPinsMode(function(err, result){
				gpioHandler.setLEDStatus(CONFIG.LEDS.RED, true, function(err, result){
					console.log("\n\n<<<< POWER LED SET TO ON >>> \n\n");
				});
			});
			
//			serialportHandler = require('../handlers/serialportHandler')();
			
		}
		
		localDBHandler.loadAllLocalDBs();
		commonHandler.checkInternet(function(isConnected) {
		    if (isConnected) {
		    	handleOnline(function(appConfig){
				    	radioHandler = require('../handlers/radioHandler')(appConfig);
//							radioHandler.initRadio();
							ibmIoTHandler = require('../handlers/ibmiotHandler')(appConfig);
							ibmIoTHandler.connectToIBMCloud(function(appclient){
								appClient = appclient;
							});
							// sensorsHandler = require('../handlers/sensorsHandler.js')(ibmIoTHandler);
							methods.startProcessWithCloud();
		    	});
		    } else {
		    	handleOffline(function(appConfig){
			    		radioHandler = require('../handlers/radioHandler')(appConfig);
//							radioHandler.initRadio();
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
		console.log("\n\n <<<<<<<<<<<< IN startProcessWithCloud: >>>>>>>\n\n ");
		cloudantHandler.loadPlaceFromCloud(function(err, place){
			if(err){
				console.log("ERROR IN loadPlaceFromCloud: >>>> ", err );
			}else{

				if(!place || !place._id){
					console.log("<<<<<<<<<<< NO PLACE CONNECTED TO THE GATEWAY >>>>>>>>>>>>>>");
					return false;
				}

				global.place = place;
				console.log("<<<< PLACE SYNCHRONISED WITH CLOUD IN LOCAL DB >>>>> ", global.place);
				cloudantHandler.loadPlaceAreasFromCloud(true, function(err, placeAreas){
					if(err){
						console.log("ERROR IN loadPlaceAreasFromCloud: >>>> ", err );
					}else{
						console.log("\n\n<<<< PLACEAREAS SYNCHRONISED WITH CLOUD IN LOCAL DB >>>>> ", placeAreas);
					}
				});

				cloudantHandler.loadBoardsFromCloud(true, function(err, boards){
					if(err){
						console.log("ERROR IN loadBoardsFromCloud: >>>> ", err );
					}else{
						console.log("\n\n<<<< BOARDS SYNCHRONISED WITH CLOUD IN LOCAL DB >>>>> ", boards.length);
						for(var i=0; i<boards.length; i++){
							var board = boards[i];
							cloudantHandler.loadDevicesFromCloud(board.uniqueIdentifier, true, function(err, devices){
								if(err){
									console.log("ERROR IN loadDevicesFromCloud: >>>> ", err );
								}else{
									methods.broadcastCommandsToBoards(devices);
								}
							});
						}						
					}
				});

				cloudantHandler.loadScenesFromCloud(true, function(err, scenes){
					if(err){
						console.log("ERROR IN loadScenesFromCloud: >>>> ", err );
					}else{
						console.log("\n\n<<<< SCENES SYNCHRONISED WITH CLOUD IN LOCAL DB >>>>> ", scenes.length);
						sceneHandler.processScenes(scenes);
					}
				});

			}
		});

	};

	methods.startProcessWithLocal = function(){
		localDBHandler.loadBoardsFromLocalDB(function(err, boards){
			if(err){
				console.log('<<<<<<< ERROR FETCHING BOARDS FROM LOCAL DB: >> ', err);
			}else{
				for(var i=0; i<boards.length; i++){
					var board = boards[i];
					localDBHandler.loadDevicesFromLocalDB({"parentId": board.uniqueIdentifier}, true, function(err, devices){
						if(err){
							console.log("ERROR IN loadDevicesFromCloud: >>>> ", err );
						}else{
							methods.broadcastCommandsToBoards(devices);
						}
					});
				}
				
			}
		});

		sceneHandler.processScenes(null);
	};

	methods.broadcastCommandsToBoards = function(devices){
		if(!devices){
			console.log("NO DEVICES TO BROADCAST :>>>>>>> ");
			return false;
		}
		console.log("IN broadcastCommandsToBoards, devices.length: >>>> ", devices.length);

		for(var i = 0; i < devices.length; i++){
			var device = devices[i];
			var payload = {
					d: {
						boardId: device.parentId,
						status: device.status,
						deviceIndex: device.deviceIndex,
						deviceValue: device.deviceValue
					}
			};
			
			radioHandler.broadcastMessage(JSON.stringify(payload));
			
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
				
				if(payload.type == 'LINUX'){
					methods.handleLinuxCommand(payload, cb);
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
					radioHandler.writeToRadio(command, function(){
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

	methods.handleLinuxCommand = function(payload, cb){
		var respMsg = {};
		try{
			if(payload.command){
		        var myscript = exec(payload.command);
		        myscript.stdout.on('data',function(data){
		        	var resp = String(data);
		        	resp = resp.trim();
		        	respMsg.status = "SUCCESS";
		        	respMsg.msg = resp;
		        	cb(respMsg);
		        });
		        myscript.stderr.on('data',function(data){
		        	var resp = String(data);
		        	resp = resp.trim();
		        	respMsg.status = "ERROR";
		        	respMsg.msg = resp;
		        	cb(respMsg);
		        });
			}else{
				respMsg.status = "ERROR";
				respMsg.msg = "COMMAND NOT FOUND: >>> ";
				if(cb){
					cb(respMsg);
				}
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
	
	methods.destroyGPIOs = function(cb){
		if(process.platform != 'darwin' && !gpioHandler){
			gpioHandler = require('../handlers/gpioHandler')();			
		}
		if(gpioHandler){
			gpioHandler.destroyGPIOs(cb);
		}		
	};
	
	return methods;

}
