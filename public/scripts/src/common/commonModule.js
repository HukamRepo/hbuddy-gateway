define(function (require) {
    'use strict';

    var angular = require('angular'),
	config = require('config'),
	ngRoute = require('angularRoute'),
	ngStorage = require('angularLocalStorage'),
    commonModule = angular.module('commonModule', ['ngRoute',
                                                   'ngAnimate',
                                                   'LocalStorageModule',
                                                   'app.config']);

    commonModule.factory('mqttService', require('common/services/mqttService'));
    commonModule.factory('gatewayService', require('common/services/gatewayService'));

    commonModule.controller('commonController', require('common/controllers/commonController'));
    commonModule.controller('dashboardController', require('common/controllers/dashboardController'));
    commonModule.controller('configController', require('common/controllers/configController'));


    commonModule.directive('fileModel', require('common/directives/fileModelDirective'));
    commonModule.directive('toggle', require('common/directives/toggleDirective'));

    commonModule.filter('interpolate', ['version', function(version) {
        return function(text) {
            return String(text).replace(/\%VERSION\%/mg, version);
          }
        }
        ]).
        filter('unsafe', ['$sce', function($sce) {
          return function(val) {
          	return $sce.trustAsHtml(val);
            }
          }
        ]);

    commonModule.config(['$routeProvider',
                         function($routeProvider) {
  		$routeProvider.
  			when('/dashboard', {
  				templateUrl: 'scripts/src/common/views/dashboard.html',
  				controller: 'dashboardController',
  				controllerAs: 'vm',
  				access: { requiredLogin: false }
  			}).
        when('/config', {
  				templateUrl: 'scripts/src/common/views/config.html',
  				controller: 'configController',
  				controllerAs: 'vm',
  				access: { requiredLogin: false }
  			}).
        otherwise('/dashboard');
  	}]);


    return commonModule;

});
