
var FACTORY = require('../common/commonFactory')();
var schedule = require('node-schedule');

module.exports = function() {

var methods = {};

	methods.processScenes = function(scenes){
		if(scenes && scenes.length > 0){
			methods.scheduleAllScenes(scenes);
		}else{
			FACTORY.LocalDBHandler().loadScenesFromLocalDB(function(err, scenes){
				if(err){
					console.log("ERROR IN loadScenesFromLocalDB: >>>> ", err );
				}else{
					methods.scheduleAllScenes(scenes);
				}
			});
		}
	};

	methods.scheduleAllScenes = function(scenes){
		if(!scenes){
			console.log("NO SCENES TO BROADCAST :>>>>>>> ");
			return false;
		}
		console.log("IN scheduleAllScenes: >>>> ", scenes.length);

		for(var i = 0; i < scenes.length; i++){
			var scene = scenes[i];
			methods.scheduleScene(scene, function(sceneJob){
				if(!sceneJob){
					console.log("\n\n <<<<< JOB CANNOT BE ADDED FOR: >> ", scene.title, "\n\n");
				}
			});
		}
	};

	methods.scheduleScene = function(scene, cb) {
		if(!scene || !scene.status || scene.status != "ACTIVE"){
			console.log("SCENE CANNOT BE SCEHDULED: >>> ", scene.title);
			return false;
		}
		console.log("\n\nScene (" +scene.title+") is of TIME Type and settings are: ", scene.settings);
		var timeArr;
		var hours;
		var mins;
		var secs;
			 timeArr = scene.settings.startTime.split(":");
			 hours = parseInt(timeArr[0]);
			 mins = parseInt(timeArr[1]);
			 secs = parseInt(timeArr[2]);
		var sceneJob = {};
		 if(scene.settings.repeat && scene.settings.repeat.length > 0){
			var rule = new schedule.RecurrenceRule();
			rule.dayOfWeek = [scene.settings.repeat];
			rule.hour = hours;
			rule.minute = mins;
			rule.second = secs;
			console.log("SCHEDULE RULE JOB FOR SCENE: ", scene._id);
			sceneJob = schedule.scheduleJob(scene._id, rule, function(){
				methods.executeScene(scene);
			});
		 }else{
			var scheduleTime = new Date();
			scheduleTime.setHours(hours, mins, secs);
			console.log("SCHEDULE DATE JOB FOR SCENE: ", scene._id);
			sceneJob = schedule.scheduleJob(scene._id, scheduleTime, function(){
				methods.executeScene(scene);
			});
		 }

		console.log("Job Added for Scene: >> ", scene.title, "\n\n");
		cb(sceneJob);
	};

	methods.executeScene = function(scene){
		console.log(" \n\nEXECUTING SCENE AT: ", new Date(), ", SCENE: ", scene.title);
		for(var i = 0; i < scene.areas.length; i++ ){
			var area = scene.areas[i];
			for(var j = 0; j < area.devices.length; j++ ){
				var device = area.devices[j];
				var command = "#"+device.parentId+"#"+device.deviceIndex+"#"+device.value;
				console.log('Command To Broadcast: >>> ', command);
			}
		}

		methods.inactivateScene(scene);

	};

	methods.inactivateScene = function(scene){
		if(!scene.settings.repeat || scene.settings.repeat.length == 0){
			if(scene.settings && scene.settings.startTime && scene.status == "ACTIVE"){
				var secsDiff = FACTORY.CommonHandler().timeDifferenceFromStr(scene.settings.startTime);
				if(secsDiff <= 0){
					console.log("INACTIVATE SCENE: >>> ", scene.title, ", REPEAT: ", scene.settings.repeat);
					scene.status = "INACTIVE";
					FACTORY.LocalDBHandler().updateScene(scene, function(err, scene){
						if(err){
							console.log("Error while updating Scene in LocalDB: >>> ", err);
						}else{
							console.log("SCENE Updated in LocalDB: >>> ", scene.title);
						}
					});

					FACTORY.CloudantHandler().updateScene(scene, function(err, scene){
						if(err){
							console.log("Error while updating Scene in Cloudant: >>> ", err);
						}else{
							console.log("SCENE Updated in Cloudant: >>> ", scene.title);
						}
					});
				}
			}
		}
	};

	methods.updateScene = function(scene){
		console.log("IN updateScene: >>> ID: ", scene.id, ", Title: ", scene.title);

		FACTORY.LocalDBHandler().updateScene(scene, function(err, scene){
			if(err){
				console.log("Error while updating Scene in LocalDB: >>> ", err);
			}else{
				console.log("SCENE Updated in LocalDB: >>> ", scene.title);
			}
		});

		if(schedule.scheduledJobs && schedule.scheduledJobs.length > 0){
			console.log("sceneJobs already in place: >> ", schedule.scheduledJobs.length);
			var sceneFound = false;
			for(var i = 0; i < schedule.scheduledJobs.length; i++){
				var sceneJob = schedule.scheduledJobs[i];
				if(sceneJob.name == scene.id){
					sceneFound = true;
					sceneJob.cancel();
					methods.scheduleScene(scene, function(job){
						console.log("SCENE PREVIOUS JOB CANCELED AND NEW SCENE SCHEDULED>>>>");
					});
					break;
				}
			}
			if(!sceneFound){
				methods.scheduleScene(scene, function(job){
					console.log("SCENE NOT FOUND IN JOBS SCHEDULED, NEW SCENE SCHEDULED>>>>", scene.title);
				});
			}
		}else if(schedule.scheduledJobs[scene.id]){
			var sceneJob = schedule.scheduledJobs[scene.id];
			sceneJob.cancel();
			methods.scheduleScene(scene, function(job){
				console.log("SCENE PREVIOUS JOB CANCELED AND NEW SCENE SCHEDULED>>>>");
			});
		}else{
			methods.scheduleScene(scene, function(job){
				console.log("NO JOBS SCHEDULED, NEW SCENE SCHEDULED>>>>", scene.title);
			});
		}
	};

    return methods;

}
