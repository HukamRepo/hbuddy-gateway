
var SerialPort = require("serialport");
var usbPort = "/dev/ttyUSB0";
var CONFIG = require('../common/common').CONFIG();
var eventEmmiter = require('../common/common').EVENTS();
var serialPort;

var appClient;

module.exports = function(appConfig) {

	var lastPublishTime = {};

	var methods = {};

	eventEmmiter.on('broadcast', function(command) {
  		console.log("IN broadcast EVENT received: >> ", command);
			methods.writeToSerialPort(command);
	});

	methods.initSerialPort = function(){
		try{
			var Readline = SerialPort.parsers.Readline;
			serialPort = new SerialPort(usbPort, {
			    baudrate: 9600,
			    highWaterMark: 131072,
			  });
			  var parser = serialPort.pipe(new Readline({delimiter: '\n'}));
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
					var command = "#"+payload.d.boardId+"#D"+"#"+payload.d.deviceIndex+"#"+payload.d.status+"#"+payload.d.deviceValue;
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

			eventEmmiter.emit("serialdata", deviceWithData);

		}catch(err){
			console.log('ERROR IN handleDataOnSerialPort: >>> ', err);
		}
	};


    return methods;

}
