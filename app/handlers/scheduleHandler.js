
var CONFIG = require('../config/config').get(),
schedule = require('node-schedule'),
localDBHandler = require('../handlers/localDBHandler')(),
commonHandler = require('../handlers/commonHandler')(),
objStorageHandler = require('../handlers/objectStorageHandler')(),
fs = require('fs');

module.exports = function() {
	
var methods = {};

	methods.scheduleContentUpload = function(callback){
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
		
			var j = schedule.scheduleJob('0 0 */1 * * *', function(){
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
	};
	
	function authenticateObjectStorage(callback){
		if(!gatewayInfo.internet){
			callback(new Error("Internet Not Available: >>> "), null);
			  return;
		  }
		
  		objStorageHandler.authenticateObjectStorage(function(err, resp){
  			if(err){
  				console.log(err, null);
  			}else{
  	  			callback(null, "AUTHENTICATE OBJECTSTORAGE Resp:>> ");
  			}  			
  		});
  	};
  	
	methods.uploadContent = function(contentFolder){
		fs.readdir(contentFolder, (err, files) => {
			  files.forEach(file => {
			    console.log(file);
			    var uploadReq = {
						"pathToFile": contentFolder,
						"fileName": file,
						"container":"surveillance"
				}
			    methods.uploadFile(uploadReq, function(err, resp){
			    	console.log("UPLOAD RESP: >> ", resp);
			    });
			    
			  });
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