
var crypto = require('crypto');

module.exports = function() {
    
var methods = {};

	methods.getRPISerialNumber = function() {
		try{
			var fs = require('fs');
		    var content = fs.readFileSync('/proc/cpuinfo', 'utf8');
		    var cont_array = content.split("\n");
		    var serial_line = cont_array[cont_array.length-2];
		    var serial = serial_line.split(":");
		    return serial[1].slice(1);
//		    return "GG-000-000-001";
		}catch(err){
			console.log("process.platform: >>> ", process.platform);
			if(process.platform == 'darwin'){
				return "000000008c0be72b";
			}else{
				return null;
			}
		}
	};
	
	methods.checkInternet = function(cb) {
	    require('dns').lookup('google.com',function(err, address) {
	    	console.log("IN CheckInternet Resp: ", err, ", address: >> ", address);
	        if (err && err.code == "ENOTFOUND") {
	            cb(false);
	        } else {
	            cb(true);
	        }
	    })
	};
	
	methods.gatewayInfo = function(cb){
		var info = {"gatewayId": "", "internet": "", "visibility": true};		
		info.gatewayId = methods.getRPISerialNumber();
		
		methods.checkInternet(function(isConnected) {
			info.internet = isConnected;
			if(cb){
				cb(info);
			}
		});
		
		return info;
	};
  	
	methods.random = function(howMany, chars) {
	    chars = chars 
	        || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ23456789";
	    var rnd = crypto.randomBytes(howMany)
	        , value = new Array(howMany)
	        , len = chars.length;
	
	    for (var i = 0; i < howMany; i++) {
	        value[i] = chars[rnd[i] % len]
	    };
	
	    return value.join('');
	};
	
	/**
	 * timeString is in format HH:MM:SS
	 */
	methods.timeDifferenceFromStr = function(timeString){
		console.log("IN commonHandler.timeDifference with timeString: ", timeString);
		var timeArr;
		var hours;
		var mins;
		var secs;
			 timeArr = timeString.split(":");
			 hours = parseInt(timeArr[0]);
			 mins = parseInt(timeArr[1]);
			 secs = parseInt(timeArr[2]);
		return methods.timeDifference(hours, mins, secs);
	};
	
	methods.timeDifference = function(hours, minutes, seconds){
		console.log("IN commonHandler.timeDifference with values, hours: ", hours, ", mins: ", minutes, ", secs: ", seconds);
		var timeNow = new Date();
		var hourNow = timeNow.getHours();
		var minNow = timeNow.getMinutes();
		var scheduleTime = new Date();
		scheduleTime.setHours(hours, minutes, seconds);
		
		console.log("timeNow: >>> ", timeNow, ", scheduleTime: ", scheduleTime);
		var secsDiff = (scheduleTime.getTime() - timeNow.getTime())/1000;
		return secsDiff;
	};
	
	 methods.simpleStringify = function(object){
	    var simpleObject = {};
	    for (var prop in object ){
	        if (!object.hasOwnProperty(prop)){
	            continue;
	        }
	        if (typeof(object[prop]) == 'object'){
	            continue;
	        }
	        if (typeof(object[prop]) == 'function'){
	            continue;
	        }
	        simpleObject[prop] = object[prop];
	    }
	    return JSON.stringify(simpleObject); // returns cleaned up JSON
	};
	
    return methods;
    
}