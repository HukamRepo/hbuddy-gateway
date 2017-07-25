/**
 * Module dependencies
*/
var express  = require('express'),
	app = express(),
	server = require('http').createServer(app),
	http = require('http'),
	path = path = require('path'),
	uuid = require('uuid'),
	util = require('util'),
	watson = require('watson-developer-cloud');

var bluemix = require('./app/config/bluemix');

var vhost = 'hbuddy-gateway.local'
var port     = process.env.PORT || 9000;
var ip     = process.env.IP || "localhost";

app.configure(function() {
    // set up our express application
    app.set('port', port);
    // app.use(express.logger('dev')); // log every request to the console
    app.use(express.bodyParser()); // get information from html forms
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'keyboard cat' }));// persistent login sessions
    app.use(express.methodOverride());
    app.use(express.json({limit: '50mb'}));
    app.use(express.urlencoded({ extended: true }));

    app.use(express.session({ secret: 'keyboard cat' }));

});

/*
app.use(function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
	  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
	  next();
	});
*/

app.all('*', function(req, res,next) {
    var responseSettings = {
        "AccessControlAllowOrigin": req.headers.origin,
        "AccessControlAllowHeaders": "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
        "AccessControlAllowMethods": "POST, GET, PUT, DELETE, OPTIONS",
        "AccessControlAllowCredentials": true
    };

    res.header("Access-Control-Allow-Credentials", responseSettings.AccessControlAllowCredentials);
    res.header("Access-Control-Allow-Origin",  responseSettings.AccessControlAllowOrigin);
    res.header("Access-Control-Allow-Headers", (req.headers['access-control-request-headers']) ? req.headers['access-control-request-headers'] : "x-requested-with");
    res.header("Access-Control-Allow-Methods", (req.headers['access-control-request-method']) ? req.headers['access-control-request-method'] : responseSettings.AccessControlAllowMethods);

    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }

});



//require('./app/startup.js')(app);
require('./app/bootstrap.js')(app);
require('./app/routes.js')(app);

var sttEndpoint = require('./app/endpoints/sttEndpoint.js')(io);

app.use(app.router); //init routing

// development only
if (app.get('env') === 'development') {
    app.use(express.errorHandler());
};

// production only
if (app.get('env') === 'production') {
    // TODO
};

app.use(function (err, req, res, next) {
	  console.error(err.stack)
	  res.status(500).send('Something broke!')
	});

express.vhost(vhost, app);

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + vhost+":"+server.address().port);
});
//server.timeout = 2000;
