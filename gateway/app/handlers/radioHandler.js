
var SX127x = require('sx127x');
var eventEmmiter = require('../common/common').EVENTS();

var sx127x;

var appClient;

module.exports = function() {

	var lastPublishTime = {};

	var methods = {};

	eventEmmiter.on('broadcast', function(command) {
  		console.log("IN broadcast EVENT received: >> ", command);
			methods.writeToRadio(command);
	});

	methods.initRadio = function(){
		console.log("IN initRadio: >> ");
		try{
			if(sx127x){
				return false;
			}
			sx127x = new SX127x({
				  frequency: 868e6
				});

			sx127x.open(function(err) {
				  console.log('Radio Open: ', err ? err : 'success');
				  if (err) {
					  console.log(err);
				  }
				  sx127x.on('data', function(data, rssi) {
//				    console.log('data:', '\'' + data.toString() + '\'', rssi);
				    console.log('\n\nRadio data received: ' + data.toString());
				      if(!data.toString() || data.toString().trim() == ""){
				    	  console.log("Empty Data Received: >>>> ", data);
				      }else{
				    	  methods.handleDataOnRadio(data.toString());
				      }
				  });

				  // enable receive mode
				  sx127x.receive(function(err) {
				    console.log('LORA In Receive Mode ', err ? err : 'success');
				  });
				});

			    process.on('SIGINT', function() {
				  // close the device
				  sx127x.close(function(err) {
				    console.log('close', err ? err : 'success');
				    process.exit();
				  });
				});

			}catch(err){
				console.log("Error in initRadion: >>>>>>> ");
				console.log(err);
		    }
	};

	methods.writeToRadio = function(command){
		if(sx127x){
			command += "\n";
			sx127x.write(new Buffer(command), function(err){
				if(err){
					console.log('\tError in writeToRadio: ', err);
				}else{
					console.log('Command Broadcast Successfully: >>> ', command);
				}
				sx127x.receive(function(err) {
				    console.log('LORA In Receive Mode ', err ? err : 'success');
				  });
			});
		}else{
			console.log("Radio not Initialized yet !");
			methods.initRadio();
		}
	};

	methods.broadcastMessage = function(payloadStr){
		console.log('IN broadcastMessage: >> payload: ', payloadStr);
		try{
			var payload = JSON.parse(payloadStr);
				if(payload.d && payload.d.boardId && payload.d.deviceIndex){
//					var command = "#"+payload.d.boardId+"#D#"+payload.d.deviceIndex+"#"+payload.d.status+"#"+payload.d.deviceValue;
					console.log('Command To Broadcast: >>> ', payload.d);
					methods.writeToRadio(JSON.stringify(payload.d), function(){
						console.log('Command Broadcast Successfully: >>> ', payload.d);
					});
				}else{
					console.log("INVALID PAYLOAD RECEIVED: >>> ", payload);
				}
		}catch(err){
			console.log("ERROR In broadcastMessage: ", err);
		}
	};

	methods.handleDataOnRadio = function(deviceData){
		console.log("IN handleDataOnRadio: >> ", deviceData);
		if(deviceData && deviceData == "ACK"){
			return false;
		}
		var timeNow = new Date();
		try{
			var deviceWithData = JSON.parse(deviceData);

			if(deviceWithData.id && !deviceWithData.uniqueId){
				deviceWithData.uniqueId = deviceWithData.id;
				delete deviceWithData["id"];
			}

			if(!deviceWithData.data){
				deviceWithData.data = {};
			}
			deviceWithData.data.ts = timeNow;
			deviceWithData.data.gatewayId = global.gatewayInfo.gatewayId;

			if(deviceWithData.temp){
				deviceWithData.data.temp = deviceWithData.temp;
				delete deviceWithData["temp"];
			}
			if(deviceWithData.hum){
				deviceWithData.data.hum = deviceWithData.hum;
				delete deviceWithData["hum"];
			}
			if(deviceWithData.dewpoint){
				deviceWithData.data.dewpoint = deviceWithData.dewpoint;
				delete deviceWithData["dewpoint"];
			}

			eventEmmiter.emit("publishdata", deviceWithData);

		}catch(err){
			console.log('ERROR IN handleDataOnRadio: >>> ', err);
			sx127x.receive(function(err) {
			    console.log('LORA In Receive Mode ', err ? err : 'success');
			  });
		}
	};

	methods.initRadio();


    return methods;

}
