
//TODO: THIS ONE STILL NEEDS MORE WORK

var bleno = require('bleno');
var util = require('util');

var WiFiCharactristic = require('./WifiCharacteristic');

function HBuddyService() {

  bleno.PrimaryService.call(this, {
    uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb07',
    characteristics: [
      new WiFiCharactristic()     
    ]
  });
};

util.inherits(HBuddyService, bleno.PrimaryService);
module.exports = HBuddyService;