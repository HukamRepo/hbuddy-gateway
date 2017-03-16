define(function () {
    'use strict';

  function ctrl($log, $rootScope, $scope, gatewayService){

    $rootScope.gotoTop = function (){
      $('body,html').animate({scrollTop:0},400);
    };

    $scope.updateWifiConfiguration = function(){
    	$log.info("CALLING SHELL SCRIPT WITH CONFIGURATION: >>> ", $rootScope.config.wifi);
	      gatewayService.updateWifiConfiguration($rootScope.config.wifi).then(function(response) {
	            $log.info('\nResponse for startSTT :>>>> ');
	            $log.info(response);
           },
           function(error) {
               $log.info('ERROR IN startSTT: >>>>>> ' +JSON.stringify(error));
           });

    };
    
    $scope.enableSensors = function(){
    	$rootScope.config.sensors = {
    		"type":"SENSOR",
    		"command": "CONNECT_SENSORS",
    	        "options":{
    	             "temperature": {"enable": true},
    	             "humidity": {"enable": true}
    	         }

    	};
    	
    	$log.info("CALLING ENABLE SENSORS WITH CONFIGURATION: >>> ", $rootScope.config.sensors);
    	gatewayService.processCommand($rootScope.config.sensors).then(function(response) {
            $log.info('\nResponse for processCommand :>>>> ');
            $log.info(response);
           },
           function(error) {
               $log.info('ERROR IN processCommand: >>>>>> ' +JSON.stringify(error));
           });
	      
    };
    
    $scope.disableSensors = function(){
    	$rootScope.config.sensors = {
        		"type":"SENSOR",
        		"command": "DISCONNECT_SENSORS"
        	};
        	
        	$log.info("CALLING DISABLE SENSORS WITH CONFIGURATION: >>> ", $rootScope.config.sensors);
        	gatewayService.processCommand($rootScope.config.sensors).then(function(response) {
                $log.info('\nResponse for processCommand :>>>> ');
                $log.info(response);
               },
               function(error) {
                   $log.info('ERROR IN processCommand: >>>>>> ' +JSON.stringify(error));
               });
    };


  }

  ctrl.$inject = ['$log', '$rootScope', '$scope', 'gatewayService'];
  return ctrl;

});
