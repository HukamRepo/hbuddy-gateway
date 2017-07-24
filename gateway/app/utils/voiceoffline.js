'use strict'

const record = require('node-record-lpcm16')
const stream = require('stream')
const {Detector, Models} = require('snowboy')

const ERROR = {
  NOT_STARTED : "NOT_STARTED",
  INVALID_INDEX : "INVALID_INDEX"
}

const CloudSpeechRecognizer = {}
CloudSpeechRecognizer.init = recognizer => {
  const csr = new stream.Writable()
  csr.listening = false
  csr.recognizer = recognizer
  return csr
}

CloudSpeechRecognizer.startStreaming = (options, audioStream, cloudSpeechRecognizer) => {
  console.log("IN startStreaming to STT on Cloud, isListening:>>>> ", cloudSpeechRecognizer.listening);
  if (cloudSpeechRecognizer.listening) {
    return
  }

  cloudSpeechRecognizer.listening = true

  const recognizer = cloudSpeechRecognizer.recognizer
  const recognitionStream = recognizer.createRecognizeStream({
    config: {
      encoding: 'LINEAR16',
      sampleRate: 16000,
      languageCode: options.language
    },
    singleUtterance: true,
    interimResults: false,
    verbose: true
  })

  recognitionStream.on('error', err => {
	  cloudSpeechRecognizer.emit('error', err)
	  cloudSpeechRecognizer.listening = false
	  audioStream.unpipe(recognitionStream)
	})


  recognitionStream.on('data', data => {
    if (data) {
      cloudSpeechRecognizer.emit('data', data)
      if (data.endpointerType === 'END_OF_UTTERANCE') {
        cloudSpeechRecognizer.listening = false
        audioStream.unpipe(recognitionStream)
      }
    }
  })

  audioStream.pipe(recognitionStream)
}

const VoiceOffline = {}
VoiceOffline.annyang = require(require('path').resolve(__dirname, '../utils/annyang-core.js'));  //require('annyang-core.js')

VoiceOffline.init = (options, recognizer) => {
  // don't mutate options
  const opts = Object.assign({}, options),
    models = new Models(),
    voiceoffline = new stream.Writable(),
    csr = CloudSpeechRecognizer.init(recognizer)
    
    csr.on("error", function(err){
    	console.log("Error: >>> ", err);
    });
    
  voiceoffline.mic = {}
  voiceoffline.started = false

  // If we don't have any hotwords passed in, add the default global model
  opts.hotwords = opts.hotwords || [1]
  opts.hotwords.forEach(model => {
    models.add({
      file: model.file || 'node_modules/snowboy/resources/snowboy.umdl',
      sensitivity: model.sensitivity || '0.5',
      hotwords: model.hotwords || 'default'
    })
  })

  // defaults
  opts.models = models
  opts.resource = opts.resource || 'node_modules/snowboy/resources/common.res'
  opts.audioGain = opts.audioGain || 2.0
  opts.language = opts.language || 'en-US' //https://cloud.google.com/speech/docs/languages

  const detector = voiceoffline.detector = new Detector(opts)

  detector.on('silence', () => voiceoffline.emit('silence'))
  detector.on('sound', () => voiceoffline.emit('sound'))

  // When a hotword is detected pipe the audio stream to speech detection
  detector.on('hotword', (index, hotword) => {
    voiceoffline.trigger(index, hotword)
  })

  csr.on('error', error => voiceoffline.emit('error', { streamingError: error }))

  let transcriptEmpty = true
  csr.on('data', data => {
		  if(data.error){
			  console.log("ERROR in Cloud STT: >>>  ", data.error);
			  voiceoffline.emit('error', { streamingError: data.error.message })
			  return;
		  }
		  
	    const result = data.results[0]
	    if (result) {
	    	if(result.isFinal){
			  console.log("Data from Cloud: >>> ", JSON.stringify(data));
	    	}
	      transcriptEmpty = false
	      if (result.isFinal) {
	        voiceoffline.emit('final-result', result.transcript)
	        VoiceOffline.annyang.trigger(result.transcript)
	        transcriptEmpty = true //reset transcript
	      } else {
	        voiceoffline.emit('partial-result', result.transcript)
	      }
	    } else if (data.endpointerType === 'END_OF_UTTERANCE' && transcriptEmpty) {
	      voiceoffline.emit('final-result', "")
	    }
  })

  voiceoffline.trigger = (index, hotword) => {
    if(voiceoffline.started){
      try{
        let triggerHotword = (index == 0)? hotword : models.lookup(index)
        voiceoffline.emit('hotword', index, triggerHotword)
        CloudSpeechRecognizer.startStreaming(opts, voiceoffline.mic, csr)
      } catch (e) {
        throw ERROR.INVALID_INDEX
      }
    } else {
      throw ERROR.NOT_STARTED
    }
  }

  return voiceoffline
}

VoiceOffline.start = voiceoffline => {
		voiceoffline.mic = record.start({
		    threshold: 0.5,
		    verbose: false,
		    recordProgram : 'rec'
		  })

		  voiceoffline.mic.pipe(voiceoffline.detector)
		  voiceoffline.started = true
}

VoiceOffline.trigger = (voiceoffline, index, hotword) => voiceoffline.trigger(index, hotword)

VoiceOffline.pause = voiceoffline => voiceoffline.mic.pause()

VoiceOffline.resume = voiceoffline => voiceoffline.mic.resume()

VoiceOffline.stop = () => record.stop()

module.exports = VoiceOffline
