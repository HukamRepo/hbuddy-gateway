define([
	'angular',	
	'angularRoute',
    'angularAnimate',
    'angularLocalStorage',
    'angularToastr',
    'angularFilesystem',
    'angularCookies',
    'bootstrap',
//    'ui.bootstrap',
    'cryptojslib',
    'querystring',
	'config',
	'common/commonModule',
	'watson/watsonModule'
], function (angular, angularRoute) {
    'use strict';

    var gateway =  angular.module('gateway', [
        'ngRoute',
        'ngAnimate',
        'ngCookies',
//        'ui.bootstrap',
        'LocalStorageModule',
        'toastr',
        'fileSystem',
        'app.config',
        'commonModule',
        'watsonModule'
    ]);

    
    gateway.config(function(toastrConfig) {
        angular.extend(toastrConfig, {
            allowHtml: false,
            closeButton: true,
            closeHtml: '<button>&times;</button>',
            containerId: 'toast-container',
            extendedTimeOut: 2000,
            iconClasses: {
                error: 'toast-error',
                info: 'toast-info',
                success: 'toast-success',
                warning: 'toast-warning'
            },
            maxOpened: 0,
            messageClass: 'toast-message',
            newestOnTop: true,
            onHidden: null,
            onShown: null,
            positionClass: 'toast-top-full-width',
            preventDuplicates: false,
            progressBar: false,
            tapToDismiss: true,
            target: 'body',
            templates: {
                toast: 'directives/toast/toast.html',
                progressbar: 'directives/progressbar/progressbar.html'
            },
            timeOut: 5000,
            titleClass: 'toast-title',
            toastClass: 'toast'
        });
    });
    
	
    
    gateway.run(['$rootScope','$location',function($rootScope, $location) {
        $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
            console.log('IN routeChangeStart >>>>>>> ');
             $rootScope.footerLinks = [];
             $rootScope.config = {wifi: {ssid: '', password: ''}};
        });
        
        $rootScope.loadingScreen = $('<div style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:10000;background-color:gray;background-color:rgba(70,70,70,0.2);"><img style="position:absolute;top:50%;left:50%;" alt="" src="/images/loading.gif" /></div>')
        .appendTo($('body')).hide();
        
    }]);
     
    
    return gateway;


});
