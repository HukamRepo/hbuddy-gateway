
var CONFIG = require('../common/common').CONFIG(),
var gpio = require('rpi-gpio');
var async = require('async');

module.exports = function() {

var methods = {};

	methods.setupPinsMode = function(cb){
		try{
			async.parallel([
			                function(callback) {
			                    gpio.setup(CONFIG.LEDS.RED, gpio.DIR_OUT, callback)
			                },
			                function(callback) {
			                    gpio.setup(CONFIG.LEDS.GREEN, gpio.DIR_OUT, callback)
			                },
			                function(callback) {
			                    gpio.setup(CONFIG.LEDS.BLUE, gpio.DIR_OUT, callback)
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
	            methods.delayedWrite(CONFIG.LEDS.RED, true, callback);
	        },
	        function(callback) {
	        	methods.delayedWrite(CONFIG.LEDS.GREEN, true, callback);
	        },
	        function(callback) {
	        	methods.delayedWrite(CONFIG.LEDS.BLUE, true, callback);
	        },
	        function(callback) {
	        	methods.delayedWrite(CONFIG.LEDS.RED, false, callback);
            },
            function(callback) {
            	methods.delayedWrite(CONFIG.LEDS.GREEN, false, callback);
            },
            function(callback) {
            	methods.delayedWrite(CONFIG.LEDS.BLUE, false, callback);
            }
	    ], function(err, results) {
	        methods.startupLEDPattern();	        
	    });
	};
	
	methods.destroyGPIOs = function(cb){
		async.parallel([
		                function(callback) {
				        	gpio.write(CONFIG.LEDS.RED, false, callback);
			            },
			            function(callback) {
			            	gpio.write(CONFIG.LEDS.GREEN, false, callback);
			            },
			            function(callback) {
			            	gpio.write(CONFIG.LEDS.BLUE, false, callback);
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
