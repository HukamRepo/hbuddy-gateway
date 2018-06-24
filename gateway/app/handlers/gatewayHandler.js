
var FACTORY = require('../common/commonFactory')(),
exec = require("child_process").exec,
gpioHandler = null,
appConfig = null;

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

		if(FACTORY.LocalDBHandler()){
				FACTORY.LocalDBHandler().loadAllLocalDBs();
		}
		FACTORY.CommonHandler().checkInternet(function(isConnected) {
		    if (isConnected) {
		    	handleOnline(function(){
							if(FACTORY.RadioHandler()){
									FACTORY.RadioHandler().initRadio();
							}
							if(FACTORY.SerialportHandler()){
								FACTORY.SerialportHandler().initSerialPort();
							}
						
							FACTORY.IBMIoTHandler().connectToIBMCloud(function(appclient){
								appClient = appclient;
							});
							methods.startProcessWithCloud();
							methods.uploadFiles();
		    	});
		    } else {
		    	handleOffline(function(){
						if(FACTORY.RadioHandler()){
								FACTORY.RadioHandler().initRadio();
						}
						if(FACTORY.SerialportHandler()){
							FACTORY.SerialportHandler().initSerialPort();
						}

							methods.startProcessWithLocal();
		    	});
		    }
		});

	};

	handleOnline = function(cb){
		console.log("<<<<<<< INTERNET IS AVAILABLE >>>>>>> ");
		FACTORY.CloudantHandler().loadConfigurationsFromCloud(true, function(err, configurations){
			if(err){
				console.log('ERROR IN FETCHING CONFIGURATIONS: >>>>>> ', err);
			}else{
				FACTORY.setAppConfig(configurations);
				if(FACTORY.GpioHandler()){
					FACTORY.GpioHandler().setupPinsMode(function(err, result){
						FACTORY.GpioHandler().setLEDStatus(FACTORY.getGatewayConfig().LEDS.RED, true, function(err, result){
							console.log("\n\n<<<< POWER LED SET TO ON >>> \n\n");
						});
					});
				}
			}
			cb();
		});
	};

	handleOffline = function(cb){
		console.log("<<<<<<< INTERNET IS NOT AVAILABLE >>>>>>> ");
		var appConfig;
		FACTORY.LocalDBHandler().loadConfigurationsFromLocalDB(function(err, configurations){
			if(err){
				console.log('ERROR IN FETCHING CONFIGURATIONS: >>>>>> ', err);
			}else{
				FACTORY.setAppConfig(configurations);
				if(FACTORY.GpioHandler()){
					FACTORY.GpioHandler().setupPinsMode(function(err, result){
						FACTORY.GpioHandler().setLEDStatus(FACTORY.getGatewayConfig().LEDS.RED, true, function(err, result){
							console.log("\n\n<<<< POWER LED SET TO ON >>> \n\n");
						});
					});
				}
			}
			cb();
		});
	};

	methods.startProcessWithCloud = function(){
		console.log("\n\n <<<<<<<<<<<< IN startProcessWithCloud: >>>>>>>\n\n ");
		FACTORY.CloudantHandler().loadPlaceFromCloud(function(err, place){
			if(err){
				console.log("ERROR IN loadPlaceFromCloud: >>>> ", err );
			}else{

				if(!place || !place._id){
					console.log("<<<<<<<<<<< NO PLACE CONNECTED TO THE GATEWAY >>>>>>>>>>>>>>");
					return false;
				}

				global.place = place;
				console.log("<<<< PLACE SYNCHRONISED WITH CLOUD IN LOCAL DB >>>>> ", global.place);
				FACTORY.CloudantHandler().loadPlaceAreasFromCloud(true, function(err, placeAreas){
					if(err){
						console.log("ERROR IN loadPlaceAreasFromCloud: >>>> ", err );
					}else{
						console.log("\n\n<<<< PLACEAREAS SYNCHRONISED WITH CLOUD IN LOCAL DB >>>>> ", placeAreas);
					}
				});

				FACTORY.CloudantHandler().loadBoardsFromCloud(true, function(err, boards){
					if(err){
						console.log("ERROR IN loadBoardsFromCloud: >>>> ", err );
					}else{
						console.log("\n\n<<<< BOARDS SYNCHRONISED WITH CLOUD IN LOCAL DB >>>>> ", boards.length);
						for(var i=0; i<boards.length; i++){
							var board = boards[i];
							FACTORY.CloudantHandler().loadDevicesFromCloud(board.uniqueIdentifier, true, function(err, devices){
								if(err){
									console.log("ERROR IN loadDevicesFromCloud: >>>> ", err );
								}else{
									methods.broadcastCommandsToBoards(devices);
								}
							});
						}
					}
				});

				FACTORY.CloudantHandler().loadScenesFromCloud(true, function(err, scenes){
					if(err){
						console.log("ERROR IN loadScenesFromCloud: >>>> ", err );
					}else{
						console.log("\n\n<<<< SCENES SYNCHRONISED WITH CLOUD IN LOCAL DB >>>>> ", scenes.length);
						FACTORY.SceneHandler().processScenes(scenes);
					}
				});

			}
		});

	};

	methods.startProcessWithLocal = function(){
		FACTORY.LocalDBHandler().loadBoardsFromLocalDB(function(err, boards){
			if(err){
				console.log('<<<<<<< ERROR FETCHING BOARDS FROM LOCAL DB: >> ', err);
			}else{
				for(var i=0; i<boards.length; i++){
					var board = boards[i];
					FACTORY.LocalDBHandler().loadDevicesFromLocalDB({"parentId": board.uniqueIdentifier}, true, function(err, devices){
						if(err){
							console.log("ERROR IN loadDevicesFromCloud: >>>> ", err );
						}else{
							methods.broadcastCommandsToBoards(devices);
						}
					});
				}

			}
		});

		FACTORY.SceneHandler().processScenes(null);
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

			if(FACTORY.RadioHandler()){
				FACTORY.RadioHandler().broadcastMessage(JSON.stringify(payload));
			}
			if(FACTORY.SerialportHandler()){
				FACTORY.SerialportHandler().broadcastMessage(JSON.stringify(payload));
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
//					var command = "#"+payload.d.boardId+"#"+payload.d.deviceIndex+"#"+payload.d.deviceValue;
					console.log('Command To Broadcast: >>> ', payload.d);
					if(FACTORY.RadioHandler()){
						FACTORY.RadioHandler().writeToRadio(JSON.stringify(payload.d), function(){
								console.log('Command Broadcast Successfully: >>> ', payload.d);
								respMsg.status = "SUCCESS";
								respMsg.msg = "Command Broadcast Successfully: >>> " + command;
								if(cb){
									cb(respMsg);
								}
							});
					}				
					
					if(FACTORY.SerialportHandler()){
						FACTORY.SerialportHandler().writeToSerialPort(command, function(){
							console.log('Command Broadcast Successfully: >>> ', payload.d);
							respMsg.status = "SUCCESS";
							respMsg.msg = "Command Broadcast Successfully: >>> " + command;
							if(cb){
								cb(respMsg);
							}
						});
					}
					
				}else if(payload.action){
					if(payload.type && payload.type == "Scene" && payload.data){
						// TODO: Refresh Scene
						console.log("Refresh Scene: >>> ", payload.data.title);
						FACTORY.SceneHandler.updateScene(payload.data);
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

			if(!FACTORY.SensorsHandler()){
				console.log("No SensorsHandler, may be Internet is not connected >>>>");
				return;
			}

			if(payload.command == 'CONNECT_SENSORS'){
				FACTORY.SensorsHandler().connectSensors(payload);
			}

			if(payload.command == 'DISCONNECT_SENSORS'){
				FACTORY.SensorsHandler().disconnectSensors();
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
		if(FACTORY.GpioHandler()){
			FACTORY.GpioHandler().destroyGPIOs(cb);
		}
	};

	methods.uploadFiles = function(){
    console.log("IN uploadFiles: >> ");
  		FACTORY.ScheduleHandler().scheduleContentUpload(function(err, resp){
  			console.log("FILES UPLOAD RESP: >>> ", resp);
  		});
  	};

	return methods;

}
