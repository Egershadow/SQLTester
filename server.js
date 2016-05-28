
var express         = require('express');
var config          = require('./libs/config');

var path            = require('path');
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');

//logging
var intel           = require('intel');
var log             = require('./libs/log')('console', intel.DEBUG);

var app             = express();
var stylus          = require('stylus');
var nib             = require('nib');
var ServerApplication = require('./libs/server-application');

//removing of test dbs

const fs = require('fs');

fs.unlinkSync('/Users/vadimvoytenko/Desktop/dev/University/SQLTester/clinic.sqlite');
fs.unlinkSync('/Users/vadimvoytenko/Desktop/dev/University/SQLTester/university.sqlite');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
function compile(str, path) {
    return stylus(str)
        .set('filename', path)
        .use(nib())
}
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(stylus.middleware(
    { src: __dirname + '/public'
        , compile: compile
    }
));
app.use(express.static(__dirname + '/public'));
// used to create, sign, and verify tokens
var port = process.env.PORT || 8080;

var ConnectionFabric = require('./libs/connection-fabric');

ConnectionFabric.establishDefaultDBConnection( function (sequelize) {

    ServerApplication.establishConnectionToSubjectDBs(function () {

        //start listening of main port
        app.listen(config.get('port'), function () {
            log.info('Express server listening on port %s', config.get('port'));
            ServerApplication.startListenPollingSocket();
        });

        //configuring routers
        var routers = require('./routes/routers');
        app.use('/', routers);
    }, function (err) {
        log.error('Subject dbs connecting error occurred:', err);
    });
}, function(err) {
    log.error('Unable to connect to main database:', err);
});


