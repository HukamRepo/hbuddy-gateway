
var FACTORY = require('./common/commonFactory')(),
CONFIG = require('./common/common').CONFIG(),
   exec = require("child_process").exec,
   // sensortagHandler = require('./handlers/sensortagHandler.js')(),
  // dependency_manager = require('./endpoints/dependency_manager.js')(),
  // wifi_manager = require('./endpoints/wifi_manager.js')(),
  path = require('path'),
  async = require("async"),
  fs = require('fs'),
  GPS = require('gps'),
  gps = new GPS,
  conf;

const ngrok = require('ngrok');

module.exports = function(app) {

	var cleanup = require('./utils/cleanup').Cleanup(cleanupOnExit);

  setupGateway();

	function cleanupOnExit(){
		console.log("\n\n<<<<<<<<< CALLING CLEANUP PROCESS >>>>>>>>> ");
//		sensortagHandler.disconnectSensorTags();
		FACTORY.GatewayHandler().destroyGPIOs(function(err, result){
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
		                  handlePublicAvailability
		    	     ], function (err, result) {
        							if (err) {
        								console.log("SHOW STOPPER ERROR: >>>  ", err);
        								return;
        							}
        							console.log("\n\ngatewayInfo: >> ", gatewayInfo);
							        console.log("Final Result: >> ", result);
							        if(process.env.TYPE == "GATEWAY"){
							        	FACTORY.GatewayHandler().initGateway();
							        }							        							        
	     			      });
	};


	function setGlobalDetails(callback){
		   global.appRoot = path.resolve(__dirname);
		   global.gatewayInfo = FACTORY.CommonHandler().gatewayInfo(function(gatewayInfo){
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
	
	function handlePublicAvailability(status, callback){
		const opts = {
			    proto: 'http', // http|tcp|tls, defaults to http
			    addr: 9000, // port or network address, defaultst to 80
			    auth: 'hbuddy:1SatnamW', // http basic authentication for tunnel
//			    authtoken: '6XStYLNm3VPW3RGpoSHgU_55v3UVzEgAjRznnMtnUFh', // your authtoken from ngrok.com
			    region: 'ap', // one of ngrok regions (us, eu, au, ap), defaults to us		    
			}; 
		console.log("NGROK OPTIONS: >>> ", opts);
		
		(async function() {
			  const url = await ngrok.connect(opts);
			  console.log("\n\nNGROK URL: >>>> ", url);
			  callback(null, url); 
			})();
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
