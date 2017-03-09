
'use strict';

module.exports.get = function() {
		return {
			"gatewayId": "",
			"GATEWAY_TYPE": "HukamGateway",
			"CONFIG_FILE_PATH": "/media/pi/USB/configuration.json",
			"CLOUD_CONFIG": {
				"org": "o6oosq",
			    "id": "a-o6oosq-gwvhfgityg",
			    "auth-key": "a-o6oosq-gwvhfgityg",
			    "auth-token": "xwottObtqR@WHSe+q-",
			    "type": "shared"
		    },
		    "SERVICES_CONFIG":{
		    	"hbuddyApi": {
		    		"endpoint":"https://api.us.apiconnect.ibmcloud.com/gurvsin3inibmcom-learn/smarthome/api",
		    		"clientId": "e76cf60a-e1b5-413b-af07-927c1d902d5c",
		    		"clientSecret": "S0cI8sK2bG3pN3cM6xX7fR8tP1lO0eQ2pK7dJ3aT0kL4uG2nQ6"
		    	},
				"cloudantNOSQLDB":{
					 "username": "acb0bba8-0370-47c4-8e49-5ad1b1050873-bluemix",
					  "password": "5bfe2ecae5c815202c4d78db2600812ef5099f337a6deb6dba96ce0b7a5b0e13",
					  "host": "acb0bba8-0370-47c4-8e49-5ad1b1050873-bluemix.cloudant.com",
					  "port": 443,
					  "url": "https://acb0bba8-0370-47c4-8e49-5ad1b1050873-bluemix:5bfe2ecae5c815202c4d78db2600812ef5099f337a6deb6dba96ce0b7a5b0e13@acb0bba8-0370-47c4-8e49-5ad1b1050873-bluemix.cloudant.com"
				},
				"stt":{
					"url": "https://stream.watsonplatform.net/text-to-speech/api",
					"password": "xGaXXN1sHQNE",
					"username": "d1ea6af9-ca33-43c6-a85d-572257ff6a64"
				},
				"conversation":{
					"credentials":{
						"url": "https://gateway.watsonplatform.net/conversation/api",
						"password": "Dd6zArf1tY05",
						"username": "7374796d-9f99-4e50-92f4-b4c5f5ce7e59",
						"version_date": "2016-07-11",
						"version": "v1-experimental",
						"silent": true
					},
					"workspace_id": "ccc639e8-9b25-4226-8611-1f4386000344"
				},
				"objectstorage":{
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
			},
			"home_path":"/home/pi",
		    "wifi_interface": "wlan0",
		    "wifi_driver_type": "nl80211",

		    "access_point": {
		        "force_reconfigure": true,
		        "wifi_interface":    "wlan0",
		        "ssid":              "hbuddy-gateway",
		        "passphrase":        "1SatnamW",
		        "domain":            "hbuddy-gateway.local",
		        "ip_addr":           "192.168.44.1",
		        "netmask":           "255.255.255.0",
		        "subnet_ip":         "192.168.44.0",
		        "broadcast_address": "192.168.44.255",
		        "subnet_range": {
		            "start":         "192.168.44.10",
		            "end":           "192.168.44.50"
		        }
		    },

		    "server": {
		        "port": 88
		    }
		}

};
