define(function () {
    'use strict';

  function ctrl($rootScope, $cookies, $http, gatewayService){
	  
    $rootScope.gotoTop = function (){
      $('body,html').animate({scrollTop:0},400);
    };
    
    $rootScope.currentUser = {};
    $rootScope.footerLinks = [];
    $rootScope.speaking = false;
    $rootScope.initNavBar = function(){
	    //  commonService.pageLoadCalls();
	    };

	    $rootScope.allLinks = [];

	    $rootScope.getAllLinks = function(callBack){
	    	console.log('IN getAllLinks >>>>>>>>>> ');
	    	var req = {
	    			 method: 'GET',
	    			 url: '/resources/alllinks.json',
	    			 headers: {
	    			   'Accept': 'application/json'
	    			 }
	    			}

			$http(req).then(function(jsonResp){
				$rootScope.allLinks = jsonResp.data;
				console.log("ALL LINKS: >>> ", $rootScope.allLinks);
				if(callBack){
					callBack(jsonResp.data);
				}
			}, function(err){
				console.log(err);
			});
	    };

	    $rootScope.checkCurrentUser = function(){
	    	var cookies = $cookies.getAll();
	    	console.log('COOKIES: >>>>>>>', cookies);
			var userKey = cookies['user_key'];
			if(userKey){
				var userEmail = userKey.substring(userKey.lastIndexOf('/')+1);
				$rootScope.currentUser.email = userEmail;
				console.log('$rootScope.currentUser:>>>>> ', $rootScope.currentUser);
			}
	    };
	    
	    $rootScope.startSTT = function(){
	    	console.log('IN startSTT: >>> ');
	    	$rootScope.speaking = true;
	    	gatewayService.startSTT().then(function(response) {
	            console.log('\nResponse for startSTT :>>>> ');
	            console.log(response);
	           },
	           function(error) {
	               console.log('ERROR IN startSTT: >>>>>> ' +JSON.stringify(error));
	           });
	    };
	    
	    $rootScope.stopSTT = function(){
	    	console.log('IN stopSTT: >>> ');
	    	$rootScope.speaking = false;
	    	gatewayService.stopSTT().then(function(response) {
	            console.log('\nResponse for stopSTT :>>>> ');
	            console.log(response);
	           },
	           function(error) {
	               console.log('ERROR IN stopSTT: >>>>>> ' +JSON.stringify(error));
	           });
	    };

  }
  
  ctrl.$inject = ['$rootScope', '$cookies', '$http', 'gatewayService'];
  return ctrl;

});

