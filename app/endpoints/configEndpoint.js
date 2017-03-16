
module.exports = function() {

  var exec = require("child_process").exec;
  var CONFIG = require('../config/config').get();
  var wifi_manager = require('../endpoints/wifi_manager')();

	  return{

		    checkConnectivity: function(callback) {
	              var command = 'sh '+appRoot+'/resources/shellscripts/connectivity.sh';
	              console.log('\nIN configEndpoint to checkConnectivity, command: ', command);
	              var myscript = exec(command);
	              myscript.stdout.on('data',function(data){
	                  console.log(String(data)); // process output will be displayed here
	                  callback(String(data));
	              });
	              myscript.stderr.on('data',function(data){
	                  console.log(String(data)); // process error output will be displayed here
	                  callback(String(data));
	              });
            },

            getConfiguration: function(req,res) {
              console.log('\nIN confiEndpoint to getConfiguration >>>>>>>>>>');
            },

            internetConfiguration: function(req, res){
          	  console.log('\nIN configEndpoint to internetConfiguration >>>>>>>>>>', req.body);
              var wifi = req.body;
              var myscript = exec('sh ~/hbuddy/hbuddy-gateway/app/resources/shellscripts/internetconfig.sh '+wifi.ssid +' ' +wifi.password );
                myscript.stdout.on('data',function(data){
                    console.log(data); // process output will be displayed here
                });
                myscript.stderr.on('data',function(data){
                    console.log(data); // process error output will be displayed here
                });

                var conn_info = {
                        wifi_ssid: wifi.ssid,
                        wifi_passcode:  wifi.password,
                    };

                    wifi_manager.enable_wifi_mode(conn_info, function(error, result) {
                        if (error) {
                            console.log("Enable Wifi ERROR: " + error);
                            console.log("Attempt to re-enable AP mode");
                            wifi_manager.enable_ap_mode(CONFIG.access_point.ssid, function(error) {
                                console.log("... AP mode reset");
                            });
                            res.json({"status":"AP MODE ACTIVATED"});
                        }else{
                            console.log("Wifi Enabled! - Exiting: >> ", result);
                            var wifiStatus = "WIFI MODE ACTIVATED, Result: "+String(result);
                            res.json({"status": wifiStatus});
                        }
                    });
            }

        }

}
