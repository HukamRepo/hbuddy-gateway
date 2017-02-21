
'use strict';

module.exports.getServiceCreds = function(name) {
    if (process.env.VCAP_SERVICES) {
        var services = JSON.parse(process.env.VCAP_SERVICES);
        for (var service_name in services) {
            if (service_name.indexOf(name) === 0) {
                var service = services[service_name][0];
                return service.credentials;
            }
        }
    }else{
    	// THIS ELSE BLOCK IS TO RUN THE APPLICATION LOCALLY
    	if(name == 'speech_to_text'){
    		return {
    			"url": "https://stream.watsonplatform.net/speech-to-text/api",
                "password": "eoOB2PFBEAWT",
                "username": "d5214313-4222-43f8-8c97-ea73eb5954d0"
    		}
    	}
    	
    	if(name == 'objectstorage'){
    		return {
    			"auth_url": "https://identity.open.softlayer.com",
  			  "project": "object_storage_89373133_c74b_4653_8bfa_64a18d74dac3",
  			  "projectId": "d1944aadb17f45c5b9d741503cf7315a",
  			  "region": "dallas",
  			  "userId": "3cf547ba6a6b4c5090c2d226db9582b3",
  			  "username": "admin_8508ca58304adc5f3010a52f8d25708d12b867a1",
  			  "password": "DaYbS*t~P^LK8j8#",
  			  "domainId": "1a9ab5b4b43c4c018796699612b1f2a3",
  			  "domainName": "1078045",
  			  "role": "admin"
    		}
    	}
    }
    return {};
};