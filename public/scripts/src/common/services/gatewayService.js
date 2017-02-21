
define(['angular'], function (angular) {
    "use strict";

  var factory = function (CONFIG, $http) {
	  
	  var gatewayService = {};
	  
      gatewayService.publishMessage = function(payload){
    	  console.log('IN gatewayService.publishMessage: >> ', payload);
          try{
        	  return $http({
  	            url: '/api/dashboard/publishMessage',
  	            method: "POST",
  	            data: payload
  	        });
          }catch(err){
              console.log('Error: >>> ' +JSON.stringify(err));
          }
      };
      
      gatewayService.startSTT = function(){
    	  console.log('IN gatewayService.startSTT: >> ');
          try{
        	  return $http({
  	            url: '/api/stt/start',
  	            method: "POST",
  	            data: {}
  	        });
          }catch(err){
              console.log('Error: >>> ' +JSON.stringify(err));
          }
      };
      
      gatewayService.stopSTT = function(){
    	  console.log('IN gatewayService.stopSTT: >> ');
          try{
        	  return $http({
  	            url: '/api/stt/stop',
  	            method: "POST",
  	            data: {}
  	        });
          }catch(err){
              console.log('Error: >>> ' +JSON.stringify(err));
          }
      };

	  return gatewayService;
	
  }

	factory.$inject = ['CONFIG', '$http'];
	return factory;
});

