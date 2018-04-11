
//TODO: THIS ONE STILL NEEDS MORE WORK

var FACTORY = require('../common/commonFactory')(),
noble = require('noble'),
bleno = require('bleno'),
sensorTags = {},
interval,
ble;

var HBuddyService = require('../handlers/ble/hbuddyService');

var primaryService = new HBuddyService();

module.exports = function() {

var methods = {};

	methods.startAdvertising = function(){
		console.log("IN bluetoothHandler.startAdvertising: >> ");
		bleno.on('stateChange', function(state) {
			  console.log('on -> stateChange: ' + state);
			  if (state === 'poweredOn') {
			    bleno.startAdvertising('hBuddy', [primaryService.uuid]);
			  } else {
				bleno.stopAdvertising();
			  }
			});

		bleno.on('advertisingStart', function(error) {
			  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
			  if (!error) {
			    bleno.setServices([primaryService], function(error){
			      console.log('setServices: '  + (error ? 'error ' + error : 'success'));
			    });
			  }
		});

	}

	methods.connectSensorTags = function() {
		console.log("IN bluetoothHandler.connectSensorTag: >>> ");
		try{
			noble.startScanning();
			noble.on('stateChange', function(state) {
				  if (state === 'poweredOn') {
				    noble.startScanning();
				  } else {
				    noble.stopScanning();
				  }
				});

				noble.on('discover', function(peripheral) {
				    console.log('Found device with local name: ' + peripheral.advertisement.localName);
				    console.log('advertising the following service uuid\'s: ' + peripheral.advertisement.serviceUuids);
				    console.log();
				    peripheral.connect(function(error) {
				        console.log('connected to peripheral: ' + peripheral.uuid);
				        ble = peripheral;

				        peripheral.discoverServices(null, function(error, services) {
				            console.log('discovered the following services:');
				            for (var i in services) {
				            	var service = services[i];
				            	service.discoverCharacteristics(null, function(error, characteristics) {
					              console.log('\n\n ....................');
					              for (var j in characteristics) {
//					                console.log('  ',j , ': CHARACTERISTIC: >>> ', commonHandler.simpleStringify(characteristics[j]));
					                methods.readCharactristicData(characteristics[j]);
					              }
					            });
				            }
				          });
				      });
				});

		}catch(err){
			console.log("ERROR in connectSensorTags: >> ", err);
		}
	};

	methods.readCharactristicData = function(characteristic){
		characteristic.read(function(error, data){
			if(error){
				console.log("ERROR In reading data for ", characteristic.uuid, ": >>>", error);
			}else{
				console.log('\n\nFULL DATA for: >>> ', FACTORY.CommonHandler().simpleStringify(characteristic));
				console.log("DATA: >> ", String(data));
			}
		});
	};

	methods.disconnectSensorTags = function() {
		console.log("IN bluetoothHandler.disconnectSensorTags: >>> ");
		try{
			if(ble){
				ble.disconnect(function(error) {
			       console.log('disconnected from peripheral: ' + ble.uuid);
			    });
			}

		}catch(err){
			console.log("ERROR in disconnectSensorTags: >> ", err);
		}
	};

    return methods;

}
