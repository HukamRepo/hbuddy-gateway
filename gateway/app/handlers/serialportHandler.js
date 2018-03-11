
var SerialPort = require("serialport");
var usbPort = "/dev/ttyUSB0";
var CONFIG = require('../common/common').CONFIG();
var eventEmmiter = require('../common/common').EVENTS();
var serialPort;

var appClient;

module.exports = function() {

	var lastPublishTime = {};

	var methods = {};

	eventEmmiter.on('writetoserial', function(command) {
  		console.log("IN writetoserial EVENT received: >> ", command);
			methods.writeToSerialPort(command);
	});

	methods.initSerialPort = function(){
		console.log("IN initSerialPort: >> ");
		try{
			var Readline = SerialPort.parsers.Readline;
			serialPort = new SerialPort(usbPort, {
				options: {
				      baudrate:9600				     
				    }
			  });
			  var parser = serialPort.pipe(new Readline());
			  parser.on('data', function(data) {
			      console.log('\n\ndata received: ' + data);
			      if(!data || data.trim() == ""){
			    	  console.log("Empty Data Received: >>>> ", data);
			      }else{
			    	  methods.handleDataOnSerialPort(data);
			      }
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
			command += "\n";
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
//					var command = "#"+payload.d.boardId+"#D#"+payload.d.deviceIndex+"#"+payload.d.status+"#"+payload.d.deviceValue;
					console.log('Command To Broadcast: >>> ', payloadStr);
					methods.writeToSerialPort(payloadStr, function(){
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
			
			if(deviceData.indexOf('ACK_') > -1){
				return false;
			}
			
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

			eventEmmiter.emit("serialdata", deviceWithData);

		}catch(err){
			console.log('ERROR IN handleDataOnSerialPort: >>> ', err);
		}
	};


    return methods;

}
