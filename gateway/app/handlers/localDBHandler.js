
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
		
		var devicesDBFile = { filename: '../../localdb/devices.db', autoload: true };
		localDB.devices = new Datastore(devicesDBFile);
		localDB.devices.loadDatabase(function (err) {    // Callback is optional
			 if(err){
				 console.log("ERROR WHILE LOADING DEVICES FROM LOCAL DB: >>> "+err, null);
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
		 localDB.boards.find({}, function (err, boards) {
			  cb(err, boards);
		 });
	};
	
	methods.loadDevicesFromLocalDB = function(query, cb){
		 localDB.devices.find(query, function (err, devices) {
			  cb(err, devices);
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

	methods.refreshConfigurationDB = function(query, configuration, cb){
		localDB.configurations.remove(query, { multi: true }, function (err, numRemoved) {
			localDB.configurations.insert(configuration, function (err, configurations) {
					cb(err, configurations);
				});
		  });
	};

	methods.refreshPlaceAreasDB = function(query, placeAreas, cb){
		localDB.placeAreas.remove(query, { multi: true }, function (err, numRemoved) {
			  localDB.placeAreas.insert(placeAreas, function (err, placeAreas) {
				  cb(err, placeAreas);
				});
		  });
	};

	methods.refreshBoardsDB = function(query, boards, cb){
		localDB.boards.remove(query, { multi: true }, function (err, numRemoved) {
			  localDB.boards.insert(boards, function (err, boards) {
				  cb(err, boards);
				});
		  });
	};
	
	methods.refreshDevicesDB = function(query, devices, cb){
		localDB.devices.remove(query, { multi: true }, function (err, numRemoved) {
			  localDB.devices.insert(devices, function (err, devices) {
				  cb(err, devices);
				});
		  });
	};

	methods.refreshScenesDB = function(query, scenes, cb){
		localDB.scenes.remove(query, { multi: true }, function (err, numRemoved) {
			  localDB.scenes.insert(scenes, function (err, scenes) {
				  cb(err, scenes);
				});
		  });
	};
	
    return methods;

}
