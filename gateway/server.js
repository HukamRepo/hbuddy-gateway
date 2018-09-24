// Hukam IoT Gateway Server
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');

require('dotenv').config({path: process.env.PWD+"/.env"});

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('./app/startup.js')(app);
// ROUTES FOR OUR API
// =============================================================================
// create our router
var router = express.Router();
router.get('/', function(req, res) {
  res.json({ message: 'Hukam IoT Gateway Server Running ... ' });
});
require('./app/routes.js')(router);

// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// development only
if (app.get('env') === 'development') {
    console.log("DEVELOPMENT ENVIRONMENT >>>>>>");
};

// production only
if (app.get('env') === 'production') {
    console.log("PRODUCTION ENVIRONMENT >>>>>>");
};

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", '*');
   res.header("Access-Control-Allow-Credentials", true);
   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
   res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,Authorization');
   next();
 });

// app.use(function (err, req, res, next) {
// 	  console.error(err.stack)
// 	  res.status(500).send('Something broke!')
// 	});

// express.vhost(vhost, app);

app.listen(9000, function () {
    console.log('\n\n--------- Hukam IoT Gateway server listening on port 9000 ----------- \n\n');
});
