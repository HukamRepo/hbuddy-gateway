
var CONFIG = require('../common/common').CONFIG();

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

	methods.loadPlaceFromCloud = function(cb){
		var cloudantDB = cloudant.use('places');
		  var findReq = {selector:{'loopback__model__name': 'Place', 'gatewayId': global.gatewayInfo.gatewayId}};
//		  console.log("FIND Places REQ: >>> ", findReq);
		  cloudantDB.find(findReq, function(err, result) {
				  if (err) {
					  cb(err, null);
				  }else{
					  if(result && result.docs && result.docs.length > 0){
						  cb(err, result.docs[0]);
					  }else{
						  cb(err, null);
					  }
				  }
			});
	};

	methods.loadPlaceAreasFromCloud = function(updateLocalDB, cb){
		var cloudantDB = cloudant.use('placeareas');
		  var findReq = {selector:{'loopback__model__name': 'PlaceArea', 'placeId': global.place._id}};
//		  console.log("FIND PlaceAreas REQ: >>> ", findReq);
		  cloudantDB.find(findReq, function(err, result) {
				  if (err) {
					  cb(err, result);
				  }else{
					  if(updateLocalDB){
						  localDBHandler.refreshPlaceAreasDB(result.docs, function(err, placeAreas){
							  cb(err, placeAreas);
						  });
					  }else{
						  if(result && result.docs && result.docs.length > 0){
							  cb(err, result.docs[0]);
						  }else{
							  cb(err, result);
						  }
					  }

				  }
			});
	};

	methods.loadBoardsFromCloud = function(updateLocalDB, cb){
		var cloudantDB = cloudant.use('boards');
//		  var findReq = {selector:{'loopback__model__name': 'Board', 'gatewayId': global.gatewayInfo.gatewayId}};
		  var findReq = {
					selector:{
	    			  		   "$and": [{'loopback__model__name': 'Board'},
	    			  		                 {"$or":[{'gatewayId': global.gatewayInfo.gatewayId},
	    			  		                        {'placeId': global.place._id}]}
	    			  		 				]
							}
  						};
//		  console.log("FIND Boards REQ: >>> ", findReq);
		  cloudantDB.find(findReq, function(err, result) {
				  if (err) {
					  cb(err, null);
				  }else{
					  if(updateLocalDB){
						  localDBHandler.refreshBoardsDB(result.docs, function(err, boards){
							  cb(err, boards);
						  });
					  }else{
						  if(result && result.docs && result.docs.length > 0){
							  cb(err, result.docs[0]);
						  }else{
							  cb(err, result);
						  }
					  }
				  }
			});
	};

	methods.loadScenesFromCloud = function(updateLocalDB, cb){
		var cloudantDB = cloudant.use('scenes');
		  var findReq = {selector:{'loopback__model__name': 'Scene', 'placeId': global.place._id}};
		  cloudantDB.find(findReq, function(err, result) {
				  if (err) {
					  cb(err, null);
				  }else{
					  if(updateLocalDB){
						  localDBHandler.refreshScenesDB(result.docs, function(err, scenes){
							  cb(err, scenes);
						  });
					  }else{
						  if(result && result.docs && result.docs.length > 0){
							  cb(err, result.docs[0]);
						  }else{
							  cb(err, result);
						  }
					  }

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
