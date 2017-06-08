
define(['angular'], function (angular) {
    "use strict";

  var factory = function (CONFIG) {
	  
	  var mqttClient = {};
	  
	  mqttClient.connectToMqtt = function(onMqttMessageArrived, onMqttConnectionLost, mqttConnectSuccess){
          try{
              if(!mqttClient.host){
            	  var clientId = parseInt(Math.random() * 100, 10);
            	  console.log('MQTT >>>>>>>> BROKER: ', CONFIG.MQTT.MQTT_BROKER);
                  mqttClient = new Paho.MQTT.Client(CONFIG.MQTT.MQTT_BROKER, Number(CONFIG.MQTT.PORT), '/ws', 'gl_' + clientId);
                  mqttClient.onConnectionLost = onMqttConnectionLost;
                  mqttClient.onMessageArrived = function (message){
                  	console.log(message);
                  	onMqttMessageArrived(message);
                  };

                  var options = {
                      //timeout: 3,
                      onSuccess: mqttConnectSuccess,
                      onFailure: function (message) {
                          console.log("Connection failed: " + message.errorMessage);
                          mqttClient = {};
                      }
                  }

                  mqttClient.connect(options);
              }else{
              	console.log('MQTT ALREADY CONNECTED >>>>>>>>> ');
              	mqttConnectSuccess();
              	mqttClient.onMessageArrived = function (message){
                  	onMqttMessageArrived(message);
                  };
              }
          }catch(err){
              console.log('Error while connecting MQTT: >>> ', err);
              mqttClient = {};
          }
      };

      mqttClient.disConnectFromMqtt = function(){
          try{
              if(mqttClient.host){
                 mqttClient.disconnect();
              }
          }catch(err){
              console.log('Error: >>> ' +JSON.stringify(err));
          }
      };

      mqttClient.publishToMqtt =  function(publishToTopic, msgToPublish, onMqttMessageArrived){
          var message = new Paho.MQTT.Message(msgToPublish);
          message.destinationName = publishToTopic;
          if(!mqttClient.host){
              try{
                  mqttClient = new Paho.MQTT.Client(CONFIG.MQTT.MQTT_BROKER, Number(80), '/ws', 'gl_' + parseInt(Math.random() * 100, 10));
                  mqttClient.onConnectionLost = this.onConnectionLost;
                  mqttClient.onMessageArrived = onMqttMessageArrived;

                  var options = {
                      //timeout: 3,
                      onSuccess: function(){
                          mqttClient.send(message);
                          subscribeToMqtt(CONFIG.MQTT.TOPIC_PREFIX+'+/cloud');
                      },
                      onFailure: function (message) {
                          alert("Connection failed: " + message.errorMessage);
                      }
                  }

                  mqttClient.connect(options);
              }catch(err){
                  console.log('Error: >>> ' +JSON.stringify(err));
              }
          }else{
              try{
                  console.log('Going to publish message: >>> ' +message);
                  mqttClient.send(message);
              }catch(err){
                  console.log('Error: >>> ', err);
              }

          }
      };

      mqttClient.subscribeAfterConnect =  function() {
          // Once a connection has been made, make a subscription and send a message.
          console.log("Connected to MQTT server ");
          mqttClient.subscribe(CONFIG.MQTT.TOPIC_PREFIX+"+/board");
      };

      mqttClient.publishAfterConnect =  function(message) {
          // Once a connection has been made, make a subscription and send a message.
          console.log('Going to publish message: >>> ', message);
          mqttClient.send(message);
      };

      mqttClient.subscribeToMqtt =  function(subscribeToTopic){
          if(!mqttClient.host){
              throw "No Connection with MQTT";
          }else{
              try{
                  console.log('Going to subscribe topic: >>> ', subscribeToTopic);
                  mqttClient.subscribe(subscribeToTopic);
              }catch(err){
                  console.log('Error: >>> ' +JSON.stringify(err));
              }
          }
      };
      
      mqttClient.unsubscribeToMqtt =  function(subscribeToTopic){
          if(!mqttClient.host){
              throw "No Connection with MQTT";
          }else{
              try{
                  console.log('Going to unsubscribe topic: >>> ' +subscribeToTopic);
                  mqttClient.unsubscribe(subscribeToTopic);
              }catch(err){
                  console.log('Error: >>> ' +JSON.stringify(err));
              }
          }
      };
	  

	  return mqttClient;
	
  }

	factory.$inject = ['CONFIG'];
	return factory;
});

