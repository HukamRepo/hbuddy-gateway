var bleno = require('bleno');
var util = require('util');

var BlenoCharacteristic = bleno.Characteristic;

	var WifiCharacteristic = function() {
		 WifiCharacteristic.super_.call(this, {
		    uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb10',
		    properties: ['read', 'write']
		  });
		
		 this._value = new Buffer(0);
	};

	WifiCharacteristic.prototype.onReadRequest = function(offset, callback) {
		console.log("In onReadRequest: >> ");
		  if(!offset) {
		
		    this._value = new Buffer(JSON.stringify({
		      'gatewayId' : "hbuddy-gateway-111"		      
		    }));
		  }		
		  callback(this.RESULT_SUCCESS, this._value.slice(offset, this._value.length));
	};
	
	WifiCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
		 console.log("In onWriteRequest: >> ", data);
		 callback(this.RESULT_SUCCESS);
	};

	util.inherits(WifiCharacteristic, BlenoCharacteristic);
	module.exports = WifiCharacteristic;
	