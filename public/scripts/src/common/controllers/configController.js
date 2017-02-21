define(function () {
    'use strict';

  function ctrl($log, $rootScope, $scope, $http){

    $rootScope.gotoTop = function (){
      $('body,html').animate({scrollTop:0},400);
    };

    $scope.connectInternet = function(){
    	$log.info("CALLING SHELL SCRIPT WITH CONFIGURATION: >>> ", $rootScope.config);
	      var req = {
	         method: 'POST',
	         url: '/api/config/internetConfiguration',
	         data: $rootScope.config
	      }

      $http(req).then(function(resp){
        $log.info(resp);
        alert("Internet Configuration Status: " +resp.data.status);
      }, function(err){
        $log.error(err);
        alert("Internet Configuration Status: " +err);
      });

    };


  }

  ctrl.$inject = ['$log', '$rootScope', '$scope', '$http'];
  return ctrl;

});
