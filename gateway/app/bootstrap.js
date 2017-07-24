
var CONFIG = require('./config/config').get(),
  exec = require("child_process").exec,
  gatewayHandler = require('./handlers/gatewayHandler.js')(),
  sensortagHandler = require('./handlers/sensortagHandler.js')(),
  dependency_manager = require('./endpoints/dependency_manager.js')(),
  wifi_manager = require('./endpoints/wifi_manager.js')(),
  scheduleHandler = require('./handlers/scheduleHandler.js')(),
  path = require('path'),
  async = require("async"),  
  fs = require('fs'),
  conf;

module.exports = function(app) {
	
	var cleanup = require('./utils/cleanup').Cleanup(cleanupOnExit);

    setupGateway();    
	
	function cleanupOnExit(){
		console.log("\n\n<<<<<<<<< CALLING CLEANUP PROCESS >>>>>>>>> ");
		sensortagHandler.disconnectSensorTags();
		console.log("<<<<<<< Gateway Stopped, Good Bye >>>>>>>>\n");
	}
  
	function setupGateway(){
		console.log("IN setupGateway: >> ");
		async.waterfall([
		                 setGlobalDetails,
//		                 checkDependencies,
		                 checkConnectivity,
		    	         readConfigurationFile,
		    	         uploadFiles
		    	     ], function (err, result) {
							if (err) {
								console.log("SHOW STOPPER ERROR: >>>  ", err);
								return;
							}
							console.log("Final Result: >> ", result);
							gatewayHandler.initGateway();
	     			    });		      
	};
	
	function setGlobalDetails(callback){
		 global.appRoot = path.resolve(__dirname);
		 global.gatewayInfo = gatewayHandler.gatewayInfo(function(gatewayInfo){
			 global.gatewayInfo = gatewayInfo;
			 require('./handlers/ble/blenoHandler').advertise(gatewayInfo);
			 callback(null, "GLOBAL DETAILS SET");			 
		 });
	};
	
	function uploadFiles(status, callback){
  		scheduleHandler.scheduleContentUpload(function(err, resp){
  			console.log(resp);
  		});
  		callback(null, "SCHEDULER CALLED");
  	};
	
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
	
	function checkConnectivity(status, callback){
		var scriptPath = appRoot+"/resources/shellscripts/connectivity.sh";
		var command = 'sh '+scriptPath;
        var myscript = exec(command);
        myscript.stdout.on('data',function(data){
        	var resp = String(data);
        	resp = resp.trim();
        	if(resp == "ONLINE" || resp == "OFFLINE"){
        		console.log("Connnectivity SUCCESS Status: ", resp);
        		callback(null, resp);
        	}            
        });
        myscript.stderr.on('data',function(data){
        	var resp = String(data);
        	resp = resp.trim();
            console.log("Connnectivity ERROR Status: ", resp);
            if(resp == "ONLINE" || resp == "OFFLINE"){
        		callback(null, resp);
        	} 
        });
	};
	
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
   	 			enableAPMode(callback);
   	 		}else{
	   	 		conf = JSON.parse(fileData);
		        console.log("CONFIGURATION FILE DATA: >>> ", conf);
		        if(conf.wifi_ssid && conf.wifi_passcode && conf.wifi_ssid != 'CHANGE_SSID'){
		        	enableWIFIMode(conf, callback);
		        }else{
		        	enableAPMode(callback);
		        }
   	 		}	   	 	
   	 	});
	};
	
	function enableAPMode(callback){
		callback(null, "NOT_ENABLING_AP_MODE");
		return false;
		wifi_manager.enable_ap_mode(CONFIG.access_point.ssid, function(error) {
            if(error) {
                console.log("... AP Enable ERROR: " + error);
                callback(err, null);
            } else {
                console.log("... AP Enable Success!");
                callback(null, "AP_ENABLED");
            }
        });
	};
	
	function enableWIFIMode(conn_info, callback){
		console.log("IN setup.enableWIFIMode with conf:>>> ", conf);
		wifi_manager.enable_wifi_mode(conn_info, function(error, result) {
            if (error) {
                console.log("Enable Wifi ERROR: " + error);
                console.log("Attempting to re-enable AP mode");
                enableAPMode(function(err, result){
                	callback(err, result);
                });
            }else{
                console.log("WIFI Enabled! - Exiting: >> ", result);
                callback(null, result);
            }                        
        });
		
	};
  

}
