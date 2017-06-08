
//REFERENCE: https://github.com/louischatriot/nedb#creatingloading-a-database
var Datastore = require('nedb');
var localDB = {};

module.exports = function() {
    
var methods = {};
  	
	methods.loadAllLocalDBs = function(){
		
		var configurationsDBFile = { filename: '../../localdb/configurations.db', autoload: true };
		localDB.configurations = new Datastore(configurationsDBFile);
		localDB.configurations.loadDatabase(function (err) {    // Callback is optional
			 if(err){
				 console.log("ERROR WHILE LOADING CONFIGURATIONS FROM LOCAL DB: >>> "+err, null);
			 }
		});
		
		var placeAreasDBFile = { filename: '../../localdb/placeAreas.db', autoload: true };
		localDB.placeAreas = new Datastore(placeAreasDBFile);
		localDB.placeAreas.loadDatabase(function (err) {    // Callback is optional
			 if(err){
				 console.log("ERROR WHILE LOADING PLACEAREAS FROM LOCAL DB: >>> "+err, null);
			 }
		});
		
		var boardsDBFile = { filename: '../../localdb/boards.db', autoload: true };
		localDB.boards = new Datastore(boardsDBFile);
		localDB.boards.loadDatabase(function (err) {    // Callback is optional
			 if(err){
				 console.log("ERROR WHILE LOADING BOARDS FROM LOCAL DB: >>> "+err, null);
			 }
		});
		
		var scenesDBFile = { filename: '../../localdb/scenes.db', autoload: true };
		localDB.scenes = new Datastore(scenesDBFile);
		localDB.scenes.loadDatabase(function (err) {    // Callback is optional
			 if(err){
				 console.log("ERROR WHILE LOADING SCENES FROM LOCAL DB: >>> "+err, null);
			 }
		});
	};
	
	methods.loadConfigurationsFromLocalDB = function(cb){
		 localDB.configurations.find({}, function (err, configurations) {
			  cb(err, configurations);
		 });
	};
	
	methods.loadPlaceAreasFromLocalDB = function(cb){
//		var findReq = {"gatewayId": CONFIG.gatewayId};
		 localDB.placeAreas.find({}, function (err, placeAreas) {
			  cb(err, placeAreas);
		 });
	};
	
	methods.loadBoardsFromLocalDB = function(cb){
//		var findReq = {"gatewayId": CONFIG.gatewayId};
		 localDB.boards.find({}, function (err, boards) {
			  cb(err, boards);
		 });
	};

	methods.loadScenesFromLocalDB = function(cb){
		 localDB.scenes.find({}, function (err, scenes) {
			  cb(err, scenes);
		 });
	};
	
	methods.updateScene = function(scene, cb){
		console.log("IN localDBHandler.updateScene: >>> ", scene);
		localDB.scenes.remove({ id: scene.id }, {}, function (err, numRemoved) {
		  if(numRemoved == 1){
			  localDB.scenes.insert(scene, function (err, scene) {
				  cb(err, scene);
				});
		  }
		});
	}
	
	methods.refreshConfigurationDB = function(configuration, cb){
		localDB.configurations.remove({}, { multi: true }, function (err, numRemoved) {
			localDB.configurations.insert(configuration, function (err, configurations) {
					cb(err, configurations);
				});
		  });
	};
	
	methods.refreshPlaceAreasDB = function(placeAreas, cb){
		localDB.placeAreas.remove({}, { multi: true }, function (err, numRemoved) {
			  localDB.placeAreas.insert(placeAreas, function (err, placeAreas) {
				  cb(err, placeAreas);
				});
		  });
	};
	
	methods.refreshBoardsDB = function(boards, cb){
		localDB.boards.remove({}, { multi: true }, function (err, numRemoved) {
			  localDB.boards.insert(boards, function (err, boards) {
				  cb(err, boards);
				});
		  });
	};
	
	methods.refreshScenesDB = function(scenes, cb){
		localDB.scenes.remove({}, { multi: true }, function (err, numRemoved) {
			  localDB.scenes.insert(scenes, function (err, scenes) {
				  cb(err, scenes);
				});
		  });
	};

    return methods;
    
}