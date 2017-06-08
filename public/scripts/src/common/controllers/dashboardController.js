define(function () {
    'use strict';

  function ctrl($rootScope, $scope, gatewayService){
	  
	$scope.mqttMsg = {};
	  
    $rootScope.gotoTop = function (){
      $('body,html').animate({scrollTop:0},400);
    };
    
    $scope.initDashboard = function(){
    	
    };
    
    $scope.publishMessage = function(){
    	console.log('IN publishMessage: >>> ', $scope.mqttMsg);
    	gatewayService.publishMessage($scope.mqttMsg).then(function(response) {
            console.log('\nResponse for publishMessage :>>>> ');
            console.log(response);
           },
           function(error) {
               console.log('ERROR IN publishMsg: >>>>>> ' +JSON.stringify(error));
           });
    };
    

  }
  
  ctrl.$inject = ['$rootScope', '$scope', 'gatewayService'];
  return ctrl;

});

