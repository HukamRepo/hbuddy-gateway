
var SensorTag = require('../utils/sensorTag/sensortag'),
commonHandler = require('../handlers/commonHandler')(),
async = require('async'),
CONFIG = require('../config/config').get(),
conf,
sensorTags = {},
interval;
var appClient;

module.exports = function(ibmIoTHandler) {
    
var methods = {};

	methods.connectSensorTags = function(configuration, callback) {
		conf = configuration;
		console.log("IN sensortagHandler.connectSensorTag, configuration: >>> ", conf);
		try{
			SensorTag.discover(onDiscover);
		}catch(err){
			console.log("ERROR in connectSensorTag: >> ", err);
			methods.disconnectSensorTags();
		}
	};
	
	methods.disconnectSensorTags = function() {
		console.log("IN sensortagHandler.disconnectSensorTags: >>>> ");
		try{
			SensorTag.stopDiscoverAll(function(sensorTag){
				console.log("IN stopDiscoverAll:>>> ", sensorTag);
				if(sensorTag){
					sensorTag.disconnect(function(){
				    	console.log("SensorTag Disconnected Successfully: >> ", sensorTag);
				    });
				}
			});
			
			if(interval){
				clearInterval(interval);
			}
			
			if(sensorTags){
				for(var key in sensorTags){
				    console.log(" \t >>> ", key+": "+sensorTags[key]);
				    var st = sensorTags[key].sensorTag;
				    st.disconnect(function(){
				    	console.log("SensorTag Disconnected Successfully: >> ", key);
				    });
				}
			}
			
		}catch(err){
			console.log("ERROR in disconnectSensorTags: >> ", err);
		}
	};
	
	function onDiscover(sensorTag){
		console.log("sensorTag Discovered: >>>> ");
		var tagId = "";
		sensorTag.on('disconnect', function() {
		    console.log('disconnected!');
		  });
		
		sensorTag.connectAndSetUp(function connected(error){
			if(error){
				console.log("sensorTag Connection Error: >>> ", error);
			}else{
				console.log("<<<<< sensorTag Connected: >>> ");
			}
			
			sensorTag.readSystemId(function(error, systemId){
				if(systemId){
					tagId = systemId;
					if(!sensorTags[tagId]){
						sensorTags[tagId] = {};
						sensorTags[tagId].sensorTag = sensorTag;
						sensorTags[tagId].data = {"systemId": tagId};
					}else{
						sensorTags[tagId].sensorTag = sensorTag;
						sensorTags[tagId].data = {"systemId": tagId};
					}				
				}
			});
			
			if(conf){
				if(conf.temperature && conf.temperature.enable){
					sensorTag.enableIrTemperature(function(error){
						sensorTag.notifyIrTemperature(function(error){
							if(error){
								console.log(error);
							}
						});
						sensorTag.on('irTemperatureChange', function(objectTemperature, ambientTemperature){
							if(sensorTags[tagId]){
								sensorTags[tagId].data.objectTemperature = objectTemperature;
								sensorTags[tagId].data.ambientTemperature = ambientTemperature;
							}
						});
					});
				}
				
				if(conf.humidity){
					sensorTag.enableHumidity(function(error){
						sensorTag.notifyHumidity(function(error){
							if(error){
								console.log(error);
							}
						});
						sensorTag.on('humidityChange', function(temperature, humidity){
							if(sensorTags[tagId]){
								sensorTags[tagId].data.temperature = temperature;
								sensorTags[tagId].data.humidity = humidity;
							}
						});
					});
				}
					
					sensorTag.enableLuxometer(function(error){
						sensorTag.notifyLuxometer(function(error){
							if(error){
								console.log(error);
							}
						});
						sensorTag.on('luxometerChange', function(lux){
							if(sensorTags[tagId]){
								sensorTags[tagId].data.lux = lux;
							}
						});
					});
					
					sensorTag.enableGyroscope(function(error){
						sensorTag.notifyGyroscope(function(error){
							if(error){
								console.log(error);
							}
						});
						sensorTag.on('gyroscopeChange', function(x, y, z){
							if(sensorTags[tagId]){
								sensorTags[tagId].data.gyroscope = {x: x, y: y, z: z};
							}
						});
					});
					
					sensorTag.enableAccelerometer(function(error){
						sensorTag.notifyAccelerometer(function(error){
							if(error){
								console.log(error);
							}
						});
						sensorTag.on('accelerometerChange', function(x, y, z){
							if(sensorTags[tagId]){
								sensorTags[tagId].data.accelerometer = {x: x, y: y, z: z};
							}
						});
					});
			
			}
			
			sensorTag.on('simpleKeyChange', function(left, right, reedRelay) {
		          console.log('left: ' + left);
		          console.log('right: ' + right);
		          if (sensorTag.type === 'cc2650') {
		            console.log('reed relay: ' + reedRelay);
		          }

		          if (right) {
//		            sensorTag.notifySimpleKey(callback);
		        	  sensorTag.readBatteryLevel(function(error, batteryLevel){
		  				if(error){
		  					console.log("ERROR IN readBatteryLevel: >> ", error);
		  				}else{
		  					console.log("batteryLevel: >> ", batteryLevel);
		  				}
		  			});
		          }
		          
		          if(left){
		        	  sensorTag.disconnect(function(){
			        	  console.log("DISCONNECTION CALLED on : >>> ", tagId);
			          });
		          }		         
		          
		        });

		        sensorTag.notifySimpleKey();
			
			interval = setInterval(function() {
				broadcasting();
			}, 5000);
			
		});
	};
	
	function broadcasting(){
		console.log("IN broadcasting: >> ");
		if(sensorTags){
			for(var key in sensorTags){
				/*
				methods.readBatteryLevel(sensorTags[key], function(batteryLevel){
					sensorTags[key].batteryLevel = batteryLevel;
				});
				*/
//				console.log(" \t >>> ", key+": "+commonHandler.simpleStringify(sensorTags[key]));
				console.log(" \t Data for", key, ": ", JSON.stringify(sensorTags[key].data));
				var sensorData = {"d": sensorTags[key].data};
				var deviceId = key.split(':').join('');
				if(!appClient){
					appClient = ibmIoTHandler.getAppClient();
					appClient.publishDeviceEvent("SensorTag", deviceId, "cloud", "json", sensorData);
				 }else{
					 appClient.publishDeviceEvent("SensorTag", deviceId, "cloud", "json", sensorData);
				 }
				
			}
		}
	};
	
	methods.readBatteryLevelWithKey = function(sensorTagId, cb){
		if(sensorTags){
			for(var key in sensorTags){
				if(key == sensorTagId && sensorTags[key]){
					sensorTag = sensorTags[key];
					sensorTag.readBatteryLevel(function(error, batteryLevel){
						if(sensorTags[tagId]){
							sensorTags[tagId].batteryLevel = batteryLevel;
						}
						if(cb){
							cb(batteryLevel);
						}
						return batteryLevel;
					});
				}
			}
		}
	};
	
	methods.readBatteryLevel = function(sensorTag, cb){
		if(sensorTag){
			sensorTag.readBatteryLevel(function(error, batteryLevel){
				if(cb){
					cb(batteryLevel);
				}
				return batteryLevel
			});
		}
	};

	return methods;
    
}