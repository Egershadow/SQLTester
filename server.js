
var express         = require('express');
var config          = require('./libs/config');

var path            = require('path'); // модуль для парсинга пути
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');

//logging
var intel           = require('intel');
var log             = require('./libs/log')('console', intel.DEBUG);

var app             = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, "public")));

// used to create, sign, and verify tokens
var port = process.env.PORT || 8080;

// connect to database

var mysqlDBConnection = require('./models/mysqlDBConnection');

// check database connection

mysqlDBConnection.authenticate().then(function(err) {

    if (!err) {

        log.info('Connected to db successfully!')
        mysqlDBConnection.sync().then(function() {

            //listening
            app.listen(config.get('port'), function () {
                log.info('Express server listening on port %s', config.get('port'))
            })
        })
    } else {
        log.error('Unable to connect to the database:', err)
    }
});

//routers

//var api = require('./routers/api');
//app.use('/api/v1', api);

