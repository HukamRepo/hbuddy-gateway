
var CONFIG = require('./common/common').CONFIG(),
   exec = require("child_process").exec,
   gatewayHandler = require('./handlers/gatewayHandler.js')(),
  // sensortagHandler = require('./handlers/sensortagHandler.js')(),
  // dependency_manager = require('./endpoints/dependency_manager.js')(),
  // wifi_manager = require('./endpoints/wifi_manager.js')(),
   scheduleHandler = require('./handlers/scheduleHandler.js')(),
  path = require('path'),
  async = require("async"),
  fs = require('fs'),
  GPS = require('gps'),
  gps = new GPS,
  conf;

module.exports = function(app) {

	var cleanup = require('./utils/cleanup').Cleanup(cleanupOnExit);

  setupGateway();

	function cleanupOnExit(){
		console.log("\n\n<<<<<<<<< CALLING CLEANUP PROCESS >>>>>>>>> ");
//		sensortagHandler.disconnectSensorTags();
		gatewayHandler.destroyGPIOs(function(err, result){
			console.log("<<<<<<< Gateway Stopped, Good Bye >>>>>>>>\n");
		});		
	}

	function setupGateway(){
		console.log("IN setupGateway: >> ");
		async.waterfall([
		                  setGlobalDetails,
		                  // checkDependencies,
		                  checkConnectivity,
		    	          readConfigurationFile,
		    	          uploadFiles
		    	     ], function (err, result) {
        							if (err) {
        								console.log("SHOW STOPPER ERROR: >>>  ", err);
        								return;
        							}
							        console.log("Final Result: >> ", gatewayInfo);
							        gatewayHandler.initGateway();
	     			      });
	};


	function setGlobalDetails(callback){
		   global.appRoot = path.resolve(__dirname);
		   global.gatewayInfo = gatewayHandler.gatewayInfo(function(gatewayInfo){
				 global.gatewayInfo = gatewayInfo;
				//  require('./handlers/ble/blenoHandler').advertise(gatewayInfo);
				 callback(null, "GLOBAL DETAILS SET");
		   });
		   
		   gps.on('data', function(data) {
			   console.log(data, gps.state);
			   console.log("GPS DATA: >>> ", data);
			   global.gatewayInfo.gps = data;
		   });
	};

	function uploadFiles(status, callback){
    console.log("IN uploadFiles: >> ", status);
  		scheduleHandler.scheduleContentUpload(function(err, resp){
  			console.log(resp);
  		});
  		callback(null, "SCHEDULER CALLED");
  	};

  function checkConnectivity(status, callback){
		var scriptPath = appRoot+"/resources/shellscripts/connectivity.sh";
		var command = 'sh '+scriptPath;
        var myscript = exec(command);
        myscript.stdout.on('data',function(data){
        	var resp = String(data);
        	resp = resp.trim();
        	if(resp == "ONLINE" || resp == "OFFLINE"){
        		console.log("Internet Connnectivity SUCCESS Status: ", resp);
        		callback(null, resp);
        	}
        });
        myscript.stderr.on('data',function(data){
        	var resp = String(data);
        	resp = resp.trim();
            console.log("Internet Connnectivity ERROR Status: ", resp);
            if(resp == "ONLINE" || resp == "OFFLINE"){
        		callback(null, resp);
        	}
        });
	};


/*
  function checkDependencies(status, callback){
		dependency_manager.check_deps({
		      "binaries": ["dhcpd", "hostapd", "iw"],
		      "files":    ["/etc/init.d/isc-dhcp-server"]
		  }, function(error) {
		      if (error){
		    	  var err = new Error("* Dependency error, did you run `sudo npm run-script provision`? " +error);
		    	  callback(err, null);
		    	  // For testing locally uncomment below line and comment above line
//		    	  callback(null, null);
		      }else{
		    	  callback(null, "DEPENDENCIES CHECKED");
		      }
		  });
	};
  */

  function readConfigurationFile(status, callback){
		console.log("IN readConfigurationFile, status:>>  ", status);
		if(status && status.trim() == 'ONLINE'){
			callback(null, "WIFI_ENABLED");
			return false;
		}

		console.log("Read Conf file from PATH: ", CONFIG.CONFIG_FILE_PATH);
   	 	fs.readFile(CONFIG.CONFIG_FILE_PATH, 'utf8', function(err, fileData){
   	 		if(err){
   	 			console.log('<<<<< START IN AP MODE >>>>>>>', err);
//   	 			enableAPMode(callback);
   	 		}else{
	   	 		conf = JSON.parse(fileData);
		        console.log("CONFIGURATION FILE DATA: >>> ", conf);
		        if(conf.wifi_ssid && conf.wifi_passcode && conf.wifi_ssid != 'CHANGE_SSID'){
		        	enableWIFIMode(conf, callback);
		        }else{
//		        	enableAPMode(callback);
		        }
   	 		}
   	 		callback(null, "WIFI_ENABLED");
   	 	});
	};

}
