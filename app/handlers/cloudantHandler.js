
var CONFIG = require('../config/config').get();

var localDBHandler = require('../handlers/localDBHandler')();
var commonHandler = require('../handlers/commonHandler')();

var cloudant = require('cloudant')(CONFIG.SERVICES_CONFIG.cloudantNOSQLDB.url);

module.exports = function() {
    
var methods = {};
  	
	methods.loadConfigurationsFromCloud = function(updateLocalDB, cb){
		var cloudantDB = cloudant.use('configurations');
		var findReq = {selector:{"loopback__model__name":"Configuration"}};
		var configuration = {};
		cloudantDB.find(findReq, function(err, result) {
				  if (err) {
					  cb(err, null);
				  }else{
					  for(var index in result.docs) { 
						  var resp = result.docs[index];
						  configuration[resp.configurationType] = resp.configuration;
					  }
					  if(updateLocalDB){
						  localDBHandler.refreshConfigurationDB(configuration, function(err, configuration){
							  if(err){
								  console.log("ERROR WHILE REFRESHING CONFIGURATION IN LOCAL DB:>> ", err);
							  }else{
								  console.log("TOTAL CONFIGURATION INSERTED IN LOCAL DB: >> ", configuration);
							  }
						  });
					  }
					  cb(null, configuration);
				  }
			});
	};

	methods.loadBoardsFromCloud = function(updateLocalDB, cb){
		var cloudantDB = cloudant.use('boards');
		  var findReq = {selector:{'loopback__model__name': 'Board', 'gatewayId': global.gatewayInfo.gatewayId}};
		  console.log("FIND Boards REQ: >>> ", findReq);
		  cloudantDB.find(findReq, function(err, result) {
				  if (err) {
					  cb(err, null);
				  }else{
					  if(updateLocalDB){
						  localDBHandler.refreshBoardsDB(result.docs, function(err, boards){
							  if(err){
								  console.log("ERROR WHILE REFRESHING BOARDS IN LOCAL DB:>> ", err);
							  }else{
								  console.log("TOTAL BOARDS INSERTED IN LOCAL DB: >> ", boards.length);
							  }
						  });
					  }
					  cb(err, result.docs);
				  }
			});
	};
	
	methods.loadScenesFromCloud = function(updateLocalDB, cb){
		var cloudantDB = cloudant.use('scenes');
		  var findReq = {selector:{'loopback__model__name': 'Scene'}};
		  cloudantDB.find(findReq, function(err, result) {
				  if (err) {
					  cb(err, null);
				  }else{
					  if(updateLocalDB){
						  localDBHandler.refreshScenesDB(result.docs, function(err, scenes){
							  if(err){
								  console.log("ERROR WHILE REFRESHING SCENES IN LOCAL DB:>> ", err);
							  }else{
								  console.log("TOTAL SCENES INSERTED IN LOCAL DB: >> ", scenes.length);
							  }
						  });
					  }
					  cb(err, result.docs);
				  }
			});
	};
	
	methods.updateScene = function(scene, cb){
		if(!scene){
			return false;
		}
		var cloudantDB = cloudant.use('scenes');
		cloudantDB.insert(scene, function(err, scene) {
			cb(err, scene);
		});
	};
	
    return methods;
    
}