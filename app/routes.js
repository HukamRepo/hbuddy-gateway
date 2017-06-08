module.exports = function(app) {

  var configEndpoint = require('./endpoints/configEndpoint.js')();
  var gatewayEndpoint = require('./endpoints/gatewayEndpoint.js')();
  var speechEndpoint = require('./endpoints/speechEndpoint.js')();
  
    app.get('/', function(req, res){
        res.render('index');
    });

    app.get('/views/:name', showClientRequest, function (req, res) {
        var name = req.params.name;
        res.render('views/' + name);
    });

    app.get('/api/gateway/info', gatewayEndpoint.gatewayInfo);
    app.post('/api/gateway/content', gatewayEndpoint.uploadContent);
    
    app.post('/api/config/internetConfiguration', showClientRequest, configEndpoint.internetConfiguration);
    app.post('/api/command', gatewayEndpoint.handleCommand);
    
    app.post('/api/camera', gatewayEndpoint.cameraWebhook);
    
    app.post('/api/stt/start', showClientRequest, speechEndpoint.listenCommands);
    app.post('/api/stt/stop', showClientRequest, speechEndpoint.stopSTT);
    
    app.get('/api/place', gatewayEndpoint.getPlace);
    app.get('/api/place/areas', gatewayEndpoint.getPlaceAreas);
    app.get('/api/place/boards', gatewayEndpoint.getAllBoards);
    app.post('/api/place/boards', gatewayEndpoint.getBoards);

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
