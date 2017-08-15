
var gpio = require('rpi-gpio');
var async = require('async');

module.exports = function() {

var methods = {};

	const RGB_PINS = {"RED": 17, "GREEN": 22, "BLUE": 27};

	methods.initLEDPins = function() {
		try{
			async.parallel([
			                function(callback) {
			                    gpio.setup(RGB_PINS.RED, gpio.DIR_OUT, callback)
			                },
			                function(callback) {
			                    gpio.setup(RGB_PINS.GREEN, gpio.DIR_OUT, callback)
			                },
			                function(callback) {
			                    gpio.setup(RGB_PINS.BLUE, gpio.DIR_OUT, callback)
			                },
			            ], function(err, results) {
			                console.log('GPIO Pins set up: >> ', RGB_PINS);
			                methods.startupLEDPattern();
			            });
		}catch(err){
			console.log("ERROR in startupLEDPattern: >>> ", err);
		}
	};
	
	methods.startupLEDPattern = function() {
	    async.series([
	        function(callback) {
	            methods.delayedWrite(RGB_PINS.RED, true, callback);
	        },
	        function(callback) {
	        	methods.delayedWrite(RGB_PINS.GREEN, true, callback);
	        },
	        function(callback) {
	        	methods.delayedWrite(RGB_PINS.BLUE, true, callback);
	        },
	        function(callback) {
	        	methods.delayedWrite(RGB_PINS.RED, false, callback);
	        },
	        function(callback) {
	        	methods.delayedWrite(RGB_PINS.GREEN, false, callback);
	        },
	        function(callback) {
	        	methods.delayedWrite(RGB_PINS.BLUE, false, callback);
	        },
	    ], function(err, results) {
	        console.log('Writes complete, pause then unexport pins');
	        setTimeout(function() {
	            gpio.destroy(function() {
	                console.log('Closed pins, now exit');
	            });
	        }, 500);
	    });
	};
	
	methods.delayedWrite = function (pin, value, callback) {
	    setTimeout(function() {
	        gpio.write(pin, value, callback);
	    }, 500);
	}
	
    return methods;

}
