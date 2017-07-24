'use strict'
var cp = require('child_process');
var CONFIG = require('../app/config/config').get();
var fs = require('fs');
var watson = require('watson-developer-cloud');
var async = require('async');
var format = require('util').format;
require('date-util');
var request = require('request');

var recordingsPath = require('path').resolve(__dirname, '../recordings');
//var recordingsPath = "/tmp";//TODO: Change this later

var ttsCredentials = CONFIG.SERVICES_CONFIG.stt;
ttsCredentials.version = 'v1';
var text_to_speech = watson.text_to_speech(ttsCredentials);

function audioFilePath(text) {
    return require('path').resolve(__dirname, '../recordings/' + text.replace(/[^a-z0-9-_]/ig, '-') + '.opus');
}

function cacheAudio(text, next) {
    var outfile = audioFilePath(text);

    fs.exists(outfile, function(alreadyCached) {
        if (alreadyCached) {
            console.log('using cached audio: %s', outfile);
            return next(null,  outfile);
        } else {
            console.log('fetching audio: %s', text);

            var params = {
                text: text,
                //voice: 'en-US_MichaelVoice', // Optional voice
                accept: 'audio/ogg; codec=opus' //'audio/wav'
            };

            // Pipe the synthesized text to a file
            text_to_speech.synthesize(params)
                .pipe(fs.createWriteStream(outfile))
                .on('error', next)
                .on('close', function() {
                    return next(null, outfile);
                });
        }
    });
}

function playAudioFrom(which) {
    return function(next, results) {
        var filename = results[which];
        console.log('playing %s (%s)', which, filename);
        cp.exec(format('omxplayer -o local %s', filename), next);
    }
}

function getWeather(next) {
    console.log('fetching weather');
    var url =  "https://query.yahooapis.com/v1/public/yql?q=select item.condition from weather.forecast where woeid in (select woeid from geo.places(1) where text='New York City, NY')&format=json";
    request({
        url: url,
        json: true
    }, function (err, response, body) {
        if (err) {
            return next (err);
        }
        if (response.statusCode != 200) {
            return next(new Error(format("Unexpected status code %s from %s\n%s", response.statusCode, url, body)));
        }
        try {
            next(null, body.query.results.channel.item.condition);
        } catch(ex) {
            ex.message = format("Unexpected response format from %s - %s", url, ex.message);
            next(ex);
        }
    });
}

function getTimeAudio(next) {
    var now = new Date();
    now.setHours(now.getUTCHours() - 4); // EDT
    cacheAudio(format('The current time in New York City is %s.', now.format("h:MM")), next);
}

function getWeatherAudio(next, results) {
    cacheAudio(format('The current weather conditions are %s degrees and %s.', results.weather.temp, results.weather.text), next);
}

function playTimeAndDate() {
    // async.auto is magical
    async.auto({
        timeAudio: getTimeAudio,
        playTime: ['timeAudio', playAudioFrom('timeAudio')],
        weather: getWeather,
        weatherAudio: ['weather', getWeatherAudio],
        playWeather: ['playTime', 'weatherAudio', playAudioFrom('weatherAudio')]
    }, function(err, results) {
        if (err) {
            return console.error(err);
        }
        //console.log(results);
    });
}


console.log('ready for input, playing once to test');
playTimeAndDate();

