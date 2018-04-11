
var FACTORY = require('../common/commonFactory')();

var fs = require('fs');

var pkgcloud = require('pkgcloud'),
osConfig = {
	    provider: 'openstack',
	    useServiceCatalog: true,
	    useInternal: false,
	    keystoneAuthVersion: 'v3',
	    authUrl: FACTORY.getGatewayConfig().SERVICES_CONFIG.objectstorage.auth_url,
	    tenantId: FACTORY.getGatewayConfig().SERVICES_CONFIG.objectstorage.projectId,    //projectId from credentials
	    domainId: FACTORY.getGatewayConfig().SERVICES_CONFIG.objectstorage.domainId,
	    username: FACTORY.getGatewayConfig().SERVICES_CONFIG.objectstorage.username,
	    password: FACTORY.getGatewayConfig().SERVICES_CONFIG.objectstorage.password,
	    region: 'dallas'   //dallas or london region
	};

storageClient = pkgcloud.storage.createClient(osConfig);

module.exports = function() {

var methods = {};

	methods.authenticateObjectStorage = function(callback){
		storageClient.auth(function(err) {
		    callback(err, "STORAGE AUTHENTICATED");
//		    storageClient._identity
		});
	};

	methods.createContainer = function(containerName, callback){
		storageClient.createContainer({
			 name: containerName,
			 metadata: {
			  company: 'Hukam',
			  gatewayId: containerName
			 }}, function(err, container) {
			  	callback(err, container);
			 });
	};

	methods.uploadFile = function(uploadReq, cb){
		if(!uploadReq || !uploadReq.container){
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
            console.log("UPLOAD SUCCESS: >>> ", file.toJSON());
            cb(null, file.toJSON());
        });

        readStream.pipe(upload);

	};

    return methods;

}
