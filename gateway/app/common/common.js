
'use strict';

var config = require('config');
const events = require('events');
var eventEmitter = new events.EventEmitter();

module.exports.CONFIG = function(name) {
  if(name){
    return config.get(name);
  }else{
    return config;
  }
    return {};
};

module.exports.EVENTS = function(){
    return eventEmitter;
}
