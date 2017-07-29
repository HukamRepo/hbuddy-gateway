'use strict'

var CONFIG = require('../common/common').CONFIG(),
    request = require('request'),
    format = require('util').format,
    moment = require('moment');

var apiOptions = {
		  url: CONFIG.SERVICES_CONFIG.hbuddyApi.endpoint,
		  method: "GET",
		  headers: {
		    "Accept": "application/json",
		    "Content-Type":"application/json",
		    "X-IBM-Client-Id": CONFIG.SERVICES_CONFIG.hbuddyApi.clientId,
		    "X-IBM-Client-Secret": CONFIG.SERVICES_CONFIG.hbuddyApi.clientSecret
		  }
		};

module.exports = function() {

var methods = {};

	methods.callConversation = function(req, cb) {
		if(!req || !req.params || !req.params.input){
			cb("INVALID REQ FOR CONVERSATION ! ", null);
		}
		apiOptions.url = CONFIG.SERVICES_CONFIG.hbuddyApi.endpoint + "/Conversations";
		apiOptions.method = "POST";
		apiOptions.json = req;

	    request(apiOptions, function (err, resp, body) {
	        if (err) {
	            cb(err, null);
	        }
	        if (resp.statusCode != 200) {
	           cb(new Error(format("Unexpected status code %s from %s\n%s", resp.statusCode, apiOptions.url, body)), null);
	        }

	        try {
	        	if(body && body.conversation){
	        		console.log("CONVERSATION API RESPONSE: >>> ", JSON.stringify(body));
	        		if(body.conversation.conversationResp){
	        			var context = body.conversation.conversationResp.context;
	        			if(context && context.next_action == 'date_time'){
	        				handleDateTime(body.conversation.conversationResp, cb);
	        			}else{
	        				cb(null, body.conversation.conversationResp);
	        			}
	        		}else{
	        			cb(null, body.conversation);
	        		}
	        	}
	        } catch(ex) {
	            ex.message = format("Unexpected response format from %s - %s", apiOptions.url, ex.message);
	            cb(ex, null);
	        }

	    });
	};

	function handleDateTime(response, cb) {
	    console.log('Handling DateTime: >> ', response.context);
	    if(response.context.show){
	    		if(response.context.show.length > 1){
	    			var dateTimeResp = "It's "+moment().format("LLLL");
		    		console.log("Output: ", dateTimeResp);
		    		response.output = {
		        			text: [dateTimeResp]
		        	};
	    		}

	    		if(response.context.show.length == 1){
	    			if(response.context.show[0] == "date"){
	    				var dateTimeResp = "It's "+moment().format("LL");
			    		console.log("Output: ", dateTimeResp);
			    		response.output = {
			        			text: [dateTimeResp]
			        	};
	    			}
	    			if(response.context.show[0] == "time"){
	    				var dateTimeResp = "It's "+moment().format("LT");
			    		console.log("Output: ", dateTimeResp);
			    		response.output = {
			        			text: [dateTimeResp]
			        	};
	    			}
	    			if(response.context.show[0] == "day"){
	    				var dateTimeResp = "It's "+moment().format("dddd");
			    		console.log("Output: ", dateTimeResp);
			    		response.output = {
			        			text: [dateTimeResp]
			        	};
	    			}
	    		}


	    }

	    cb(null, response);

	};

	function handleConversationResponse(err, conversationResp, cb){
		console.log("IN handleConversationResponse:>>>> ", conversationResp);
	};


    return methods;

}
