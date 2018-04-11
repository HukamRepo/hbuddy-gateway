s
var FACTORY = require('../common/commonFactory')(),
gpio = require('rpi-gpio'),
async = require('async');

module.exports = function() {

var methods = {};

	methods.setupPinsMode = function(cb){
		try{
			async.parallel([
			                function(callback) {
			                    gpio.setup(FACTORY.getGatewayConfig().LEDS.RED, gpio.DIR_OUT, callback)
			                },
			                function(callback) {
			                    gpio.setup(FACTORY.getGatewayConfig().LEDS.GREEN, gpio.DIR_OUT, callback)
			                },
			                function(callback) {
			                    gpio.setup(FACTORY.getGatewayConfig().LEDS.BLUE, gpio.DIR_OUT, callback)
			                }
			            ], function(err, results) {
			                cb(err, results);
			            });
		}catch(err){
			console.log("ERROR in setupPinsMode: >>> ", err);
			cb(err, null);
		}
	}

	methods.setLEDStatus = function(ledPin, status, callback) {
		try{
			gpio.write(ledPin, status, callback);
		}catch(err){
			console.log("ERROR in startupLEDPattern: >>> ", err);
			callback(err, null);
		}
	};

	methods.startupLEDPattern = function() {
	    async.series([
	        function(callback) {
	            methods.delayedWrite(FACTORY.getGatewayConfig().LEDS.RED, true, callback);
	        },
	        function(callback) {
	        	methods.delayedWrite(FACTORY.getGatewayConfig().LEDS.GREEN, true, callback);
	        },
	        function(callback) {
	        	methods.delayedWrite(FACTORY.getGatewayConfig().LEDS.BLUE, true, callback);
	        },
	        function(callback) {
	        	methods.delayedWrite(FACTORY.getGatewayConfig().LEDS.RED, false, callback);
            },
            function(callback) {
            	methods.delayedWrite(FACTORY.getGatewayConfig().LEDS.GREEN, false, callback);
            },
            function(callback) {
            	methods.delayedWrite(FACTORY.getGatewayConfig().LEDS.BLUE, false, callback);
            }
	    ], function(err, results) {
	        methods.startupLEDPattern();
	    });
	};

	methods.destroyGPIOs = function(cb){
		async.parallel([
		                function(callback) {
				        	gpio.write(FACTORY.getGatewayConfig().LEDS.RED, false, callback);
			            },
			            function(callback) {
			            	gpio.write(FACTORY.getGatewayConfig().LEDS.GREEN, false, callback);
			            },
			            function(callback) {
			            	gpio.write(FACTORY.getGatewayConfig().LEDS.BLUE, false, callback);
			            }
		            ], function(err, results) {
							console.log("IN gpioHandler.destroyGPIOs: >>> ");
							gpio.destroy(function() {
				                console.log('Closed GPIO pins, now exit... ');
				                if(cb){
				                	cb(null, "GPIO_CLOSED");
				                }
				            });
		            });
	}

	methods.delayedWrite = function (pin, value, callback) {
	    setTimeout(function() {
	        gpio.write(pin, value, callback);
	    }, 500);
	}

    return methods;

}
