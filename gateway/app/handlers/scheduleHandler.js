
var FACTORY = require('../common/commonFactory')(),
schedule = require('node-schedule'),
fs = require('fs');

module.exports = function() {

var methods = {};

	methods.scheduleContentUpload = function(callback){
		console.log("IN scheduleContentUpload, CRON: >> ", FACTORY.getGatewayConfig().UPLOAD_CRON, ", CONTENT_FOLDER: >> ", FACTORY.getGatewayConfig().CONTENT_FOLDER)
		/*
		var rule = new schedule.RecurrenceRule();
		rule.hour = 1;
		rule.minute = 1;
		rule.second = 5;
		console.log("SCHEDULE RULE JOB FOR ContentUpload: ");
		var uploadJob = schedule.scheduleJob(rule, function(){
			console.log('Going to Run Scheduler >>>>>> ', new Date());
			  authenticateObjectStorage(function(err, authResp){
				  if(err){
					  console.log("ERROR IN authenticateObjectStorage:>>> ", err);
				  }else{
					  console.log("authenticateObjectStorage Resp: >> ", authResp);
					  const contentFolder = "/tmp/motion/cam1/";
					  methods.uploadContent(contentFolder);
				  }
			  });
		});
		*/

		authenticateObjectStorage(function(err, authResp){
			  if(err){
				  console.log("ERROR IN authenticateObjectStorage:>>> ", err);
			  }else{
				  FACTORY.ObjectStorageHandler().createContainer(gatewayInfo.gatewayId, function(err, container){
			  			if(err){
			  				console.log("ERROR while creating Container on ObjectStorage: >>", err);
			  			}else{
			  	  			console.log("\n\n <<<< Container Created on Object Storage: >> ", container.name);
				  	  		methods.uploadContent(FACTORY.getGatewayConfig().CONTENT_FOLDER, function(err, resp){
								  console.log(resp);
							});
			  			}
			  		});
			  }
		  });

			var j = schedule.scheduleJob(FACTORY.getGatewayConfig().UPLOAD_CRON, function(){
			  console.log('Going to Run Scheduler >>>>>> ', new Date());
			  authenticateObjectStorage(function(err, authResp){
				  if(err){
					  console.log("ERROR IN authenticateObjectStorage:>>> ", err);
				  }else{
					  console.log("authenticateObjectStorage Resp: >> ", authResp);
					  methods.uploadContent(FACTORY.getGatewayConfig().CONTENT_FOLDER, function(err, resp){
						  console.log(resp);
					  });
				  }
			  });
			});

			callback(null, " \n\n Upload Job Scheduled with CRON >>>>> " +FACTORY.getGatewayConfig().UPLOAD_CRON);
	};

	function authenticateObjectStorage(callback){
		if(!gatewayInfo.internet){
			callback(new Error("Internet Not Available: >>> "), null);
			  return;
		  }

  		FACTORY.ObjectStorageHandler().authenticateObjectStorage(function(err, resp){
  			if(err){
  				console.log(err, null);
  			}else{
  	  			callback(null, "AUTHENTICATE OBJECTSTORAGE Resp:>> ");
  			}
  		});
  	};

	methods.uploadContent = function(contentFolder, cb){
		fs.readdir(contentFolder, (err, files) => {
			if(!files){
				console.log("IN ScheduleHandler.uploadContent, No Files to upload !!!! ");
				if(cb){
					cb(null, "No Files To Upload !!! ");
				}
			}else{
				 files.forEach(file => {
				    console.log(file);
				    var uploadReq = {
							"pathToFile": contentFolder,
							"fileName": file,
							"container": gatewayInfo.gatewayId
					}
				    methods.uploadFile(uploadReq, function(err, resp){
				    	console.log("UPLOAD RESP: >> ", resp);
				    });
				  });

				 if(cb){
					cb(null, "Uploading Files in progress from ... ", contentFolder);
				 }
			}

		});
	};

	methods.uploadFile = function(uploadReq, cb){
		try{
				if(!uploadReq || !uploadReq.container || !uploadReq.fileName){
					cb(new Error("Invalid request for ObjectStorage: ", uploadReq), null);
					return;
				}
				console.log("IN uplaodFile with uploadReq: >> ", uploadReq);
				var readStream = fs.createReadStream(uploadReq.pathToFile+uploadReq.fileName);
				var upload = storageClient.upload({
		            container: uploadReq.container,
		            remote: uploadReq.fileName
		        });
		        upload.on('error', function(err) {
		            console.log("UPLOAD ERROR: >>> ", err);
		            cb(err, null);
		        });

		        upload.on('success', function(file) {
		            cb(null, file.toJSON());
		            methods.deleteFile(uploadReq.pathToFile+uploadReq.fileName);
		        });

		        readStream.pipe(upload);

		}catch(err){
			console.log("ERROR: >> ", err);
		}
	};

	methods.deleteFile = function(filePath){
		fs.unlink(filePath, function(err) {
			  if (err) {
                console.log(JSON.stringify(err));
			  }
			});
	};

    return methods;

}
