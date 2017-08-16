module.exports = function(router) {

  // var configEndpoint = require('./endpoints/configEndpoint.js')();
  var gatewayEndpoint = require('./endpoints/gatewayEndpoint.js')();
  var speechEndpoint = require('./endpoints/speechEndpoint.js')();

  router.get('/', function(req, res) {
    res.json({ message: 'Hukam IoT Gateway Server Running ... ' });
  });

  router.get('/gateway/info', gatewayEndpoint.gatewayInfo);
  router.post('/gateway/content', gatewayEndpoint.uploadContent);
  router.post('/command', gatewayEndpoint.handleCommand);
  router.post('/camera', gatewayEndpoint.cameraWebhook);
  
  router.get('/gateway/motion/detected', gatewayEndpoint.motionDetected);

  router.post('/stt/start', showClientRequest, speechEndpoint.listenCommands);
  router.post('/stt/stop', showClientRequest, speechEndpoint.stopSTT);

  router.get('/place', gatewayEndpoint.getPlace);
  router.get('/place/areas', gatewayEndpoint.getPlaceAreas);
  router.get('/place/boards', gatewayEndpoint.getAllBoards);
  router.post('/place/boards', gatewayEndpoint.getBoards);

  function showClientRequest(req, res, next) {
      var request = {
          REQUEST : {
              HEADERS: req.headers,
              BODY : req.body
          }
      }
      return next();
  }

/*

    router.post('/api/config/internetConfiguration', showClientRequest, configEndpoint.internetConfiguration);
    router.post('/api/command', gatewayEndpoint.handleCommand);

    router.post('/api/camera', gatewayEndpoint.cameraWebhook);

    router.post('/api/stt/start', showClientRequest, speechEndpoint.listenCommands);
    router.post('/api/stt/stop', showClientRequest, speechEndpoint.stopSTT);

    router.get('/api/place', gatewayEndpoint.getPlace);
    router.get('/api/place/areas', gatewayEndpoint.getPlaceAreas);
    router.get('/api/place/boards', gatewayEndpoint.getAllBoards);
    router.post('/api/place/boards', gatewayEndpoint.getBoards);

    function showClientRequest(req, res, next) {
        var request = {
            REQUEST : {
                HEADERS: req.headers,
                BODY : req.body
            }
        }
        return next();
    }

    function showMultipartRequest(req, res, next) {
    	var form = new multiparty.Form();
        form.parse(req, function(err, fields, files) {
          res.writeHead(200, {'content-type': 'text/plain'});
          res.write('received upload:\n\n');
          res.end(util.inspect({fields: fields, files: files}));
        });
        return next();
    }
    */

}
