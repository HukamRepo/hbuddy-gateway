/*global define, require */

define(['app'], function (app) {
    'use strict';

    app.config(['$routeProvider','$locationProvider', '$httpProvider',
                function($routeProvider, $locationProvider, $httpProvider) {

                	$locationProvider.html5Mode(false);
                    $locationProvider.hashPrefix('!');

                    $httpProvider.defaults.useXDomain = true;
                    delete $httpProvider.defaults.headers.common["X-Requested-With"];
//                    $httpProvider.defaults.headers.common["Accept"] = "application/json";
//                    $httpProvider.defaults.headers.common["Content-Type"] = "application/json";
//                    $httpProvider.defaults.headers.post['Content-Type'] = 'multipart/form-data; charset=utf-8';
//                    $httpProvider.defaults.headers.common["Access-Control-Allow-Origin"] = "*";

                }

     ]);


});
